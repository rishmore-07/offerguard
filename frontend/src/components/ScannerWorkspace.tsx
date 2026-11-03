import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Upload,
  Link,
  Mail,
  Building,
  Briefcase,
  Zap
} from 'lucide-react';
import { DetectionResults } from './DetectionResults';
import { analyzeJob } from '../api/client';
import type { JobAnalysisResponse, SampleJob } from '../types';

interface ScannerWorkspaceProps {
  samples: SampleJob[];
  initialSample?: SampleJob | null;
}

export const ScannerWorkspace: React.FC<ScannerWorkspaceProps> = ({ samples, initialSample }) => {
  const [jobText, setJobText] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [recruiterContact, setRecruiterContact] = useState<string>('');
  const [jobUrl, setJobUrl] = useState<string>('');
  const [source, setSource] = useState<string>('WhatsApp / SMS');

  const [loading, setLoading] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobAnalysisResponse | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const SCAN_STEPS = [
    'Parsing lexical tokens & salary guarantees...',
    'Checking for advance fee, gate pass, & laptop deposits...',
    'Analyzing recruiter email domain & corporate claims...',
    'Cross-referencing Indian statutory regulations & MCA21...',
    'Calibrating risk threat score & evidence findings...'
  ];

  useEffect(() => {
    if (initialSample) {
      handleLoadSample(initialSample);
    }
  }, [initialSample]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setScanStep(0);
      interval = setInterval(() => {
        setScanStep((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
      }, 420);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleScan = async (overrideText?: string, overrideTitle?: string, overrideCompany?: string) => {
    let textToScan = overrideText !== undefined ? overrideText : jobText;
    
    // Enrich with contact and URL context if provided by user
    const contextPrefixes: string[] = [];
    if (recruiterContact.trim()) {
      contextPrefixes.push(`Recruiter Contact: ${recruiterContact.trim()}`);
    }
    if (jobUrl.trim()) {
      contextPrefixes.push(`Posting URL: ${jobUrl.trim()}`);
    }
    if (contextPrefixes.length > 0 && !overrideText) {
      textToScan = `${contextPrefixes.join(' | ')}\n\n${textToScan}`;
    }

    if (!textToScan || textToScan.trim().length < 10) {
      setError('Please provide at least 10 characters of job offer, email body, or recruitment message text.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await analyzeJob(
        textToScan,
        overrideTitle !== undefined ? overrideTitle : title,
        overrideCompany !== undefined ? overrideCompany : company,
        undefined,
        source
      );
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error communicating with analysis service.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (sample: SampleJob) => {
    setJobText(sample.text);
    setTitle(sample.title || sample.label);
    setCompany(sample.company || '');
    setSource(sample.source || 'WhatsApp / SMS');
    setRecruiterContact('');
    setJobUrl('');
    handleScan(sample.text, sample.title || sample.label, sample.company || '');
  };

  const handleClear = () => {
    setJobText('');
    setTitle('');
    setCompany('');
    setRecruiterContact('');
    setJobUrl('');
    setResult(null);
    setError(null);
  };

  // Drag and drop handler for text files (.txt)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setJobText(content);
          setError(null);
        }
      };
      reader.readAsText(file);
    } else {
      setError('Direct file drag-and-drop supports .txt files. For PDFs or images, please copy & paste the offer text into the editor below.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Workspace Header - Neo Brutalist */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFE45E] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-black">
          <Zap className="w-3.5 h-3.5 fill-[#111111]" />
          <span>REAL-TIME FRAUD DETECTION WORKBENCH</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-[#111111]">
          Job Offer Risk Scanner
        </h1>
        <p className="text-sm text-[#444] font-medium max-w-3xl">
          Paste any job advertisement, WhatsApp offer forward, interview invite, or fee request.
          Our trained AI model and heuristic rules inspect red flags against Indian labor regulations.
        </p>
      </div>

      {/* Quick Demo Test Scenarios */}
      <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-4 sm:p-5 shadow-[5px_5px_0px_#111111] space-y-3">
        <div className="flex items-center space-x-2 text-xs font-heading font-extrabold text-[#111111]">
          <Sparkles className="w-4 h-4 text-[#F72585]" />
          <span>Quick Demo Test Scenarios (1-Click Evaluation):</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => handleLoadSample(s)}
              disabled={loading}
              className={`text-xs px-3 py-1.5 rounded-xl border-2 border-[#111111] flex items-center space-x-2 font-bold transition-all disabled:opacity-50 cursor-pointer ${
                s.type === 'Scam'
                  ? 'bg-[#FFD6E8] text-[#111111] shadow-[2.5px_2.5px_0px_#111111] hover:bg-[#F72585] hover:text-white hover:translate-x-[-1px] hover:translate-y-[-1px]'
                  : 'bg-[#FFE45E] text-[#111111] shadow-[2.5px_2.5px_0px_#111111] hover:bg-emerald-400 hover:translate-x-[-1px] hover:translate-y-[-1px]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full border border-[#111111] ${s.type === 'Scam' ? 'bg-[#F72585]' : 'bg-emerald-600'}`} />
              <span>{s.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Results View or Main Input Console */}
      {result ? (
        <DetectionResults result={result} rawText={jobText} onReset={handleClear} />
      ) : (
        <div className="relative bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_#111111] space-y-6">
          {/* Scanning Progress Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-5 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-[#FFE45E] border-3 border-[#111111] shadow-[4px_4px_0px_#111111] flex items-center justify-center animate-bounce">
                <Search className="w-8 h-8 text-[#111111] stroke-[3]" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-heading font-black text-[#111111]">
                  ANALYZING RECRUITMENT OFFER
                </h3>
                <p className="text-xs font-mono font-bold text-[#F72585] bg-[#FFD6E8] px-3 py-1 rounded-full border border-[#111111] inline-block">
                  {SCAN_STEPS[scanStep]}
                </p>
              </div>

              {/* Step indicator pills */}
              <div className="flex space-x-1.5">
                {SCAN_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full border border-[#111111] transition-all duration-300 ${
                      i <= scanStep ? 'w-8 bg-[#F72585]' : 'w-2 bg-[#E9DDFF]'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Console Header Bar */}
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F72585] border border-[#111111]" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFE45E] border border-[#111111]" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-[#111111]" />
              <span className="font-heading font-black text-sm text-[#111111] ml-2">
                OFFER CONTEXT & MESSAGE CONTENT
              </span>
            </div>
            {jobText && (
              <button
                onClick={handleClear}
                className="text-xs font-bold text-[#666] hover:text-[#F72585] flex items-center space-x-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>
            )}
          </div>

          {/* Context Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5 flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-[#F72585]" />
                <span>Job Title</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Remote Data Entry"
                className="w-full bg-[#FAF9F6] border-2 border-[#111111] rounded-xl px-3.5 py-2 text-xs font-medium text-[#111111] placeholder-[#888] focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#111111] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5 flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                <span>Company Name</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Reliance Jio / Amazon"
                className="w-full bg-[#FAF9F6] border-2 border-[#111111] rounded-xl px-3.5 py-2 text-xs font-medium text-[#111111] placeholder-[#888] focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#111111] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>Recruiter Contact / Email</span>
              </label>
              <input
                type="text"
                value={recruiterContact}
                onChange={(e) => setRecruiterContact(e.target.value)}
                placeholder="e.g. hr@tcs-jobs.protonmail.com"
                className="w-full bg-[#FAF9F6] border-2 border-[#111111] rounded-xl px-3.5 py-2 text-xs font-medium text-[#111111] placeholder-[#888] focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#111111] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">
                Channel
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-[#FAF9F6] border-2 border-[#111111] rounded-xl px-3.5 py-2 text-xs font-bold text-[#111111] focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#111111] transition-all cursor-pointer"
              >
                <option value="WhatsApp / SMS">WhatsApp / SMS</option>
                <option value="Telegram Channel">Telegram Channel</option>
                <option value="Unsolicited Email">Unsolicited Email</option>
                <option value="LinkedIn Direct Message">LinkedIn Direct Message</option>
                <option value="Naukri.com">Naukri.com</option>
                <option value="Internshala">Internshala</option>
                <option value="Official Career Portal">Official Career Portal</option>
                <option value="Other">Other Channel</option>
              </select>
            </div>
          </div>

          {/* Optional URL Bar */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#E9DDFF] border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111]">
              <Link className="w-4 h-4 text-[#111111]" />
            </div>
            <input
              type="text"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="Optional: Job listing URL or Google Form link (e.g. https://forms.gle/...)"
              className="w-full bg-[#FAF9F6] border-2 border-[#111111] rounded-xl px-3.5 py-2 text-xs font-medium text-[#111111] placeholder-[#888] focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#111111] transition-all"
            />
          </div>

          {/* Drag & Drop File Helper Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed border-[#111111] rounded-xl p-3.5 text-center cursor-pointer transition-all ${
              dragOver ? 'bg-[#FFD6E8] border-[#F72585]' : 'bg-[#FAF9F6] hover:bg-[#FFE45E]/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="flex items-center justify-center space-x-2 text-xs font-bold text-[#111111]">
              <Upload className="w-4 h-4 text-[#F72585]" />
              <span>Drop an offer letter .txt file here or click to browse</span>
            </div>
          </div>

          {/* Main Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#111111]">
                Job Advertisement / Recruiter Message Text *
              </label>
              <span className="text-[11px] font-mono font-bold text-[#666]">
                {jobText.length} / 15,000 characters
              </span>
            </div>

            <textarea
              rows={7}
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the full job posting, WhatsApp message text, email content, interview instructions, or fee payment demands here..."
              className="w-full bg-[#FAF9F6] border-2 border-[#111111] rounded-xl p-4 text-xs font-mono text-[#111111] placeholder-[#888] focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_#111111] leading-relaxed transition-all resize-y"
            />
          </div>

          {error && (
            <div className="bg-[#FFD6E8] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] rounded-xl p-3.5 text-xs text-[#111111] font-bold flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#F72585]" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action - Neo-Brutalist Pink Button */}
          <button
            onClick={() => handleScan()}
            disabled={loading || jobText.trim().length < 10}
            className="w-full py-4 rounded-xl bg-[#F72585] text-white font-heading font-black text-base sm:text-lg border-2 sm:border-3 border-[#111111] shadow-[5px_5px_0px_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[3]" />
            <span>Analyze Job Offer For Fraud ↗</span>
          </button>
        </div>
      )}
    </div>
  );
};
