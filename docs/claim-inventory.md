# MetalBench v1 claim inventory

Public launch records below are transcribed from local notes. They are **documented local results**, not reproduced runs. Raw artifacts are currently unavailable.

| Public record | Source | Source date | Configuration | Claim | Limitations |
|---|---|---|---|---|---|
| Qwen3.6 agent run | `unraid-qwen38-notes.md` | 2026-08-28 | Qwen3.6 NVFP4, FreeToken, RTX 3060 + CPU offload | 7/9; about 58–65 tok/s | Note transcription; raw run unavailable; speed is an observed range |
| Flash-Next agent run | `unraid-qwen38-notes.md` | 2026-08-28 | Flash-Next Q3_K_XL, llama.cpp, `--cpu-moe` | 9/9; about 14.5 tok/s | Note transcription; raw run unavailable |
| Flash-Next quant battery | `unraid-qwen38-notes.md` | 2026-08-29 | Flash-Next IQ3_XXS, llama.cpp, 16 threads | 41/42; 16.92 tok/s | Separate 42-question battery; never inherits the Q3_K_XL 9/9 score |
| MTP finding | `unraid-qwen38-notes.md` | 2026-08-29 | Flash-Next, llama.cpp MTP | about 0.8 acceptance; 13.6–14 tok/s versus 14.67 baseline | No wall-clock improvement; note transcription; raw run unavailable |
| Qwen3.8 fingerprint | `Qwen3.8-27B — Deploy, Benchmarks, Verdict` | 2026-08-18 | 4-bit, rapid-mlx 0.12.12, M5 Pro 48 GB | 308/317; 14–15 tok/s | Obsidian transcription; raw result files not public |
| Qwen3.8 quant battery | same as above | 2026-08-18 | 4-bit, AXQ 6-bit, and 8-bit on rapid-mlx | 31/33 at 14–15; 30/33 at 13.3; 30/33 at 9.05 tok/s | Same model-level misses; raw result files not public |
| Qwen3.8 engine probe | same as above | 2026-08-18 | LM Studio NAX MTPLX, 32K context | 254 tok/s prefill; 12.4–12.8 tok/s decode | Throughput only, not a quality score |
| Gemma 4 QAT Q8 | `Gemma 4 12B QAT Q8` | 2026-08-09 | rapid-mlx, M5 Pro 48 GB | 68/76; about 7 tok/s | Obsidian transcription; raw harness output not public |
| Gemma 4 QAT Q4 | `Gemma 4 12B QAT Q4` | 2026-08-09 | rapid-mlx, M5 Pro 48 GB | 66/76; about 7.4 tok/s | Obsidian transcription; raw harness output not public |
| LFM2.5 8B-A1B | `LFM2.5-8B-A1B` | 2026-08-09 | rapid-mlx, MLX 8-bit, M5 Pro 48 GB | 53/58; 107 tok/s | Obsidian transcription; raw harness output not public |
| LFM2.5 2.6B | `LFM2.5-2.6B` | 2026-08-09 | rapid-mlx, MLX 8-bit, M5 Pro 48 GB | 53/58; 76.8 tok/s | Obsidian transcription; raw harness output not public |
| Ternary Bonsai 27B | `Ternary Bonsai 27B` | 2026-08-09 | rapid-mlx, MLX 2-bit, M5 Pro 48 GB | 53/58; 6.4 tok/s | Literal score retained despite two documented grader artifacts |
| Maple Preview 20B | `Maple-Preview 20B` | 2026-08-09 | DeepGrove mlx-lm fork, M5 Pro 48 GB | 46/58; 172.5 tok/s | Runtime lacked native tools, producing all six research misses |

## Excluded

- “Low reasoning retained 9/9” stays private until raw output establishes whether the run covered five or nine tasks.
