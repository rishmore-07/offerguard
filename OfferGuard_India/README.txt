OfferGuard India - Adaption AutoScientist starter

1. Download EMSCAD fake_job_postings.csv from:
   https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction
2. Put the downloaded fake_job_postings.csv in this folder.
3. In a terminal opened to this folder:
   python -m pip install pandas scikit-learn datasets pyarrow "adaption>=0.7.0"
   python prepare_data.py
4. Upload offerguard_train.csv (only) in Adaption Adaptive Data dashboard.
   Map instruction -> Prompt; response -> Completion.
   Choose instruction dataset; don't generate/rewrite the completion labels.
5. After Adaptive Data completes, open AutoScientist, select its dataset,
   pick Tiny, map prompt/completion, disable reasoning and review training cost.
6. Alternative to steps 4-5: use the raw API script:
   PowerShell: $env:ADAPTION_API_KEY="YOUR_KEY"
   Windows cmd: set ADAPTION_API_KEY=YOUR_KEY
   Linux/macOS: export ADAPTION_API_KEY="YOUR_KEY"
   python train_adaption.py
   This starts a paid/credit-using AutoScientist run after uploading.
7. Never upload offerguard_test.csv or offerguard_india_synthetic_test.csv
   as training data. Use them only for evaluation.
8. The Indian supplemental examples are SYNTHETIC. Evaluate genuine Indian
   messages separately before claiming real-world detection performance.
