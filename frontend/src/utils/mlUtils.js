// Lightweight, dependency-free ML utilities for the activity dashboard.
// Pure JS implementations of common ML primitives (regression, anomaly
// detection, scoring/ranking) so the dashboard stays fully client-side.

export function linearRegression(points) {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0, predict: () => 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope,
    intercept,
    predict: (x) => Math.max(0, slope * x + intercept),
  };
}

export function forecastSeries(dailyBuckets, days = 3) {
  const safe = Array.isArray(dailyBuckets) ? dailyBuckets : [];
  const points = safe.map((b, i) => ({ x: i, y: Number(b.count) || 0 }));
  const model = linearRegression(points);
  const lastX = points.length - 1;

  const forecast = [];
  for (let d = 1; d <= days; d += 1) {
    const x = lastX + d;
    forecast.push({
      label: d === 1 ? "Tomorrow" : `+${d}d`,
      value: Math.round(model.predict(x) * 10) / 10,
    });
  }
  return forecast;
}

export function detectAnomalies(dailyBuckets, threshold = 1.6) {
  const safe = Array.isArray(dailyBuckets) ? dailyBuckets : [];
  const counts = safe.map((b) => Number(b.count) || 0);
  const mean = counts.reduce((a, b) => a + b, 0) / (counts.length || 1);
  const variance =
    counts.reduce((a, b) => a + (b - mean) ** 2, 0) / (counts.length || 1);
  const std = Math.sqrt(variance) || 1;

  return safe.map((b, i) => {
    const z = (Number(b.count) || 0 - mean) / std;
    return {
      ...b,
      zScore: z,
      isAnomaly: Math.abs(z) > threshold,
      mean,
      std,
    };
  });
}

export function computeEngagementScore({ studentCount = 0, recentStudentCount = 0, activeNow = true }) {
  const volume = Math.min(100, studentCount * 4);
  const momentum = Math.min(100, recentStudentCount * 18);
  const live = activeNow ? 8 : 0;
  const score = Math.round(0.5 * volume + 0.42 * momentum + 0.08 * live);
  return Math.max(0, Math.min(100, score));
}

const ACTIVITY_TYPES = {
  registration: { category: "Registration", color: "green", weight: 0.9 },
  signin: { category: "Access", color: "blue", weight: 0.6 },
  sprint: { category: "Sprint", color: "amber", weight: 0.75 },
  system: { category: "System", color: "indigo", weight: 0.4 },
  profile: { category: "Profile", color: "violet", weight: 0.5 },
};

export function classifyActivity(type) {
  return ACTIVITY_TYPES[type] || { category: "Event", color: "slate", weight: 0.5 };
}

export function formatRelative(date) {
  if (!date) return "recently";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "recently";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function buildActivityStream({
  studentsList = [],
  joinedDate,
  sprintReadiness = 0,
  registrationBars = [],
  studentCount = 0,
  recentStudentCount = 0,
  newestStudent = null,
}) {
  const events = [
    {
      id: "acc-created",
      type: "profile",
      title: "Account created and verified in MongoDB",
      time: joinedDate || "Recently",
      detail: "Identity secured with hashed credentials",
      score: 7,
    },
    {
      id: "signin",
      type: "signin",
      title: "Signed in to the student operations dashboard",
      time: "Current session",
      detail: "Secure session established",
      score: 5,
    },
    {
      id: "sprint",
      type: "sprint",
      title: "Sprint workspace is ready for planning",
      time: `${sprintReadiness}% readiness score`,
      detail: "Ceremonies queued and backlog estimated",
      score: 6,
    },
    {
      id: "system",
      type: "system",
      title: "MongoDB collection connected",
      time: "student_db.students · live",
      detail: `${studentCount} records indexed`,
      score: 4,
    },
  ];

  const anomalies = detectAnomalies(registrationBars);
  anomalies.forEach((b, i) => {
    if (b.isAnomaly) {
      events.push({
        id: `anom-${i}`,
        type: "registration",
        title: `Registration ${b.count > b.mean ? "spike" : "dip"} detected`,
        time: b.label,
        detail: `${b.count} sign-ups · z-score ${b.zScore.toFixed(1)}`,
        score: 9,
      });
    }
  });

  if (newestStudent && newestStudent.name) {
    events.push({
      id: "newest",
      type: "registration",
      title: `New student onboarded: ${newestStudent.name}`,
      time: formatRelative(newestStudent.createdAt),
      detail: newestStudent.email,
      score: 8,
    });
  }

  return events
    .map((e) => {
      const cls = classifyActivity(e.type);
      return { ...e, ...cls, score: e.score * cls.weight };
    })
    .sort((a, b) => b.score - a.score);
}

// ── Time-series smoothing ──
export function movingAverage(series, window = 3) {
  const out = [];
  for (let i = 0; i < series.length; i += 1) {
    const start = Math.max(0, i - window + 1);
    const slice = series.slice(start, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    out.push(Math.round(avg * 10) / 10);
  }
  return out;
}

const euclidean = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));

// ── Unsupervised learning: K-Means (Lloyd's algorithm) ──
export function kmeans(points, k = 3, maxIter = 60) {
  if (!points.length) return { centroids: [], assignments: [] };
  const dims = points[0].features.length;
  const centroids = points.slice(0, k).map((p) => [...p.features]);
  while (centroids.length < k) {
    centroids.push([...points[Math.floor(Math.random() * points.length)].features]);
  }

  let assignments = [];
  for (let iter = 0; iter < maxIter; iter += 1) {
    assignments = points.map((p) => {
      let best = 0;
      let bestD = Infinity;
      centroids.forEach((c, i) => {
        const d = euclidean(p.features, c);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    });

    const next = centroids.map((_, ci) => {
      const members = points.filter((__, i) => assignments[i] === ci);
      if (!members.length) return centroids[ci];
      const sum = members.reduce(
        (acc, p) => p.features.map((v, j) => (acc[j] || 0) + v),
        new Array(dims).fill(0)
      );
      return sum.map((v) => v / members.length);
    });

    const stable = next.every((c, i) =>
      c.every((v, j) => Math.abs(v - centroids[i][j]) < 1e-4)
    );
    centroids.splice(0, centroids.length, ...next);
    if (stable) break;
  }

  return { centroids, assignments };
}

// Build student feature vectors for clustering:
// [recency (0=new..1=old), hasProfileImage, hasBio]
export function studentFeatureVectors(studentsList = []) {
  return studentsList.map((s) => {
    const days = s.createdAt
      ? (Date.now() - new Date(s.createdAt).getTime()) / 86400000
      : 30;
    const recency = Math.min(1, days / 60);
    return {
      id: s._id || s.id,
      features: [recency, s.profileImage ? 1 : 0, s.bio ? 1 : 0],
    };
  });
}

// ── Supervised-style classification: student risk / churn model ──
export function classifyStudentRisk({ daysSinceJoin = 30, hasProfileImage = false, hasBio = false, recentActivity = true }) {
  let score = 0;
  if (daysSinceJoin > 30) score += 2;
  if (!hasProfileImage) score += 1;
  if (!hasBio) score += 1;
  if (!recentActivity) score += 2;
  const level = score >= 4 ? "At risk" : score >= 2 ? "Stable" : "Thriving";
  return { score, level };
}

// ── Recommendation system: content-based next-best-action ──
export function recommendNextAction(profile) {
  const areas = [
    { label: "Upload a profile photo to build trust", done: !!profile?.profileImage },
    { label: "Write a short bio so peers know you", done: !!(profile?.bio && profile.bio.length > 10) },
    { label: "Add your skills to the profile", done: (profile?.skills?.length || 0) > 0 },
    { label: "Showcase a project in your portfolio", done: (profile?.projects?.length || 0) > 0 },
    { label: "Keep your weekly sprint streak alive", done: false },
  ];
  return areas.find((a) => !a.done)?.label || "You're all set — mentor a newcomer next";
}
