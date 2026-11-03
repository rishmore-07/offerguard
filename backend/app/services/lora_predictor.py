"""Local Transformers + PEFT inference for the Adaption AutoScientist Qwen3.5-2B LoRA checkpoint.

The model is loaded once per process. Predictions use the training instruction
string as the user message and the Qwen3.5 chat template with thinking disabled.
Confidence is not invented: this classifier returns only the parsed label.
"""
from __future__ import annotations

import json
import logging
import threading
from pathlib import Path
from typing import Optional

from backend.app.config import PROJECT_ROOT

logger = logging.getLogger("OfferGuard-LoRAPredictor")

CHECKPOINT_DIR = PROJECT_ROOT / "ml" / "models" / "autoscientist_qwen3_5_2b"
BASE_MODEL_ID = "Qwen/Qwen3.5-2B"

INSTRUCTION_PREFIX = (
    "Classify this job advertisement using only one label: "
    "LEGITIMATE or FRAUDULENT. A label is a risk prediction, not "
    "independent verification of a company.\n\n"
)


def to_training_instruction(text: str) -> str:
    """Preserve a full training instruction. Wrap raw job text in the same prefix."""
    stripped = text.strip()
    if stripped.startswith("Classify this job advertisement using only one label:"):
        return stripped
    return INSTRUCTION_PREFIX + stripped


def parse_label(generated: str) -> Optional[str]:
    """Return the first explicit training label, ignoring later commentary."""
    cleaned = generated.replace("<think>", " ").replace("</think>", " ")
    upper = cleaned.upper()
    fraud_at = upper.find("FRAUDULENT")
    legit_at = upper.find("LEGITIMATE")
    if fraud_at < 0 and legit_at < 0:
        return None
    if fraud_at < 0:
        return "LEGITIMATE"
    if legit_at < 0:
        return "FRAUDULENT"
    return "FRAUDULENT" if fraud_at < legit_at else "LEGITIMATE"


class LocalQwenLoRAPredictor:
    def __init__(self, checkpoint_dir: Optional[Path] = None):
        self.checkpoint_dir = Path(checkpoint_dir or CHECKPOINT_DIR)
        self.model = None
        self.tokenizer = None
        self.is_loaded = False
        self.inference_verified = False
        self.load_error: Optional[str] = None
        self.loader_name: Optional[str] = None
        self._lock = threading.Lock()

    def weights_present(self) -> bool:
        return (self.checkpoint_dir / "adapter_model.safetensors").exists() or (
            self.checkpoint_dir / "adapter_model.bin"
        ).exists()

    def load_model(self, base_model_id: str = BASE_MODEL_ID) -> None:
        """Load the base model and the trained adapter exactly once."""
        if self.is_loaded:
            return
        with self._lock:
            if self.is_loaded:
                return
            try:
                self._load_unlocked(base_model_id)
                self.load_error = None
            except Exception as exc:
                self.is_loaded = False
                self.model = None
                self.tokenizer = None
                self.load_error = f"{type(exc).__name__}: {exc}"
                logger.error("Failed to load local LoRA model: %s", self.load_error)
                raise

    def _adapter_base_id(self, fallback: str) -> str:
        config_path = self.checkpoint_dir / "adapter_config.json"
        if not config_path.exists():
            return fallback
        try:
            data = json.loads(config_path.read_text(encoding="utf-8"))
        except Exception:
            return fallback
        return data.get("base_model_name_or_path") or fallback

    def _load_unlocked(self, base_model_id: str) -> None:
        import torch
        from peft import PeftModel
        from transformers import AutoTokenizer

        if not self.weights_present():
            raise FileNotFoundError(f"LoRA adapter weights not found at {self.checkpoint_dir}")

        base_model_id = self._adapter_base_id(base_model_id)
        if base_model_id.startswith("togethercomputer/"):
            # Adaption recorded a Together mirror that is not a public Hub repo.
            # The checkpoint config matches the official Qwen/Qwen3.5-2B release.
            base_model_id = BASE_MODEL_ID
        tokenizer_source = (
            str(self.checkpoint_dir)
            if (self.checkpoint_dir / "tokenizer_config.json").exists()
            else base_model_id
        )
        logger.info("Loading tokenizer from %s", tokenizer_source)
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_source, trust_remote_code=True)
        if self.tokenizer.pad_token_id is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        use_cuda = torch.cuda.is_available()
        dtype = torch.bfloat16 if use_cuda else torch.float32
        load_kwargs = {
            "torch_dtype": dtype,
            "trust_remote_code": True,
            "low_cpu_mem_usage": True,
            "disable_mmap": True,
        }
        if use_cuda:
            load_kwargs["device_map"] = {"": 0}

        base_model, loader_name = self._load_base(base_model_id, load_kwargs, self.checkpoint_dir)
        logger.info("Applying LoRA adapter from %s", self.checkpoint_dir)
        self.model = PeftModel.from_pretrained(base_model, str(self.checkpoint_dir))
        self.model.eval()
        self.loader_name = loader_name
        self.is_loaded = True
        logger.info("Loaded fine-tuned Qwen3.5-2B LoRA with %s", loader_name)

    def _load_base(self, base_model_id: str, load_kwargs: dict, checkpoint_dir: Path):
        errors = []
        local_config = checkpoint_dir / "config.json"
        architectures = []
        if local_config.exists():
            try:
                architectures = json.loads(local_config.read_text(encoding="utf-8")).get("architectures") or []
            except Exception:
                architectures = []

        # The saved checkpoint is the multimodal Qwen3.5 class. LoRA targets the
        # language projections and excludes the vision tower, so the base class
        # has to stay Qwen3_5ForConditionalGeneration.
        if "Qwen3_5ForConditionalGeneration" in architectures or not architectures:
            try:
                model = self._stream_conditional_model(base_model_id)
                return model, "Qwen3_5ForConditionalGeneration"
            except Exception as exc:
                errors.append(f"stream load: {type(exc).__name__}: {exc}")
                logger.warning("Streaming Qwen3.5 load failed: %s", exc)
            try:
                from transformers import Qwen3_5ForConditionalGeneration

                model = Qwen3_5ForConditionalGeneration.from_pretrained(base_model_id, **load_kwargs)
                return model, "Qwen3_5ForConditionalGeneration"
            except Exception as exc:
                errors.append(f"Qwen3_5ForConditionalGeneration: {type(exc).__name__}: {exc}")
                logger.warning("Conditional generation loader failed: %s", exc)

        try:
            from transformers import AutoConfig, Qwen3_5ForCausalLM

            config = AutoConfig.from_pretrained(base_model_id, trust_remote_code=True)
            text_config = getattr(config, "text_config", config)
            model = Qwen3_5ForCausalLM.from_pretrained(base_model_id, config=text_config, **load_kwargs)
            return model, "Qwen3_5ForCausalLM"
        except Exception as exc:
            errors.append(f"Qwen3_5ForCausalLM: {type(exc).__name__}: {exc}")
            raise RuntimeError("Unable to load the Qwen3.5-2B base model. " + " | ".join(errors)) from exc

    def _weight_file(self, base_model_id: str) -> Path:
        from huggingface_hub import hf_hub_download

        index_path = hf_hub_download(base_model_id, "model.safetensors.index.json")
        index = json.loads(Path(index_path).read_text(encoding="utf-8"))
        names = sorted(set(index.get("weight_map", {}).values()))
        if len(names) != 1:
            raise RuntimeError(f"Expected one weight shard, found {names}")
        return Path(hf_hub_download(base_model_id, names[0]))

    def _stream_conditional_model(self, base_model_id: str):
        """Copy one safetensors tensor at a time onto the GPU.

        Windows cannot memory-map the 4.3 GB checkpoint when the page file is small.
        """
        import struct
        import torch
        from accelerate import init_empty_weights
        from accelerate.utils import set_module_tensor_to_device
        from transformers import AutoConfig, Qwen3_5ForConditionalGeneration

        dtype_map = {
            "BF16": torch.bfloat16,
            "F16": torch.float16,
            "F32": torch.float32,
            "F64": torch.float64,
            "I64": torch.int64,
            "I32": torch.int32,
            "I16": torch.int16,
            "I8": torch.int8,
            "U8": torch.uint8,
            "BOOL": torch.bool,
        }
        if not torch.cuda.is_available():
            raise RuntimeError("Streaming load needs a CUDA device on this machine.")

        config = AutoConfig.from_pretrained(base_model_id, trust_remote_code=True)
        with init_empty_weights():
            model = Qwen3_5ForConditionalGeneration(config)
        weight_path = self._weight_file(base_model_id)
        logger.info("Streaming %s onto CUDA", weight_path.name)
        with weight_path.open("rb") as handle:
            header_len = struct.unpack("<Q", handle.read(8))[0]
            header = json.loads(handle.read(header_len))
            data_base = 8 + header_len
            names = [name for name in header if name != "__metadata__"]
            for index, name in enumerate(names, start=1):
                meta = header[name]
                start, end = meta["data_offsets"]
                handle.seek(data_base + start)
                raw = handle.read(end - start)
                tensor = torch.frombuffer(bytearray(raw), dtype=dtype_map[meta["dtype"]]).reshape(meta["shape"])
                try:
                    set_module_tensor_to_device(model, name, "cuda", value=tensor)
                except Exception:
                    logger.warning("Skipped tensor not present on the text model: %s", name)
                del raw, tensor
                if index % 200 == 0 or index == len(names):
                    print(f"Placed {index}/{len(names)} tensors", flush=True)
        model.tie_weights()
        model.eval()
        return model

    def format_prompt(self, instruction: str) -> str:
        if self.tokenizer is None:
            raise RuntimeError("Tokenizer is not loaded.")
        messages = [{"role": "user", "content": instruction}]
        try:
            return self.tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True,
                enable_thinking=False,
            )
        except TypeError:
            return self.tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True,
            )

    def predict_raw(self, text: str, already_instruction: bool = False) -> dict:
        """Run one deterministic generation. Does not read or require a label."""
        if not self.is_loaded or self.model is None or self.tokenizer is None:
            raise RuntimeError(self.load_error or "LoRA model is not loaded.")

        import torch

        instruction = text if already_instruction else to_training_instruction(text)
        prompt = self.format_prompt(instruction)
        inputs = self.tokenizer(prompt, return_tensors="pt", truncation=True, max_length=2048)
        device = next(self.model.parameters()).device
        inputs = {key: value.to(device) for key, value in inputs.items()}

        with self._lock:
            with torch.inference_mode():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=24,
                    do_sample=False,
                    pad_token_id=self.tokenizer.pad_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                )

        new_tokens = outputs[0][inputs["input_ids"].shape[1]:]
        raw = self.tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
        label = parse_label(raw)
        if label is not None:
            self.inference_verified = True
        return {
            "label": label,
            "raw": raw,
            "loader": self.loader_name,
        }

    def predict(self, text: str) -> tuple[str, None]:
        result = self.predict_raw(text, already_instruction=False)
        if result["label"] is None:
            raise RuntimeError("Model output was not a valid LEGITIMATE or FRAUDULENT label.")
        return result["label"], None


local_lora_predictor = LocalQwenLoRAPredictor()
