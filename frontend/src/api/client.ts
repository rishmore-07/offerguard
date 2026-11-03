import type {
  JobAnalysisResponse,
  SampleJob,
  SessionStatsResponse,
  ModelInfoResponse
} from '../types';

function resolveApiBase(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
  if (raw === '/api' || raw.endsWith('/api')) {
    return raw;
  }
  return `${raw}/api`;
}

const API_BASE = resolveApiBase();

export async function analyzeJob(
  text: string,
  title?: string,
  company?: string,
  salary?: string,
  source?: string
): Promise<JobAnalysisResponse> {
  let resp: Response;
  try {
    resp = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title, company, salary, source }),
    });
  } catch {
    throw new Error('Could not reach the analysis service. Check your connection and try again.');
  }

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({ detail: '' }));
    const detail = typeof errorData.detail === 'string' ? errorData.detail : '';
    if (resp.status === 503) {
      throw new Error(detail || 'The trained classifier is not available right now. Try again in a moment.');
    }
    if (resp.status === 429) {
      throw new Error(detail || 'Too many scans. Wait a minute and try again.');
    }
    throw new Error(detail || `Analysis failed (${resp.status}).`);
  }

  return resp.json();
}

export async function fetchSamples(): Promise<SampleJob[]> {
  try {
    const resp = await fetch(`${API_BASE}/samples`);
    if (resp.ok) {
      return await resp.json();
    }
  } catch (e) {
    console.warn('Using bundled fallback samples:', e);
  }

  return [
    {
      id: "sample-1",
      label: "Reliance Jio Gate Pass & Registration Fee Scam",
      type: "Scam",
      source: "WhatsApp / SMS",
      title: "Back Office Executive",
      company: "Reliance Jio Infocomm (Impersonated)",
      text: "Dear Candidate, You are selected for the post of Back Office Executive at Reliance Jio Mumbai. Salary is Rs. 48,000 per month. Direct joining without interview. You must transfer Rs. 1,450 gate pass and registration charges immediately to our HR via Google Pay at 9876543210 to receive your official appointment letter.",
      expected_risk: "CRITICAL",
      key_scam_vector: "Mandatory registration fee & personal UPI transfer"
    },
    {
      id: "sample-2",
      label: "YouTube Like & Merchant Task Cyber Fraud",
      type: "Scam",
      source: "Telegram Channel",
      title: "Part-time Digital Assistant",
      company: "Global Media Merchants",
      text: "Work from home part time job! Earn Rs. 3,000 to Rs. 8,000 daily simply by liking YouTube videos and completing merchant review tasks. No resume or interview required. Join our official Telegram channel t.me/fast_earn_tasks to receive today's prepaid task wallet.",
      expected_risk: "CRITICAL",
      key_scam_vector: "Transnational task scam / Telegram redirection"
    },
    {
      id: "sample-3",
      label: "Amazon Freelance Data Entry Laptop Deposit Scam",
      type: "Scam",
      source: "LinkedIn Direct Message",
      title: "Freelance Catalog Auditor",
      company: "Amazon India (Impersonated)",
      text: "Job Posting: Work from home for Amazon India as a remote catalog auditor. Guaranteed monthly compensation of Rs. 65,000. Apple MacBook Air provided by company. To dispatch equipment, deposit a refundable courier and asset insurance fee of 2,500 INR via PhonePe. Offer valid only for next 2 hours.",
      expected_risk: "CRITICAL",
      key_scam_vector: "Equipment deposit & artificial urgency deadline"
    },
    {
      id: "sample-4",
      label: "HDFC Bank Free Webmail Phishing Attempt",
      type: "Scam",
      source: "Unsolicited Email",
      title: "Credit Operations Associate",
      company: "HDFC Bank Careers (Impersonated)",
      text: "Offer of Employment: HDFC Bank is pleased to offer you the role of Credit Operations Associate at our Bangalore branch. Package: 9.5 LPA. Kindly submit scanned copies of Aadhaar card, PAN card, and cancelled cheque to hr-hdfcbankrecruitment@protonmail.com within 24 hours.",
      expected_risk: "HIGH",
      key_scam_vector: "Free disposable webmail & sensitive KYC document harvesting"
    },
    {
      id: "sample-5",
      label: "Tata Consultancy Services (TCS) Genuine Engineer Listing",
      type: "Legitimate",
      source: "TCS iBegin Portal",
      title: "Full-Stack React & Node Developer",
      company: "Tata Consultancy Services (TCS)",
      text: "Tata Consultancy Services (TCS) is hiring Full-Stack Developers (3-5 years experience) for Bengaluru location. Key skills: React, TypeScript, Node.js, and cloud deployments. Candidates will undergo a coding assessment followed by technical and managerial rounds. Apply strictly through official portal ibegin.tcs.com. TCS never requests any recruitment fee or security deposit.",
      expected_risk: "LOW",
      key_scam_vector: "Authentic enterprise recruitment with explicit zero-fee policy"
    },
    {
      id: "sample-6",
      label: "Infosys Legitimate Senior Machine Learning Engineer",
      type: "Legitimate",
      source: "Infosys Careers Portal",
      title: "Senior Machine Learning Engineer",
      company: "Infosys Limited",
      text: "Infosys is seeking a Senior ML Engineer to join our Applied AI practice in Pune. Qualifications: B.Tech/M.Tech in Computer Science, 4+ years hands-on machine learning experience with scikit-learn, PyTorch, and FastAPI. Comprehensive compensation package includes provident fund, medical insurance, and performance bonuses. Submit application directly at career.infosys.com.",
      expected_risk: "LOW",
      key_scam_vector: "Authentic structured job posting with clear requirements"
    }
  ];
}

export async function fetchSessionStats(): Promise<SessionStatsResponse> {
  try {
    const resp = await fetch(`${API_BASE}/session-stats`);
    if (resp.ok) {
      return await resp.json();
    }
  } catch (e) {
    console.warn('Session stats endpoint unavailable:', e);
  }

  return {
    total_analyzed: 0,
    fraudulent_count: 0,
    legitimate_count: 0,
    signals_frequency: {},
    recent_analyses: []
  };
}

export async function fetchModelInfo(): Promise<ModelInfoResponse | null> {
  try {
    const resp = await fetch(`${API_BASE}/model-info`);
    if (resp.ok) {
      return await resp.json();
    }
  } catch (e) {
    console.warn('Model info endpoint unavailable:', e);
  }
  return null;
}
