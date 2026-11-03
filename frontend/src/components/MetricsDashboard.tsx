import React, { useState } from 'react';
import type { ModelMetricsResponse } from '../types';
import { Cpu, CheckCircle, BarChart3, Database, Sliders } from 'lucide-react';

interface MetricsDashboardProps {
  metrics: ModelMetricsResponse | null;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics }) => {
  const [useTuned, setUseTuned] = useState(false);

  if (!metrics) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Cpu className="w-8 h-8 mx-auto text-indigo-400 animate-pulse mb-3" />
        <p>Loading reproducible benchmark evaluation metrics...</p>
      </div>
    );
  }

  const emscadSplit = useTuned
    ? metrics.splits.test_real_emscad_tuned_threshold
    : metrics.splits.test_real_emscad_default_threshold;

  const synSplit = useTuned
    ? metrics.splits.test_synthetic_india_tuned_threshold
    : metrics.splits.test_synthetic_india_default_threshold;

  const valSplit = useTuned
    ? metrics.splits.validation_tuned_threshold
    : metrics.splits.validation_default_threshold;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
              {metrics.model_name}
            </span>
            <span className="text-xs text-slate-400">TF-IDF (15,000 features, 1-2 ngrams) + Logistic Regression</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-1">
            Empirical Model Evaluation & Reproducible Benchmark
          </h2>
          <p className="text-xs text-slate-400">
            Evaluating fraud-class recall and F1 on class-imbalanced holdouts (never relying solely on 97%+ accuracy).
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
          <Sliders className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-300">Decision Threshold:</span>
          <button
            onClick={() => setUseTuned(false)}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              !useTuned ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Default (0.50)
          </button>
          <button
            onClick={() => setUseTuned(true)}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              useTuned ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Optimal ({metrics.optimal_decision_threshold.toFixed(2)})
          </button>
        </div>
      </div>

      {/* Dataset Splits Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>EMSCAD Real Validation Split</span>
            <span className="text-indigo-400">N={valSplit.sample_counts.total}</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {(valSplit.primary_kpis.fraud_f1 * 100).toFixed(1)}%
            <span className="text-xs text-slate-400 font-normal ml-1">Fraud F1</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Recall: {(valSplit.primary_kpis.fraud_recall * 100).toFixed(1)}%</span>
            <span>Prec: {(valSplit.primary_kpis.fraud_precision * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-indigo-900/40 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600/30 text-indigo-300 text-[10px] uppercase font-mono px-2 py-0.5 rounded-bl">
            Primary Benchmark
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>EMSCAD Real Test Holdout</span>
            <span className="text-indigo-400">N={emscadSplit.sample_counts.total}</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {(emscadSplit.primary_kpis.fraud_f1 * 100).toFixed(1)}%
            <span className="text-xs text-slate-400 font-normal ml-1">Fraud F1</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Recall: {(emscadSplit.primary_kpis.fraud_recall * 100).toFixed(1)}%</span>
            <span>Prec: {(emscadSplit.primary_kpis.fraud_precision * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-amber-900/40 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-600/30 text-amber-300 text-[10px] uppercase font-mono px-2 py-0.5 rounded-bl">
            Synthetic Benchmark
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Aioshi India Synthetic Test</span>
            <span className="text-amber-400">N={synSplit ? synSplit.sample_counts.total : 0}</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {synSplit ? (synSplit.primary_kpis.fraud_f1 * 100).toFixed(1) : 0}%
            <span className="text-xs text-slate-400 font-normal ml-1">Fraud F1</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Recall: {synSplit ? (synSplit.primary_kpis.fraud_recall * 100).toFixed(1) : 0}%</span>
            <span>Prec: {synSplit ? (synSplit.primary_kpis.fraud_precision * 100).toFixed(1) : 0}%</span>
          </div>
        </div>
      </div>

      {/* Real EMSCAD Holdout Detailed Report & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>EMSCAD Real-World Test Metrics Breakdown</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Class</th>
                  <th className="py-2 px-3">Precision</th>
                  <th className="py-2 px-3">Recall</th>
                  <th className="py-2 px-3">F1-Score</th>
                  <th className="py-2 px-3">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                <tr className="bg-rose-950/20">
                  <td className="py-2 px-3 font-semibold text-rose-300">FRAUDULENT (1)</td>
                  <td className="py-2 px-3 font-mono">{(emscadSplit.per_class.FRAUDULENT.precision * 100).toFixed(2)}%</td>
                  <td className="py-2 px-3 font-mono font-bold text-amber-300">{(emscadSplit.per_class.FRAUDULENT.recall * 100).toFixed(2)}%</td>
                  <td className="py-2 px-3 font-mono font-bold text-rose-300">{(emscadSplit.per_class.FRAUDULENT.f1_score * 100).toFixed(2)}%</td>
                  <td className="py-2 px-3 font-mono text-slate-400">{emscadSplit.per_class.FRAUDULENT.support}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-emerald-300">LEGITIMATE (0)</td>
                  <td className="py-2 px-3 font-mono">{(emscadSplit.per_class.LEGITIMATE.precision * 100).toFixed(2)}%</td>
                  <td className="py-2 px-3 font-mono">{(emscadSplit.per_class.LEGITIMATE.recall * 100).toFixed(2)}%</td>
                  <td className="py-2 px-3 font-mono">{(emscadSplit.per_class.LEGITIMATE.f1_score * 100).toFixed(2)}%</td>
                  <td className="py-2 px-3 font-mono text-slate-400">{emscadSplit.per_class.LEGITIMATE.support}</td>
                </tr>
                <tr className="bg-slate-950/60 text-slate-300 font-semibold">
                  <td className="py-2 px-3">Overall Accuracy</td>
                  <td colSpan={3} className="py-2 px-3 font-mono text-right text-indigo-300">
                    {(emscadSplit.primary_kpis.accuracy * 100).toFixed(2)}%
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-400">{emscadSplit.sample_counts.total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-950/80 rounded-lg p-3 text-xs text-slate-400 space-y-1 border border-slate-800">
            <div className="text-slate-300 font-semibold">Why We Emphasize Fraud F1 & Recall:</div>
            <p>
              In extreme 95%:5% class imbalance, a naive dummy model predicting "LEGITIMATE" on everything achieves 95.5% accuracy but catches 0% of scams. OfferGuard prioritizes catching scams (Recall {'>'} 75%) without overwhelming legitimate recruiters with false alarms.
            </p>
          </div>
        </div>

        {/* Confusion Matrix Visual */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Confusion Matrix (EMSCAD Holdout)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3">
              <span className="text-[11px] text-emerald-400 uppercase font-semibold">True Negatives (TN)</span>
              <div className="text-2xl font-bold font-mono text-emerald-200 mt-1">
                {emscadSplit.confusion_matrix.true_negatives}
              </div>
              <span className="text-[10px] text-slate-400">Legitimate correctly passed</span>
            </div>

            <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3">
              <span className="text-[11px] text-amber-400 uppercase font-semibold">False Positives (FP)</span>
              <div className="text-2xl font-bold font-mono text-amber-200 mt-1">
                {emscadSplit.confusion_matrix.false_positives}
              </div>
              <span className="text-[10px] text-slate-400">Legitimate flagged for review</span>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/40 rounded-lg p-3">
              <span className="text-[11px] text-rose-400 uppercase font-semibold">False Negatives (FN)</span>
              <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
                {emscadSplit.confusion_matrix.false_negatives}
              </div>
              <span className="text-[10px] text-slate-400">Missed scams (Critical penalty)</span>
            </div>

            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-3">
              <span className="text-[11px] text-indigo-400 uppercase font-semibold">True Positives (TP)</span>
              <div className="text-2xl font-bold font-mono text-indigo-200 mt-1">
                {emscadSplit.confusion_matrix.true_positives}
              </div>
              <span className="text-[10px] text-slate-400">Scams successfully caught</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 flex justify-between text-xs text-slate-400">
            <span>False Positive Rate: {(emscadSplit.confusion_matrix.false_positive_rate * 100).toFixed(2)}%</span>
            <span>False Negative Rate: {(emscadSplit.confusion_matrix.false_negative_rate * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Top Features */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center space-x-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Learned Vocabulary Features (Highest & Lowest TF-IDF Coefficients)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wide">
              Top Fraud Indicative Signals (+)
            </span>
            <div className="mt-2 space-y-1.5">
              {metrics.top_features.fraud_indicative.slice(0, 6).map((item, i) => (
                <div key={i} className="flex justify-between text-xs bg-slate-950/60 px-3 py-1.5 rounded border border-rose-900/30">
                  <span className="font-mono text-slate-200">{item.feature}</span>
                  <span className="font-mono text-rose-400 font-bold">+{item.weight.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
              Top Legitimate Corporate Signals (-)
            </span>
            <div className="mt-2 space-y-1.5">
              {metrics.top_features.legitimate_indicative.slice(0, 6).map((item, i) => (
                <div key={i} className="flex justify-between text-xs bg-slate-950/60 px-3 py-1.5 rounded border border-emerald-900/30">
                  <span className="font-mono text-slate-200">{item.feature}</span>
                  <span className="font-mono text-emerald-400 font-bold">{item.weight.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
