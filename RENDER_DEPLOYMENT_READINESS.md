# Render deployment readiness

Nothing in this pass was deployed, committed, or pushed. No paid Render plan was created. The Qwen LoRA directory `ml/models/autoscientist_qwen3_5_2b/` was not modified.

## Selected production model

`ml/models/offerguard_baseline.joblib`: TF-IDF (15,000 word unigrams and bigrams) plus class-weighted logistic regression, threshold 0.62.

It is the only predictor. `backend/app/services/inference_adapter.py` raises HTTP 503 through `ModelNotReady` when that file cannot be loaded. It does not call the LoRA and it does not run the heuristic demo. Suspicious-signal text still appears in the response, and it does not change the classifier label.

Holdout metrics and the Qwen comparison are in `evaluation/LIGHTWEIGHT_MODEL_EVALUATION.md`.

## Measured memory

Command: `python ml/benchmark_memory.py`

The script started `python backend/run.py` on `127.0.0.1:8765` with `OMP_NUM_THREADS`, `OPENBLAS_NUM_THREADS`, `MKL_NUM_THREADS`, and `NUMEXPR_NUM_THREADS` set to 1. It called `/api/ready`, `/api/health`, and `/api/analyze` (one fraud example plus 20 legitimate examples), then read the Windows process memory counters.

| Measurement | Value |
| --- | --- |
| Python | 3.13.11, 64-bit, this Windows machine |
| Process id | 21440 |
| Working set after the requests | 190,025,728 bytes (181.22 MiB) |
| Peak working set | 190,025,728 bytes (181.22 MiB) |
| Render Free limit | 512 MB |
| Target used for this task | 400 MB |
| Under the 400 MB target | yes |
| Health `model_ready` | true |
| Health `is_demo_mode` | false |
| Sample prediction | FRAUDULENT, `is_demo_mode` false |

This is the Windows working set of that process. It is not a measurement from inside a Render Linux container. 181 MiB leaves more than 300 MB under the 512 MB plan. The raw record is `evaluation/memory_benchmark.json`.

## What was verified locally

| Check | Result |
| --- | --- |
| `python -m unittest backend.tests.test_api` | 11 tests, OK |
| `npm run build` in `frontend` | succeeded (`tsc -b && vite build`) |
| Holdout scoring | 2,291 / 2,291 rows, independence overlap 0 |
| API memory benchmark | peak working set 181.22 MiB |

## Render blueprint

`render.yaml` defines two free services in Singapore:

| Service | Runtime | Start / publish |
| --- | --- | --- |
| `offerguard-api` | Python web, plan `free` | `python backend/run.py`, health check `/api/health` |
| `offerguard-web` | static | build `cd frontend && npm ci && npm run build`, publish `frontend/dist` |

API environment:

| Variable | Value |
| --- | --- |
| `HOST` | `0.0.0.0` |
| `PORT` | supplied by Render and read in `backend/run.py` |
| `PYTHON_VERSION` | `3.12.8` |
| `MODEL_PROVIDER` | `baseline` (the process still serves the joblib if this is changed) |
| `OFFERGUARD_MODEL_PATH` | `ml/models/offerguard_baseline.joblib` |
| `CORS_ORIGINS` | `RENDER_EXTERNAL_URL` of `offerguard-web` |
| `OMP_NUM_THREADS`, `OPENBLAS_NUM_THREADS`, `MKL_NUM_THREADS`, `NUMEXPR_NUM_THREADS` | `1` |

The API install command is `pip install -r backend/requirements.txt`. That file pins `scikit-learn==1.9.1`, which is the version that wrote the joblib. It does not install PyTorch. Do not point the Render build at `backend/requirements-inference.txt`.

Frontend `VITE_API_BASE_URL` is the API service’s `RENDER_EXTERNAL_URL`. The client appends `/api` when that value does not already end in `/api`.

SPA routing is a rewrite from `/*` to `/index.html`. Hashed files under `/assets/*` are cached for one year. Both services send `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: no-referrer`. The API also sets `Permissions-Policy` and allows only `GET`, `POST`, and `OPTIONS` from the configured origins. Credentials are not allowed, and `*` is not an origin. Analysis is limited to 30 requests per minute per client. Request logs do not include the job text.

`/api/health` returns 200 when the process is up and includes `model_ready`. `/api/ready` returns 503 until the joblib has loaded. Render’s health check uses `/api/health` so a free-instance spin-up is not failed by the separate readiness route.

## Before a future deploy

1. Commit and push the API, frontend, `render.yaml`, `backend/requirements.txt`, `ml/models/offerguard_baseline.joblib`, and `evaluation/lightweight_baseline_holdout.json`. Leave `ml/models/autoscientist_qwen3_5_2b/` untracked. Do not commit `backend/.env` or any API key.
2. In the Render dashboard, open the Blueprint for this Git repository and apply `render.yaml`. Choose the existing free workspace. Do not select a paid plan.
3. Confirm the API build log installs only `backend/requirements.txt` and the start command is `python backend/run.py`.
4. After the first deploy, open `https://<api-host>/api/health` and `https://<api-host>/api/ready`. Both should report the TF-IDF logistic regression, with `is_demo_mode` false and `model_ready` / `ready` true.
5. Open the static site, run one scan, and confirm the badge says `Trained TF-IDF logistic regression`.
6. If the browser blocks API calls, set `CORS_ORIGINS` on the API to the exact static-site origin, with no trailing slash and no wildcard.

Free web services spin down after about 15 minutes without traffic. The first request after that starts the process again. The filesystem is ephemeral; the classifier has to stay in Git because a file written after deploy will disappear on restart.

## Ready for Render Free?

The application is ready to deploy on the free 512 MB web service. The production model is the logistic regression, its independent holdout fraud F1 is 77.95%, and the measured API peak working set on this machine is 181.22 MiB. It is not deployed yet.
