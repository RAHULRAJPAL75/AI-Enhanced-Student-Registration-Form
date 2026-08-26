import { useState, useEffect } from "react";

const defaultFallbackInsights = [
  "Welcome to your workspace command center. Monitor student registrations and sprint readiness.",
  "Check the Students tab to search, edit, or export student records.",
  "Set clear sprint goals to maintain steady cohort progress and execution quality.",
];

export default function AIInsights({ currentUser }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const studentId = currentUser?.id || currentUser?._id;

    if (!studentId) {
      setInsights(defaultFallbackInsights);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.insights) && data.insights.length > 0) {
          setInsights(data.insights);
          setIsDemo(data.isDemo || false);
        } else {
          setInsights(defaultFallbackInsights);
          setIsDemo(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load AI insights:", err);
        setInsights(defaultFallbackInsights);
        setIsDemo(true);
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const displayInsights = insights.length > 0 ? insights : defaultFallbackInsights;

  if (loading) {
    return (
      <div className="ai-insights-card">
        <h3 className="db-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          AI Insights
        </h3>
        <div className="ai-insights-loading">
          <div className="db-spinner"></div>
          <p>Generating personalized insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-card">
      <h3 className="db-section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        AI Insights {isDemo && <span className="ai-demo-tag">Demo</span>}
      </h3>
      <ul className="ai-insights-list">
        {displayInsights.map((insight, index) => (
          <li key={insight + index} className="ai-insight-item">
            <span className="ai-insight-icon">AI {index + 1}</span>
            <p>{insight}</p>
          </li>
        ))}
      </ul>
      {isDemo && (
        <div className="ai-demo-hint">
          Add GROQ_API_KEY to backend/.env for personalized AI insights.
        </div>
      )}
    </div>
  );
}
