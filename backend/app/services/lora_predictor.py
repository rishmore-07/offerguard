"""Local Transformers + PEFT inference server for downloaded Adaption AutoScientist Qwen3.5-2B LoRA checkpoint.
"""
import logging
from pathlib import Path
from typing import Optional, Tuple

from backend.app.config import PROJECT_ROOT

logger = logging.getLogger("OfferGuard-LoRAPredictor")

CHECKPOINT_DIR = PROJECT_ROOT / "ml" / "models" / "autoscientist_qwen3_5_2b"

INSTRUCTION_WRAPPER = (
    "Classify this job advertisement using only one label: "
    "LEGITIMATE or FRAUDULENT. A label is a risk prediction, not "
    "independent verification of a company.\n\n"
)


class LocalQwenLoRAPredictor:
    def __init__(self, checkpoint_dir: Optional[Path] = None):
        self.checkpoint_dir = checkpoint_dir or CHECKPOINT_DIR
        self.model = None
        self.tokenizer = None
        self.is_loaded = False

    def load_model(self, base_model_id: str = "Qwen/Qwen3.5-2B"):
        """Load base Qwen model and apply downloaded LoRA adapter."""
        try:
            import torch
            from transformers import AutoTokenizer, AutoModelForCausalLM
            from peft import PeftModel

            adapter_path = self.checkpoint_dir
            if not (adapter_path / "adapter_model.safetensors").exists():
                raise FileNotFoundError(f"LoRA adapter weights not found at {adapter_path}")

            logger.info(f"Loading tokenizer from {adapter_path}...")
            self.tokenizer = AutoTokenizer.from_pretrained(str(adapter_path), trust_remote_code=True)

            logger.info(f"Loading base model {base_model_id}...")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            torch_dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32

            base_model = AutoModelForCausalLM.from_pretrained(
                base_model_id,
                torch_dtype=torch_dtype,
                device_map="auto" if torch.cuda.is_available() else None,
                trust_remote_code=True
            )

            logger.info(f"Applying LoRA adapter from {adapter_path}...")
            self.model = PeftModel.from_pretrained(base_model, str(adapter_path))
            self.model.eval()
            self.is_loaded = True
            logger.info("Successfully loaded fine-tuned Qwen3.5-2B LoRA model.")
        except Exception as e:
            logger.error(f"Failed to load local LoRA model: {e}")
            self.is_loaded = False
            raise e

    def predict(self, text: str) -> Tuple[str, float]:
        """Run deterministic binary prediction on input text."""
        if not self.is_loaded or self.model is None or self.tokenizer is None:
            raise RuntimeError("LoRA model is not loaded.")

        import torch

        prompt = INSTRUCTION_WRAPPER + text
        inputs = self.tokenizer(prompt, return_tensors="pt")
        if torch.cuda.is_available():
            inputs = {k: v.cuda() for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=8,
                do_sample=False,
                temperature=0.0
            )

        output_text = self.tokenizer.decode(outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True).strip()
        
        # Normalize to LEGITIMATE or FRAUDULENT
        if "FRAUDULENT" in output_text.upper() or "FAKE" in output_text.upper():
            return "FRAUDULENT", 92.0
        else:
            return "LEGITIMATE", 15.0


local_lora_predictor = LocalQwenLoRAPredictor()
