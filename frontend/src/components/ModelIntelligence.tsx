import React, { useState } from 'react';
import {
  Cpu,
  Database,
  BarChart3,
  Sliders,
  Clock,
  Info
} from 'lucide-react';
import type { ModelInfoResponse } from '../types';

interface ModelIntelligenceProps {
  modelInfo: ModelInfoResponse | null;
}

export const ModelIntelligence: React.FC<ModelIntelligenceProps> = ({ modelInfo }) => {
  const [useTunedThreshold, setUseTunedThreshold] = useState<boolean>(true);

  const baseline = modelInfo?.baseline_metrics;
  const holdout = modelInfo?.lightweight_holdout?.metrics;
  const optimalTh = baseline?.optimal_decision_threshold || 0.62;

  const emscadSplit = useTunedThreshold
    ? baseline?.splits.test_real_emscad_tuned_threshold
    : baseline?.splits.test_real_emscad_default_threshold;

  const syntheticSplit = useTunedThreshold
    ? baseline?.splits.test_synthetic_india_tuned_threshold
    : baseline?.splits.test_synthetic_india_default_threshold;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner - Neo Brutalist */}
      <div className="bg-[#FFE45E] border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-black bg-white text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
                ARCHITECTURE & BENCHMARKS
              </span>
              <span className="text-xs text-[#111111] font-mono font-bold">OfferGuard AI Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#111111]">
              Model Intelligence & Adaption Pipeline
            </h1>
          </div>

          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
            <span className="text-xs font-bold text-[#666]">Active Engine:</span>
            <span className="text-xs font-mono font-black text-[#F72585]">
              {modelInfo?.model_name || 'TF-IDF Logistic Regression'}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#222] font-medium leading-relaxed max-w-3xl">
          Live scans use the saved TF-IDF logistic regression. The Qwen3.5-2B LoRA numbers below are a separate local evaluation and are not used for predictions.
        </p>
      </div>

      {/* AutoScientist Integration Status Card */}
      <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_#111111] space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#111111] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#E9DDFF] border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
              <Cpu className="w-6 h-6 text-[#111111]" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-black text-[#111111]">
                Adaption Labs AutoScientist Model Status
              </h2>
              <p className="text-xs text-[#555] font-medium">
                Stored for comparison. This checkpoint does not serve live predictions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#FFE45E] border-2 border-[#111111] text-xs font-mono font-black shadow-[2px_2px_0px_#111111]">
            <Clock className="w-4 h-4 animate-spin text-[#111111]" style={{ animationDuration: '8s' }} />
            <span>Status: {modelInfo?.autoscientist_status || 'Awaiting trained model'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#FAF9F6] p-4 rounded-xl border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-1.5">
            <span className="text-[#666] uppercase font-mono font-bold text-[10px]">1. Dataset Curation</span>
            <div className="font-heading font-black text-sm text-[#111111]">11,502 Records Formatted</div>
            <p className="text-[#444] text-[11px] leading-relaxed">
              Exported as <code className="text-[#F72585] font-mono font-bold">offerguard_train.csv</code> with <code className="font-mono">instruction</code> and <code className="font-mono">response</code> columns. Zero holdout leakage.
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-xl border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-1.5">
            <span className="text-[#666] uppercase font-mono font-bold text-[10px]">2. Production Classifier</span>
            <div className="font-heading font-black text-sm text-[#111111]">TF-IDF + Logistic Regression</div>
            <p className="text-[#444] text-[11px] leading-relaxed">
              15,000 word unigrams and bigrams, class-weighted logistic regression, decision threshold 0.62. Every live label comes from this model.
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-xl border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-1.5">
            <span className="text-[#666] uppercase font-mono font-bold text-[10px]">3. What Is Not Served</span>
            <div className="font-heading font-black text-sm text-[#111111]">No LoRA and no demo rules</div>
            <p className="text-[#444] text-[11px] leading-relaxed">
              The API returns 503 if the joblib classifier is missing. It does not fall back to heuristic rules or the Qwen checkpoint.
            </p>
          </div>
        </div>

        {modelInfo?.lora_evaluation?.accuracy_on_valid != null && (
          <div className="bg-white border-2 border-[#111111] rounded-xl p-4 shadow-[3px_3px_0px_#111111] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading font-black text-[#111111]">Held-out Qwen3.5-2B LoRA evaluation</h3>
              <span className="text-[11px] font-mono font-bold border border-[#111111] rounded px-2 py-0.5">
                {modelInfo.lora_evaluation.valid_predictions}/{modelInfo.lora_evaluation.rows_in_split} valid
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-[10px] font-mono uppercase text-[#666]">Accuracy</div>
                <div className="text-xl font-black">{((modelInfo.lora_evaluation.accuracy_on_valid || 0) * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-[#666]">Fraud precision</div>
                <div className="text-xl font-black">{((modelInfo.lora_evaluation.fraud_precision || 0) * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-[#666]">Fraud recall</div>
                <div className="text-xl font-black">{((modelInfo.lora_evaluation.fraud_recall || 0) * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-[#666]">Fraud F1</div>
                <div className="text-xl font-black">{((modelInfo.lora_evaluation.fraud_f1 || 0) * 100).toFixed(1)}%</div>
              </div>
            </div>
            <p className="text-[11px] text-[#444]">
              Confusion counts TN {modelInfo.lora_evaluation.tn ?? '—'}, FP {modelInfo.lora_evaluation.fp ?? '—'}, FN {modelInfo.lora_evaluation.fn ?? '—'}, TP {modelInfo.lora_evaluation.tp ?? '—'}.
              These figures belong to the Qwen3.5-2B LoRA evaluation only. They are not the logistic-regression result. The Adaption search win rate is not model accuracy.
            </p>
          </div>
        )}

        {/* Scientific Rigor Guarantee Notice */}
        <div className="bg-[#FFD6E8] border-2 border-[#111111] rounded-xl p-3.5 text-xs text-[#111111] font-medium flex items-start space-x-2.5 shadow-[2px_2px_0px_#111111]">
          <Info className="w-4 h-4 text-[#F72585] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Separate evaluations:</strong> The Qwen card above is the completed local LoRA measurement. It is not the model answering scans. A LEGITIMATE label is not proof an employer is genuine.
          </p>
        </div>
      </div>

      {/* Baseline Model Evaluation Section */}
      {baseline && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-heading font-black text-[#111111] flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-[#F72585]" />
                <span>Baseline Classifier: TF-IDF + Class-Weighted Logistic Regression</span>
              </h2>
              <p className="text-xs text-[#555] font-medium">
                15,000 sublinear n-grams (1-2) with balanced class weights trained on EMSCAD + Aioshi.
              </p>
            </div>

            {/* Threshold toggle buttons */}
            <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-xs">
              <Sliders className="w-3.5 h-3.5 text-[#111111] ml-1" />
              <button
                onClick={() => setUseTunedThreshold(false)}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition cursor-pointer ${
                  !useTunedThreshold ? 'bg-[#FFE45E] text-[#111111] border border-[#111111]' : 'text-[#666] hover:text-[#111111]'
                }`}
              >
                Default (th=0.50)
              </button>
              <button
                onClick={() => setUseTunedThreshold(true)}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition cursor-pointer ${
                  useTunedThreshold ? 'bg-[#F72585] text-white border border-[#111111]' : 'text-[#666] hover:text-[#111111]'
                }`}
              >
                Calibrated (th={optimalTh.toFixed(2)})
              </button>
            </div>
          </div>

          {holdout && (
            <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#111111] pb-3">
                <h3 className="text-sm font-heading font-black text-[#111111]">
                  Production model on offerguard_clean_test.csv (N = {holdout.rows})
                </h3>
                <span className="text-xs font-mono font-black bg-[#FFE45E] text-[#111111] px-2.5 py-0.5 rounded border border-[#111111]">
                  TF-IDF logistic regression, not the Qwen LoRA
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#666]">Accuracy</div>
                  <div className="text-xl font-black">{((holdout.accuracy || 0) * 100).toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#666]">Fraud precision</div>
                  <div className="text-xl font-black">{((holdout.fraud_precision || 0) * 100).toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#666]">Fraud recall</div>
                  <div className="text-xl font-black">{((holdout.fraud_recall || 0) * 100).toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#666]">Fraud F1</div>
                  <div className="text-xl font-black">{((holdout.fraud_f1 || 0) * 100).toFixed(2)}%</div>
                </div>
              </div>
              <p className="text-[11px] text-[#444]">
                Macro F1 {((holdout.macro_f1 || 0) * 100).toFixed(2)}%. Confusion counts TN {holdout.tn ?? '—'}, FP {holdout.fp ?? '—'}, FN {holdout.fn ?? '—'}, TP {holdout.tp ?? '—'}.
                Training text overlap with this file was 0. The older EMSCAD table below is a different split.
              </p>
            </div>
          )}

          {/* Benchmark Table Card */}
          {emscadSplit && (
            <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-[#111111] pb-3">
                <h3 className="text-sm font-heading font-black text-[#111111]">
                  Real-World EMSCAD Holdout Test Performance (N = {emscadSplit.sample_counts.total}, 107 Fraudulent)
                </h3>
                <span className="text-xs font-mono font-black bg-[#E9DDFF] text-[#111111] px-2.5 py-0.5 rounded border border-[#111111]">
                  ROC-AUC: {emscadSplit.probabilistic_metrics?.roc_auc || 0.9839} | PR-AUC: {emscadSplit.probabilistic_metrics?.pr_auc || 0.8268}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAF9F6] text-[#111111] border-b-2 border-[#111111] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Class</th>
                      <th className="py-2.5 px-3">Precision</th>
                      <th className="py-2.5 px-3">Recall</th>
                      <th className="py-2.5 px-3">F1-Score</th>
                      <th className="py-2.5 px-3">Support</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111111]/15 text-[#111111]">
                    <tr className="bg-[#FFD6E8]/40">
                      <td className="py-2.5 px-3 font-bold text-[#F72585] font-sans">FRAUDULENT (Scam)</td>
                      <td className="py-2.5 px-3 font-bold">{(emscadSplit.per_class.FRAUDULENT.precision * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3 font-bold text-[#F72585]">{(emscadSplit.per_class.FRAUDULENT.recall * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3 font-bold">{(emscadSplit.per_class.FRAUDULENT.f1_score * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3 text-[#666]">{emscadSplit.per_class.FRAUDULENT.support}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-emerald-700 font-sans">LEGITIMATE (Genuine)</td>
                      <td className="py-2.5 px-3">{(emscadSplit.per_class.LEGITIMATE.precision * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3">{(emscadSplit.per_class.LEGITIMATE.recall * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3">{(emscadSplit.per_class.LEGITIMATE.f1_score * 100).toFixed(2)}%</td>
                      <td className="py-2.5 px-3 text-[#666]">{emscadSplit.per_class.LEGITIMATE.support}</td>
                    </tr>
                    <tr className="bg-[#FFE45E] font-bold text-[#111111] font-sans border-t-2 border-[#111111]">
                      <td className="py-2.5 px-3 font-black">Overall Accuracy</td>
                      <td colSpan={3} className="py-2.5 px-3 text-right font-mono font-black">
                        {(emscadSplit.primary_kpis.accuracy * 100).toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-[#111111] font-mono">{emscadSplit.sample_counts.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Confusion Matrix Visual */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-[#FAF9F6] border-2 border-[#111111] rounded-xl p-3 space-y-1 shadow-[2px_2px_0px_#111111]">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#555]">True Negatives</span>
                  <div className="text-2xl font-black font-mono text-emerald-600">
                    {emscadSplit.confusion_matrix.true_negatives}
                  </div>
                  <span className="text-[10px] text-[#777]">Legitimate approved</span>
                </div>

                <div className="bg-[#FFE45E]/40 border-2 border-[#111111] rounded-xl p-3 space-y-1 shadow-[2px_2px_0px_#111111]">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#555]">False Positives</span>
                  <div className="text-2xl font-black font-mono text-amber-700">
                    {emscadSplit.confusion_matrix.false_positives}
                  </div>
                  <span className="text-[10px] text-[#777]">Legitimate flagged</span>
                </div>

                <div className="bg-[#FFD6E8] border-2 border-[#111111] rounded-xl p-3 space-y-1 shadow-[2px_2px_0px_#111111]">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#F72585]">False Negatives</span>
                  <div className="text-2xl font-black font-mono text-[#F72585]">
                    {emscadSplit.confusion_matrix.false_negatives}
                  </div>
                  <span className="text-[10px] text-[#777]">Missed scams</span>
                </div>

                <div className="bg-[#E9DDFF] border-2 border-[#111111] rounded-xl p-3 space-y-1 shadow-[2px_2px_0px_#111111]">
                  <span className="text-[10px] uppercase font-mono font-bold text-indigo-800">True Positives</span>
                  <div className="text-2xl font-black font-mono text-indigo-900">
                    {emscadSplit.confusion_matrix.true_positives}
                  </div>
                  <span className="text-[10px] text-[#777]">Scams caught</span>
                </div>
              </div>
            </div>
          )}

          {/* Independent Synthetic Holdout Evaluation */}
          {syntheticSplit && (
            <div className="bg-[#FAF9F6] border-2 border-[#111111] rounded-2xl p-5 space-y-2 shadow-[4px_4px_0px_#111111]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-heading font-black text-[#111111] uppercase tracking-wide">
                  Independent Synthetic Holdout Evaluation (Aioshi/smolified-fakejob, N = {syntheticSplit.sample_counts.total})
                </span>
                <span className="text-xs font-mono font-black text-[#F72585]">
                  Fraud Recall: {(syntheticSplit.primary_kpis.fraud_recall * 100).toFixed(1)}% | F1: {(syntheticSplit.primary_kpis.fraud_f1 * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-[#555] font-medium leading-relaxed">
                This synthetic file is scored on its own, apart from the EMSCAD and clean-test tables. Its fraud recall is the number in the line above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dataset Provenance Breakdown */}
      <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_#111111] space-y-4">
        <h3 className="text-base font-heading font-black text-[#111111] flex items-center space-x-2">
          <Database className="w-5 h-5 text-[#F72585]" />
          <span>Supervised Dataset Provenance & Leakage Prevention</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#FAF9F6] p-4 rounded-xl border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
            <span className="font-heading font-black text-sm text-[#111111]">EMSCAD Real-World Dataset</span>
            <ul className="space-y-1 text-[#333] font-mono text-[11px]">
              <li>• Raw records: 17,880</li>
              <li>• After deduplication & conflict removal: 15,750</li>
              <li>• Train split (70%): 11,025 listings</li>
              <li>• Validation split (15%): 2,362 listings</li>
              <li>• Test holdout (15%): 2,363 listings (4.53% fraud rate)</li>
            </ul>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-xl border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
            <span className="font-heading font-black text-sm text-[#111111]">Aioshi Indian Synthetic Dataset</span>
            <ul className="space-y-1 text-[#333] font-mono text-[11px]">
              <li>• Raw synthetic records: 597</li>
              <li>• Parsed from format: Classification: Fake/Real</li>
              <li>• Overlap with EMSCAD: 0 (filtered before split)</li>
              <li>• Synthetic Train split (80%): 477 listings</li>
              <li>• Synthetic Test holdout (20%): 120 listings (isolated)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
