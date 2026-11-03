"""In-memory session threat intelligence store for OfferGuard AI.

Preserves privacy: does NOT persist or log raw user job offer texts.
Maintains session statistics for the interactive dashboard.
"""
import threading
from datetime import datetime, timezone
from typing import Dict, List, Any
from backend.app.schemas import SessionStatsResponse, RecentAnalysisItem


class SessionThreatStore:
    def __init__(self, max_recent: int = 50):
        self._lock = threading.Lock()
        self._max_recent = max_recent
        self.total_analyzed = 0
        self.fraudulent_count = 0
        self.legitimate_count = 0
        self.signals_frequency: Dict[str, int] = {}
        self.recent_analyses: List[RecentAnalysisItem] = []

    def record_analysis(
        self,
        analysis_id: str,
        title: str,
        source: str,
        prediction: str,
        risk_score: float,
        risk_level: str,
        signals: List[str],
        is_demo_mode: bool
    ):
        with self._lock:
            self.total_analyzed += 1
            if prediction == "FRAUDULENT":
                self.fraudulent_count += 1
            else:
                self.legitimate_count += 1

            for s in signals:
                self.signals_frequency[s] = self.signals_frequency.get(s, 0) + 1

            now_str = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
            item = RecentAnalysisItem(
                id=analysis_id,
                timestamp=now_str,
                title=title or "Untitled Recruitment Offer",
                source=source or "Direct Scan",
                prediction=prediction,
                risk_score=risk_score,
                risk_level=risk_level,
                signals_count=len(signals),
                is_demo_mode=is_demo_mode
            )

            self.recent_analyses.insert(0, item)
            if len(self.recent_analyses) > self._max_recent:
                self.recent_analyses = self.recent_analyses[:self._max_recent]

    def get_stats(self) -> SessionStatsResponse:
        with self._lock:
            return SessionStatsResponse(
                total_analyzed=self.total_analyzed,
                fraudulent_count=self.fraudulent_count,
                legitimate_count=self.legitimate_count,
                signals_frequency=dict(sorted(self.signals_frequency.items(), key=lambda x: x[1], reverse=True)),
                recent_analyses=list(self.recent_analyses)
            )

    def clear(self):
        with self._lock:
            self.total_analyzed = 0
            self.fraudulent_count = 0
            self.legitimate_count = 0
            self.signals_frequency.clear()
            self.recent_analyses.clear()


session_store = SessionThreatStore()

