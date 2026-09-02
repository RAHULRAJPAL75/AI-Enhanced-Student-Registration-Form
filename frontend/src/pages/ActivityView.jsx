import React, { useMemo, useState } from "react";
import { DashboardIcon } from "../components/DashboardCommon";
import {
  buildActivityStream,
  forecastSeries,
  detectAnomalies,
  computeEngagementScore,
  movingAverage,
  kmeans,
  studentFeatureVectors,
  classifyStudentRisk,
  recommendNextAction,
} from "../utils/mlUtils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "registration", label: "Registrations" },
  { key: "signin", label: "Access" },
  { key: "sprint", label: "Sprint" },
  { key: "system", label: "System" },
];

const ICON_FOR_TYPE = {
  registration: "users",
  signin: "profile",
  sprint: "target",
  system: "database",
  profile: "profile",
};

export function ActivityView({
  joinedDate,
  sprintReadiness = 0,
  studentsList = [],
  registrationBars = [],
  studentCount = 0,
  recentStudentCount = 0,
  newestStudent = null,
  currentUser = null,
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const stream = useMemo(
    () =>
      buildActivityStream({
        studentsList,
        joinedDate,
        sprintReadiness,
        registrationBars,
        studentCount,
        recentStudentCount,
        newestStudent,
      }),
    [studentsList, joinedDate, sprintReadiness, registrationBars, studentCount, recentStudentCount, newestStudent]
  );

  const forecast = useMemo(() => forecastSeries(registrationBars, 3), [registrationBars]);
  const anomalies = useMemo(() => detectAnomalies(registrationBars), [registrationBars]);
  const anomalyCount = anomalies.filter((a) => a.isAnomaly).length;
  const engagement = useMemo(
    () => computeEngagementScore({ studentCount, recentStudentCount, activeNow: true }),
    [studentCount, recentStudentCount]
  );

  const trend = useMemo(
    () => movingAverage((registrationBars || []).map((b) => Number(b.count) || 0), 3),
    [registrationBars]
  );

  const clusters = useMemo(() => {
    const vectors = studentFeatureVectors(studentsList);
    const { centroids, assignments } = kmeans(vectors, 3);
    const counts = centroids.map((_, i) => assignments.filter((a) => a === i).length);
    return { centroids, counts };
  }, [studentsList]);

  const risk = useMemo(() => {
    const acc = { "At risk": 0, Stable: 0, Thriving: 0 };
    studentsList.forEach((s) => {
      const days = s.createdAt
        ? (Date.now() - new Date(s.createdAt).getTime()) / 86400000
        : 30;
      const r = classifyStudentRisk({
        daysSinceJoin: days,
        hasProfileImage: !!s.profileImage,
        hasBio: !!(s.bio && s.bio.length > 10),
        recentActivity: true,
      });
      acc[r.level] += 1;
    });
    return acc;
  }, [studentsList]);

  const recommendation = useMemo(() => recommendNextAction(currentUser), [currentUser]);

  const filtered = stream.filter((e) => {
    const matchFilter = filter === "all" || e.type === filter;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q || e.title.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q);
    return matchFilter && matchQuery;
  });

  const healthLabel = engagement >= 70 ? "Healthy" : engagement >= 40 ? "Stable" : "Needs attention";

  return (
    <section className="db-activity-card act-enhanced" id="activity">
      <div className="db-panel-header">
        <div>
          <span className="db-panel-kicker">Activity · ML powered</span>
          <h3>Workspace Activity Intelligence</h3>
        </div>
        <span className="db-panel-badge">Live audit</span>
      </div>

      <div className="act-kpi-row">
        <div className="act-kpi">
          <span className="act-kpi-num">{stream.length}</span>
          <span className="act-kpi-label">Tracked events</span>
        </div>
        <div className="act-kpi">
          <span className="act-kpi-num">{anomalyCount}</span>
          <span className="act-kpi-label">Anomalies</span>
        </div>
        <div className="act-kpi">
          <span className="act-kpi-num">{forecast[0]?.value ?? 0}</span>
          <span className="act-kpi-label">Reg. forecast</span>
        </div>
        <div className="act-kpi">
          <span className="act-kpi-num">{engagement}</span>
          <span className="act-kpi-label">Engagement</span>
        </div>
      </div>

      <div className="act-ml-panel">
        <div className="act-ml-block">
          <h4>Registration forecast <small>linear model</small></h4>
          <div className="act-forecast">
            {forecast.map((f) => (
              <div key={f.label} className="act-forecast-item">
                <span className="act-forecast-val">{f.value}</span>
                <span className="act-forecast-label">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="act-ml-block">
          <h4>Engagement health</h4>
          <div className="act-gauge">
            <div className="act-gauge-fill" style={{ width: `${engagement}%` }} />
          </div>
          <p className="act-gauge-text">{healthLabel}</p>
        </div>
      </div>

      <div className="act-ml-lab">
        <div className="act-ml-block act-ml-span">
          <h4>Student cohorts <small>K-Means clustering</small></h4>
          <div className="act-clusters">
            {clusters.counts.map((c, i) => (
              <div key={i} className="act-cluster">
                <span className="act-cluster-dot" style={{ background: ["#14b8a6", "#f59e0b", "#6366f1"][i % 3] }} />
                <span className="act-cluster-count">{c}</span>
                <span className="act-cluster-label">Cohort {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="act-ml-block">
          <h4>Risk model <small>churn classifier</small></h4>
          <ul className="act-risk-list">
            <li><span className="act-risk-pill risk-at">At risk</span> {risk["At risk"]}</li>
            <li><span className="act-risk-pill risk-stable">Stable</span> {risk.Stable}</li>
            <li><span className="act-risk-pill risk-thriving">Thriving</span> {risk.Thriving}</li>
          </ul>
        </div>

        <div className="act-ml-block act-ml-span">
          <h4>Smart recommendation <small>content-based</small></h4>
          <p className="act-reco">💡 {recommendation}</p>
          <p className="act-trend">7-day trend (moving avg): {trend.join(" → ")}</p>
        </div>
      </div>

      {anomalyCount > 0 && (
        <div className="act-anomaly-banner">
          <DashboardIcon name="shield" />
          <span>
            ML anomaly detector flagged {anomalyCount} unusual registration{" "}
            {anomalyCount === 1 ? "pattern" : "patterns"} in the last 7 days.
          </span>
        </div>
      )}

      <div className="act-controls">
        <div className="act-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`act-filter${filter === f.key ? " is-active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="act-search"
          placeholder="Filter activity…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ul className="db-activity-list">
        {filtered.length === 0 && <li className="act-empty">No activity matches your filters.</li>}
        {filtered.map((e) => (
          <li className="db-activity-item" key={e.id}>
            <span className={`db-activity-icon db-activity-${e.color}`}>
              <DashboardIcon name={ICON_FOR_TYPE[e.type] || "database"} />
            </span>
            <div>
              <p className="db-activity-text">{e.title}</p>
              <p className="db-activity-time">
                {e.time} · {e.detail}
              </p>
            </div>
            <span className="act-score" title="ML importance score">
              {e.score.toFixed(1)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ActivityView;
