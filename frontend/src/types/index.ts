export type PredictionType = 'FRAUDULENT' | 'LEGITIMATE';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
export type SignalSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ADVISORY';

export interface SuspiciousSignal {
  category: string;
  signal: string;
  severity: SignalSeverity;
  description: string;
  matched_text: string;
  start_pos?: number;
  end_pos?: number;
}

export type RedFlagItem = SuspiciousSignal;

export interface ModelMetadata {
  model_name: string;
  model_type: string;
  provider: string;
  is_demo_mode: boolean;
  status_label: string;
  endpoint_configured: boolean;
}

export interface JobAnalysisResponse {
  prediction: PredictionType;
  model_status: string;
  is_demo_mode: boolean;
  confidence?: number | null;
  risk_score: number;
  risk_level: RiskLevel;
  signals: SuspiciousSignal[];
  red_flags?: SuspiciousSignal[];
  verification_steps: string[];
  safety_recommendations: string[];
  disclaimer: string;
  model_info: ModelMetadata;
}

export interface RecentAnalysisItem {
  id: string;
  timestamp: string;
  title: string;
  source: string;
  prediction: PredictionType;
  risk_score: number;
  risk_level: RiskLevel;
  signals_count: number;
  is_demo_mode: boolean;
}

export interface SessionStatsResponse {
  total_analyzed: number;
  fraudulent_count: number;
  legitimate_count: number;
  signals_frequency: Record<string, number>;
  recent_analyses: RecentAnalysisItem[];
}

export interface SampleJob {
  id: string;
  label: string;
  type: 'Scam' | 'Legitimate';
  source: string;
  title: string;
  company: string;
  text: string;
  expected_risk: string;
  key_scam_vector?: string;
}

export interface SplitMetrics {
  split_name: string;
  sample_counts: {
    total: number;
    legitimate: number;
    fraudulent: number;
    fraud_prevalence_pct: number;
  };
  primary_kpis: {
    fraud_f1: number;
    fraud_recall: number;
    fraud_precision: number;
    macro_f1: number;
    accuracy: number;
  };
  per_class: {
    FRAUDULENT: {
      precision: number;
      recall: number;
      f1_score: number;
      support: number;
    };
    LEGITIMATE: {
      precision: number;
      recall: number;
      f1_score: number;
      support: number;
    };
  };
  confusion_matrix: {
    matrix: number[][];
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
    false_positive_rate: number;
    false_negative_rate: number;
  };
  probabilistic_metrics?: {
    roc_auc: number;
    pr_auc: number;
    brier_score: number;
  };
}

export interface ModelMetricsResponse {
  model_name: string;
  model_type: string;
  optimal_decision_threshold: number;
  splits: {
    validation_default_threshold: SplitMetrics;
    validation_tuned_threshold: SplitMetrics;
    test_real_emscad_default_threshold: SplitMetrics;
    test_real_emscad_tuned_threshold: SplitMetrics;
    test_synthetic_india_default_threshold?: SplitMetrics;
    test_synthetic_india_tuned_threshold?: SplitMetrics;
  };
  threshold_tuning_curve: Array<{
    threshold: number;
    precision: number;
    recall: number;
    f1: number;
  }>;
  top_features: {
    fraud_indicative: Array<{ feature: string; weight: number }>;
    legitimate_indicative: Array<{ feature: string; weight: number }>;
  };
}

export interface ModelInfoResponse {
  active_provider: string;
  model_name: string;
  model_status: string;
  autoscientist_status: string;
  dataset_overview: {
    emscad_total_records: number;
    emscad_clean_unique_records: number;
    emscad_train_split: number;
    emscad_validation_split: number;
    emscad_real_test_holdout: number;
    aioshi_synthetic_records: number;
    aioshi_synthetic_train: number;
    aioshi_synthetic_test_holdout: number;
    combined_train_records: number;
    classes: string[];
  };
  baseline_metrics?: ModelMetricsResponse | null;
  lora_evaluation?: {
    split?: string;
    rows_in_split?: number;
    rows_scored?: number;
    valid_predictions?: number;
    invalid_predictions?: number;
    invalid_rate?: number;
    accuracy_on_valid?: number;
    fraud_precision?: number;
    fraud_recall?: number;
    fraud_f1?: number;
    macro_f1?: number;
    weighted_f1?: number;
    tn?: number;
    fp?: number;
    fn?: number;
    tp?: number;
    always_legitimate_baseline_accuracy?: number;
    latency_seconds?: { average?: number; p95?: number };
    complete?: boolean;
  } | null;
  evaluation_methodology: string;
}
