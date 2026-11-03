import React, { useState } from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, Terminal, Database, Copy, Check } from 'lucide-react';

export const AutoScientistPlaybook: React.FC = () => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-amber-400 mb-2">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-lg font-bold text-slate-100">
            Adaption AutoScientist Training Playbook & Readiness
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Complete protocol for fine-tuning an LLM on the OfferGuard dataset using Adaption AutoScientist.
          All preparation scripts, stratified splits, data hygiene checks, and leak prevention routines are pre-executed.
        </p>
      </div>

      {/* Safety Notice Card */}
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-amber-300">Hackathon Rule Compliance & Paid Credit Protection</div>
          <p>
            AutoScientist training involves paid cloud credits. Per instructions, paid training is held until credit authorization.
            The pipeline is configured with a <code className="text-amber-200 font-mono">--check-only</code> verification mode so the team can validate dataset schemas, columns, and API setup without spending credits.
          </p>
        </div>
      </div>

      {/* Preparation Checklist */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Dataset Readiness Status</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">EMSCAD Real Data Prepared</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                11,025 train / 2,362 val / 2,363 test. Stratified, deduplicated, label conflicts eliminated.
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">Aioshi Synthetic Data Isolated</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                477 train / 120 synthetic test. Evaluated independently, clearly tagged as synthetic.
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">Zero Train/Test Leakage Enforced</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Deduplication applied prior to split; validation & test examples excluded from augmentation.
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">Reusable Evaluation Module Built</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                <code className="text-indigo-300 font-mono">ml/evaluate.py</code> parses both string labels and probability matrices.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Instructions */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>Launch Steps (CLI & Dashboard)</span>
        </h3>

        {/* Step 1 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/40">
                1
              </span>
              <span className="text-sm font-semibold text-slate-200">Step 1: Verify Dataset & Pipeline (Dry Run)</span>
            </div>
            <button
              onClick={() => copyToClipboard('python ml/train_adaption.py --check-only', 'step1')}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded border border-slate-800"
            >
              {copiedSnippet === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet === 'step1' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Run the verification mode to confirm the 11,502 training rows, column mappings, and environment setup without making API calls or spending credits:
          </p>
          <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
            python ml/train_adaption.py --check-only
          </pre>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/40">
                2
              </span>
              <span className="text-sm font-semibold text-slate-200">Step 2: Export API Key & Launch Training</span>
            </div>
            <button
              onClick={() => copyToClipboard('$env:ADAPTION_API_KEY="YOUR_KEY"\npython ml/train_adaption.py', 'step2')}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded border border-slate-800"
            >
              {copiedSnippet === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet === 'step2' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            When authorized to proceed with paid training, set the environment variable and trigger the run:
          </p>
          <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto">
{`# Windows PowerShell:
$env:ADAPTION_API_KEY="YOUR_ADAPTION_API_KEY"
python ml/train_adaption.py

# Linux / macOS:
export ADAPTION_API_KEY="YOUR_ADAPTION_API_KEY"
python ml/train_adaption.py`}
          </pre>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/40">
              3
            </span>
            <span className="text-sm font-semibold text-slate-200">Step 3: Web Dashboard Alternative</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>If training via the Adaption Adaptive Data & AutoScientist web interface:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 ml-1">
              <li>Upload <code className="text-slate-200">offerguard_train.csv</code> to Adaptive Data.</li>
              <li>Map <strong className="text-slate-200">instruction</strong> → Prompt, <strong className="text-slate-200">response</strong> → Completion.</li>
              <li>Select <strong className="text-slate-200">instruction dataset</strong>; do not rewrite completion labels.</li>
              <li>In AutoScientist, select the processed dataset and pick the <strong className="text-slate-200">Tiny</strong> model profile.</li>
              <li>Disable reasoning mode to prevent over-generation and minimize cost.</li>
              <li><strong className="text-rose-400">Never upload</strong> <code className="text-rose-300">offerguard_test.csv</code> or <code className="text-rose-300">offerguard_india_synthetic_test.csv</code>.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
