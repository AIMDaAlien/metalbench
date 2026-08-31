# MetalBench v1 claim inventory

Public launch records below are transcribed from local notes. They are **documented local results**, not reproduced runs. Raw artifacts are currently unavailable.

| Public record | Source | Source date | Configuration | Claim | Limitations |
|---|---|---|---|---|---|
| Qwen3.6 agent run | `unraid-qwen38-notes.md` | 2026-08-28 | Qwen3.6 NVFP4, FreeToken, RTX 3060 + CPU offload | 7/9; about 58–65 tok/s | Note transcription; raw run unavailable; speed is an observed range |
| Flash-Next agent run | `unraid-qwen38-notes.md` | 2026-08-28 | Flash-Next Q3_K_XL, llama.cpp, `--cpu-moe` | 9/9; about 14.5 tok/s | Note transcription; raw run unavailable |
| Flash-Next quant battery | `unraid-qwen38-notes.md` | 2026-08-29 | Flash-Next IQ3_XXS, llama.cpp, 16 threads | 41/42; 16.92 tok/s | Separate 42-question battery; never inherits the Q3_K_XL 9/9 score |
| MTP finding | `unraid-qwen38-notes.md` | 2026-08-29 | Flash-Next, llama.cpp MTP | about 0.8 acceptance; 13.6–14 tok/s versus 14.67 baseline | No wall-clock improvement; note transcription; raw run unavailable |

## Excluded

- “Low reasoning retained 9/9” stays private until raw output establishes whether the run covered five or nine tasks.
