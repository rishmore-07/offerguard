"""Measure the production API process memory on this machine.

Starts one uvicorn process with the same thread limits as render.yaml,
sends health, readiness, and analysis requests, then reads the Windows
process peak working set. This is the measured process memory, not an estimate.
"""
from __future__ import annotations

import ctypes
import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORT = 8765
OUT = ROOT / "evaluation" / "memory_benchmark.json"


class PROCESS_MEMORY_COUNTERS(ctypes.Structure):
    _fields_ = [
        ("cb", ctypes.c_ulong),
        ("PageFaultCount", ctypes.c_ulong),
        ("PeakWorkingSetSize", ctypes.c_size_t),
        ("WorkingSetSize", ctypes.c_size_t),
        ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
        ("QuotaPagedPoolUsage", ctypes.c_size_t),
        ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
        ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
        ("PagefileUsage", ctypes.c_size_t),
        ("PeakPagefileUsage", ctypes.c_size_t),
    ]


def memory_bytes(pid: int) -> tuple[int, int]:
    handle = ctypes.windll.kernel32.OpenProcess(0x0400 | 0x0010, False, pid)
    if not handle:
        raise OSError(f"OpenProcess failed for pid {pid}")
    counters = PROCESS_MEMORY_COUNTERS()
    counters.cb = ctypes.sizeof(counters)
    ok = ctypes.windll.psapi.GetProcessMemoryInfo(handle, ctypes.byref(counters), counters.cb)
    ctypes.windll.kernel32.CloseHandle(handle)
    if not ok:
        raise OSError("GetProcessMemoryInfo failed")
    return int(counters.WorkingSetSize), int(counters.PeakWorkingSetSize)


def request(method: str, path: str, payload: dict | None = None) -> dict:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(f"http://127.0.0.1:{PORT}{path}", data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> None:
    env = os.environ.copy()
    env.update({
        "HOST": "127.0.0.1",
        "PORT": str(PORT),
        "OMP_NUM_THREADS": "1",
        "OPENBLAS_NUM_THREADS": "1",
        "MKL_NUM_THREADS": "1",
        "NUMEXPR_NUM_THREADS": "1",
        "PYTHONUNBUFFERED": "1",
    })
    process = subprocess.Popen(
        [sys.executable, "backend/run.py"],
        cwd=ROOT,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    samples = []
    try:
        deadline = time.time() + 40
        ready = None
        while time.time() < deadline:
            if process.poll() is not None:
                output = process.stdout.read() if process.stdout else ""
                raise RuntimeError(f"Server exited early:\n{output}")
            try:
                ready = request("GET", "/api/ready")
                break
            except Exception:
                time.sleep(0.4)
        if ready is None:
            raise RuntimeError("Server did not become ready within 40 seconds")

        health = request("GET", "/api/health")
        analysis = request("POST", "/api/analyze", {
            "text": "Deposit 1000 rupees registration fee to start data entry job.",
            "title": "Data entry",
        })
        for _ in range(20):
            request("POST", "/api/analyze", {
                "text": "Infosys requires Senior Java Developer with Spring Boot experience in Bangalore.",
                "title": "Engineer",
            })
            working_set, peak = memory_bytes(process.pid)
            samples.append({"working_set_bytes": working_set, "peak_working_set_bytes": peak})

        working_set, peak = memory_bytes(process.pid)
        report = {
            "pid": process.pid,
            "python": sys.version,
            "port": PORT,
            "thread_limits": "OMP/OPENBLAS/MKL/NUMEXPR = 1",
            "health_model_ready": health.get("model_ready"),
            "health_demo_mode": health.get("is_demo_mode"),
            "sample_prediction": analysis.get("prediction"),
            "sample_is_demo_mode": analysis.get("is_demo_mode"),
            "working_set_bytes": working_set,
            "peak_working_set_bytes": peak,
            "peak_working_set_mb": round(peak / (1024 * 1024), 2),
            "working_set_mb": round(working_set / (1024 * 1024), 2),
            "samples": len(samples),
            "render_free_limit_mb": 512,
            "target_mb": 400,
            "under_target": peak < 400 * 1024 * 1024,
        }
    finally:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
