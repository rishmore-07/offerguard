# OfferGuard LoRA evaluation

Split: `test`
Model: Qwen/Qwen3.5-2B + Adaption AutoScientist LoRA (experiment 07db89e9-7722-4897-9c2f-fc384482dc91).
The Adaption win rate is a training-search statistic. It is not this accuracy number.

- Rows in split: 2291
- Rows scored: 2291
- Valid predictions: 2291
- Invalid or ambiguous outputs: 0 (0.00%)
- Coverage: 100.00%

Metrics below are computed only on valid predictions.

- Accuracy: 95.68%
- FRAUDULENT precision: 52.15%
- FRAUDULENT recall: 80.19%
- FRAUDULENT F1: 63.20%
- Macro F1: 80.45%
- Weighted F1: 96.11%
- Confusion matrix (expected x predicted, labels LEGITIMATE then FRAUDULENT): [[2107, 78], [21, 85]]
- TN 2107, FP 78, FN 21, TP 85
- Always-LEGITIMATE baseline accuracy: 95.37%
- Always-LEGITIMATE baseline macro F1: 48.82%
- Average inference latency: 0.618s
- p95 inference latency: 0.819s
