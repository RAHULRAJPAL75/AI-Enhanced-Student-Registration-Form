import { useEffect, useState } from "react";

const roleConfig = {
  student: {
    roleLabel: "Student",
    roleColor: "#2dd4bf",
    bio: "Dedicated student focused on agile practices, full-stack development, and continuous learning. Building real projects through sprint-based workflows.",
    skills: [
      { label: "JavaScript / React", pct: 88, color: "#facc15" },
      { label: "HTML & CSS", pct: 92, color: "#2dd4bf" },
      { label: "Node.js", pct: 74, color: "#4ade80" },
      { label: "Git & Version Control", pct: 85, color: "#fb923c" },
      { label: "Problem Solving", pct: 80, color: "#60a5fa" },
      { label: "Team Collaboration", pct: 90, color: "#a78bfa" },
    ],
    tools: [
      { name: "VS Code", tag: "IDE", desc: "Primary editor for frontend and backend development.", color: "#2dd4bf" },
      { name: "GitHub", tag: "Version Control", desc: "Collaborating on projects and managing code repositories.", color: "#facc15" },
      { name: "Figma", tag: "Design", desc: "UI/UX prototyping and design handoff for projects.", color: "#fb923c" },
      { name: "Postman", tag: "API Testing", desc: "Testing and debugging REST API endpoints.", color: "#60a5fa" },
      { name: "MongoDB Compass", tag: "Database", desc: "Managing student records and exploring collections.", color: "#4ade80" },
      { name: "Notion", tag: "Notes", desc: "Sprint planning, documentation, and knowledge management.", color: "#a78bfa" },
    ],
    projects: [
      {
        title: "Student Management Portal",
        status: "Completed",
        statusColor: "#2dd4bf",
        desc: "Full-stack CRUD application for managing student records with MongoDB and Express.",
        tags: ["React", "Node.js", "MongoDB"],
      },
      {
        title: "Agile Sprint Planner",
        status: "In Progress",
        statusColor: "#fbbf24",
        desc: "Interactive sprint planning tool with task boards and velocity tracking.",
        tags: ["React", "CSS Grid", "LocalStorage"],
      },
      {
        title: "Portfolio Website",
        status: "Live",
        statusColor: "#4ade80",
        desc: "Personal portfolio showcasing projects built during the learning journey.",
        tags: ["HTML", "CSS", "JavaScript"],
      },
    ],
    certs: [
      { name: "Responsive Web Design", issuer: "freeCodeCamp", date: "2024", badgeColor: "#2dd4bf" },
      { name: "JavaScript Algorithms", issuer: "freeCodeCamp", date: "2024", badgeColor: "#facc15" },
      { name: "Agile Fundamentals", issuer: "Scrum.org", date: "2025", badgeColor: "#60a5fa" },
    ],
    roadmap: [
      { step: "01", title: "HTML/CSS Foundations", done: true, desc: "Mastered semantic markup, Flexbox, Grid, and responsive design." },
      { step: "02", title: "JavaScript Core", done: true, desc: "ES6+, DOM manipulation, async patterns, and fetch API." },
      { step: "03", title: "React & State Management", done: true, desc: "Components, hooks, context, and props drilling patterns." },
      { step: "04", title: "Backend with Node.js", done: false, desc: "Express.js, REST APIs, middleware, and MongoDB integration." },
      { step: "05", title: "Testing & Deployment", done: false, desc: "Vitest/Jest, CI/CD, and cloud deployment strategies." },
      { step: "06", title: "System Design Basics", done: false, desc: "Scalability, caching, databases, and architecture patterns." },
    ],
    stats: [
      { value: "3", label: "Projects", icon: "🚀" },
      { value: "3", label: "Certifications", icon: "🏅" },
      { value: "4", label: "Tools Used", icon: "🛠️" },
      { value: "92%", label: "Top Skill", icon: "📈" },
      { value: "Sprint 4", label: "Current Sprint", icon: "⚡" },
    ],
    sectionTitle: "Skills & Learning",
  },
  instructor: {
    roleLabel: "Instructor",
    roleColor: "#a78bfa",
    bio: "Experienced instructor guiding students through agile development, modern web technologies, and hands-on project-based learning.",
    skills: [
      { label: "Curriculum Design", pct: 95, color: "#a78bfa" },
      { label: "Full-Stack Teaching", pct: 90, color: "#2dd4bf" },
      { label: "Agile Mentoring", pct: 92, color: "#60a5fa" },
      { label: "Code Review", pct: 88, color: "#fb923c" },
      { label: "Technical Writing", pct: 85, color: "#4ade80" },
      { label: "Student Engagement", pct: 94, color: "#f472b6" },
    ],
    tools: [
      { name: "Miro", tag: "Collaboration", desc: "Virtual whiteboarding for sprint planning and retrospectives.", color: "#2dd4bf" },
      { name: "Jira", tag: "Project Mgmt", desc: "Managing student sprints, backlogs, and agile workflows.", color: "#60a5fa" },
      { name: "GitHub Classroom", tag: "Education", desc: "Distributing assignments and auto-grading student repos.", color: "#facc15" },
      { name: "Loom", tag: "Screencasts", desc: "Recording tutorials, walkthroughs, and feedback videos.", color: "#fb923c" },
      { name: "CodePen", tag: "Live Coding", desc: "Browser-based code demonstrations for frontend concepts.", color: "#4ade80" },
      { name: "Slack", tag: "Communication", desc: "Office hours, announcements, and team discussions.", color: "#a78bfa" },
    ],
    projects: [
      {
        title: "React Workshop Series",
        status: "Ongoing",
        statusColor: "#a78bfa",
        desc: "A 6-week hands-on workshop covering React fundamentals, hooks, and state management.",
        tags: ["React", "Workshop", "Curriculum"],
      },
      {
        title: "Agile Simulator",
        status: "In Progress",
        statusColor: "#fbbf24",
        desc: "Interactive simulation tool to teach sprint planning and Scrum ceremonies.",
        tags: ["Node.js", "WebSockets", "Teaching"],
      },
      {
        title: "Code Review Playbook",
        status: "Published",
        statusColor: "#2dd4bf",
        desc: "Comprehensive guide for effective code reviews and feedback best practices.",
        tags: ["Documentation", "GitHub", "Best Practices"],
      },
    ],
    certs: [
      { name: "Certified ScrumMaster", issuer: "Scrum Alliance", date: "2023", badgeColor: "#a78bfa" },
      { name: "Advanced React Patterns", issuer: "Frontend Masters", date: "2024", badgeColor: "#2dd4bf" },
      { name: "Technical Teaching", issuer: "Coursera", date: "2024", badgeColor: "#60a5fa" },
    ],
    roadmap: [
      { step: "01", title: "Pedagogy Foundations", done: true, desc: "Learning styles, Bloom's taxonomy, and instructional design." },
      { step: "02", title: "Curriculum Design", done: true, desc: "Structured course outlines, learning objectives, and assessments." },
      { step: "03", title: "Agile Teaching", done: true, desc: "Applying sprint methodology to classroom and workshop settings." },
      { step: "04", title: "Assessment Strategies", done: false, desc: "Formative and summative assessments, rubrics, and feedback loops." },
      { step: "05", title: "EdTech Integration", done: false, desc: "Leveraging tools and platforms for interactive learning." },
      { step: "06", title: "Research & Publication", done: false, desc: "Contributing to CS education research and open educational resources." },
    ],
    stats: [
      { value: "120+", label: "Students Taught", icon: "🎓" },
      { value: "8", label: "Workshops", icon: "📚" },
      { value: "95%", label: "Satisfaction", icon: "⭐" },
      { value: "15", label: "Certifications", icon: "🏅" },
      { value: "3", label: "Courses", icon: "📖" },
    ],
    sectionTitle: "Teaching Expertise",
  },
  admin: {
    roleLabel: "Admin",
    roleColor: "#fb923c",
    bio: "System administrator managing platform infrastructure, user access, database integrity, and operational excellence.",
    skills: [
      { label: "System Administration", pct: 94, color: "#fb923c" },
      { label: "Database Management", pct: 90, color: "#60a5fa" },
      { label: "Security & Access Control", pct: 88, color: "#f87171" },
      { label: "DevOps & Deployment", pct: 82, color: "#4ade80" },
      { label: "Data Analytics", pct: 78, color: "#a78bfa" },
      { label: "Incident Response", pct: 86, color: "#facc15" },
    ],
    tools: [
      { name: "MongoDB Atlas", tag: "Database", desc: "Managing clusters, backups, and performance monitoring.", color: "#4ade80" },
      { name: "Docker", tag: "Containers", desc: "Containerizing services for consistent deployment environments.", color: "#60a5fa" },
      { name: "AWS Console", tag: "Cloud", desc: "Managing EC2, S3, and cloud infrastructure resources.", color: "#fb923c" },
      { name: "Cloudflare", tag: "Security", desc: "DNS, CDN, and DDoS protection for the platform.", color: "#f87171" },
      { name: "Grafana", tag: "Monitoring", desc: "System metrics, dashboards, and alert configuration.", color: "#facc15" },
      { name: "Postman", tag: "API", desc: "Testing internal APIs and managing environment configs.", color: "#a78bfa" },
    ],
    projects: [
      {
        title: "Platform Migration",
        status: "Completed",
        statusColor: "#2dd4bf",
        desc: "Migrated from legacy hosting to containerized architecture with zero downtime.",
        tags: ["Docker", "AWS", "CI/CD"],
      },
      {
        title: "SSO Integration",
        status: "In Progress",
        statusColor: "#fbbf24",
        desc: "Implementing single sign-on for seamless user authentication across services.",
        tags: ["OAuth2", "Security", "Auth0"],
      },
      {
        title: "Monitoring Dashboard",
        status: "Live",
        statusColor: "#4ade80",
        desc: "Real-time system health dashboard with automated alerts and uptime tracking.",
        tags: ["Grafana", "Prometheus", "Alerting"],
      },
    ],
    certs: [
      { name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2023", badgeColor: "#fb923c" },
      { name: "MongoDB Administrator", issuer: "MongoDB University", date: "2024", badgeColor: "#4ade80" },
      { name: "Certified Ethical Hacker", issuer: "EC-Council", date: "2024", badgeColor: "#f87171" },
    ],
    roadmap: [
      { step: "01", title: "Infrastructure Setup", done: true, desc: "Provisioned servers, networking, and baseline monitoring." },
      { step: "02", title: "Security Hardening", done: true, desc: "Firewalls, access control, encryption, and compliance checks." },
      { step: "03", title: "CI/CD Pipelines", done: true, desc: "Automated testing, building, and deployment workflows." },
      { step: "04", title: "Disaster Recovery", done: false, desc: "Backup strategies, failover, and incident response playbooks." },
      { step: "05", title: "Cost Optimization", done: false, desc: "Resource rightsizing, auto-scaling, and cloud cost management." },
      { step: "06", title: "Platform Scaling", done: false, desc: "Multi-region deployment, load balancing, and high availability." },
    ],
    stats: [
      { value: "99.9%", label: "Uptime SLA", icon: "📡" },
      { value: "1.2k", label: "Users Managed", icon: "👥" },
      { value: "50+", label: "Deployments", icon: "🚀" },
      { value: "<5m", label: "Incident MTTR", icon: "⚡" },
      { value: "Q3", label: "Current Quarter", icon: "📅" },
    ],
    sectionTitle: "Operations & Infrastructure",
  },
};

/* ── Skill progress bar ── */
function SkillBar({ label, pct, color }) {
  return (
    <div className="prof-skill-row">
      <div className="prof-skill-meta">
        <span className="prof-skill-label">{label}</span>
        <span className="prof-skill-pct">{pct}%</span>
      </div>
      <div className="prof-skill-track">
        <div
          className="prof-skill-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ── Stat chip ── */
function StatChip({ value, label, icon }) {
  return (
    <div className="prof-stat-chip">
      <span className="prof-stat-icon">{icon}</span>
      <p className="prof-stat-value">{value}</p>
      <p className="prof-stat-label">{label}</p>
    </div>
  );
}

/* ── Tool card ── */
function ToolCard({ name, tag, desc, color }) {
  return (
    <div className="prof-tool-card" style={{ borderLeftColor: color }}>
      <div className="prof-tool-top">
        <span className="prof-tool-name">{name}</span>
        <span className="prof-tool-tag" style={{ background: `${color}22`, color }}>{tag}</span>
      </div>
      <p className="prof-tool-desc">{desc}</p>
    </div>
  );
}

/* ── Project card ── */
function ProjectCard({ title, status, statusColor, desc, tags }) {
  return (
    <div className="prof-project-card">
      <div className="prof-project-top">
        <span className="prof-project-title">{title}</span>
        <span className="prof-project-status" style={{ color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}30` }}>
          {status}
        </span>
      </div>
      <p className="prof-project-desc">{desc}</p>
      <div className="prof-project-tags">
        {tags.map((t) => (
          <span key={t} className="prof-project-tag">{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Cert card ── */
function CertCard({ name, issuer, date, badgeColor }) {
  return (
    <div className="prof-cert-card">
      <div className="prof-cert-badge" style={{ background: `${badgeColor}22`, color: badgeColor }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
          <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
        </svg>
      </div>
      <div>
        <p className="prof-cert-name">{name}</p>
        <p className="prof-cert-issuer">{issuer} · {date}</p>
      </div>
    </div>
  );
}

/* ── Main Profile Page ── */
export default function ProfilePage({ currentUser, joinedDate }) {
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState("");
  const [draftBio, setDraftBio] = useState("");

  const userRole = currentUser?.role || "student";
  const config = roleConfig[userRole] || roleConfig.student;

  useEffect(() => {
    setBio(config.bio);
    setDraftBio(config.bio);
  }, [userRole]);

  const firstName = currentUser?.name?.split(" ")[0] || "User";
  const initial = (currentUser?.name || "U").charAt(0).toUpperCase();

  return (
    <div className="prof-page">
      {/* ── Hero banner + identity ── */}
      <div className="prof-hero">
        <div className="prof-hero-banner" />
        <div className="prof-hero-body">
          <div className="prof-hero-left">
            <div className="prof-big-avatar">{initial}</div>
            <div>
              <h1 className="prof-name">{currentUser?.name || "User"}</h1>
              <p className="prof-role-line">
                <span className="prof-role-badge" style={{ background: `${config.roleColor}22`, color: config.roleColor, border: `1px solid ${config.roleColor}40` }}>
                  {config.roleLabel}
                </span>
                <span className="prof-dot">·</span>
                <span className="prof-email">{currentUser?.email}</span>
              </p>
              <div className="prof-badges-row">
                <span className="db-badge db-badge-green">✓ Verified</span>
                <span className="db-badge db-badge-blue">MongoDB</span>
                <span className="db-badge db-badge-orange">Agile</span>
                <span className="prof-badge-ai" style={{ background: `${config.roleColor}15`, color: config.roleColor }}>◆ {config.roleLabel}</span>
              </div>
            </div>
          </div>
          <div className="prof-hero-meta">
            <div><p className="db-meta-label">Joined</p><p className="db-meta-value">{joinedDate}</p></div>
            <div><p className="db-meta-label">Database</p><p className="db-meta-value">student_db</p></div>
            <div><p className="db-meta-label">Role</p><p className="db-meta-value" style={{ color: config.roleColor }}>{config.roleLabel}</p></div>
            <div><p className="db-meta-label">Status</p><p className="db-meta-value" style={{ color: "#4ade80" }}>● Active</p></div>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="prof-stats-row">
        {config.stats.map((stat) => (
          <StatChip key={stat.label} value={stat.value} label={stat.label} icon={stat.icon} />
        ))}
      </div>

      {/* ── Bio card ── */}
      <div className="prof-section-card">
        <div className="prof-section-header">
          <h3 className="db-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            About Me
          </h3>
          <button className="prof-edit-btn" onClick={() => { setEditMode(!editMode); setDraftBio(bio); }}>
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>
        {editMode ? (
          <div className="prof-bio-edit">
            <textarea
              className="prof-bio-textarea"
              value={draftBio}
              onChange={(e) => setDraftBio(e.target.value)}
              rows={4}
            />
            <button className="prof-save-btn" onClick={() => { setBio(draftBio); setEditMode(false); }}>
              Save
            </button>
          </div>
        ) : (
          <p className="prof-bio-text">{bio}</p>
        )}
      </div>

      {/* ── Two-column: Skills + Tools ── */}
      <div className="prof-two-col">
        <div className="prof-section-card">
          <h3 className="db-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            {config.sectionTitle}
          </h3>
          <div className="prof-skills-list">
            {config.skills.map((s) => <SkillBar key={s.label} {...s} />)}
          </div>
        </div>

        <div className="prof-section-card">
          <h3 className="db-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3-3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0z"/>
              <path d="M5 19l6-6m6-6L5 19"/>
            </svg>
            Tools & Platforms
          </h3>
          <div className="prof-tools-grid">
            {config.tools.map((t) => <ToolCard key={t.name} {...t} />)}
          </div>
        </div>
      </div>

      {/* ── Projects ── */}
      <div className="prof-section-card">
        <h3 className="db-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
          {userRole === "student" ? "My Projects" : userRole === "instructor" ? "Programs & Workshops" : "Platform Initiatives"}
        </h3>
        <div className="prof-projects-grid">
          {config.projects.map((p) => <ProjectCard key={p.title} {...p} />)}
        </div>
      </div>

      {/* ── Certifications ── */}
      <div className="prof-section-card">
        <h3 className="db-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
          {userRole === "student" ? "Certifications" : userRole === "instructor" ? "Credentials" : "Certifications & Compliance"}
        </h3>
        <div className="prof-certs-grid">
          {config.certs.map((c) => <CertCard key={c.name} {...c} />)}
        </div>
      </div>

      {/* ── Learning Roadmap ── */}
      <div className="prof-section-card">
        <h3 className="db-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
          {userRole === "student" ? "Learning Roadmap" : userRole === "instructor" ? "Professional Development" : "Operational Roadmap"}
        </h3>
        <div className="prof-roadmap">
          {config.roadmap.map((item) => (
            <div key={item.step} className={`prof-roadmap-item${item.done ? " is-done" : ""}`}>
              <div className="prof-roadmap-dot">
                {item.done
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span>{item.step}</span>}
              </div>
              <div>
                <p className="prof-roadmap-title">{item.title}</p>
                <p className="prof-roadmap-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
