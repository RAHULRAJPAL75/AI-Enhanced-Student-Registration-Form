import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const API_ORIGIN = "http://localhost:5000";

const roleConfig = {
  student: {
    roleLabel: "Student",
    roleColor: "#14b8a6",
    bio: "Dedicated student focused on agile practices, full-stack development, and continuous learning. Building real projects through sprint-based workflows.",
    skills: [
      { label: "JavaScript / React", pct: 88 },
      { label: "HTML & CSS", pct: 92 },
      { label: "Node.js", pct: 74 },
      { label: "Git & Version Control", pct: 85 },
      { label: "Problem Solving", pct: 80 },
      { label: "Team Collaboration", pct: 90 },
    ],
    tools: [
      { name: "VS Code", tag: "IDE", desc: "Primary editor for frontend and backend development." },
      { name: "GitHub", tag: "Version Control", desc: "Collaborating on projects and managing code repositories." },
      { name: "Figma", tag: "Design", desc: "UI/UX prototyping and design handoff for projects." },
      { name: "Postman", tag: "API Testing", desc: "Testing and debugging REST API endpoints." },
      { name: "MongoDB Compass", tag: "Database", desc: "Managing student records and exploring collections." },
      { name: "Notion", tag: "Notes", desc: "Sprint planning, documentation, and knowledge management." },
    ],
    projects: [
      {
        title: "Student Management Portal",
        status: "Completed",
        desc: "Full-stack CRUD application for managing student records with MongoDB and Express.",
        tags: ["React", "Node.js", "MongoDB"],
      },
      {
        title: "Agile Sprint Planner",
        status: "In Progress",
        desc: "Interactive sprint planning tool with task boards and velocity tracking.",
        tags: ["React", "CSS Grid", "LocalStorage"],
      },
      {
        title: "Portfolio Website",
        status: "Live",
        desc: "Personal portfolio showcasing projects built during the learning journey.",
        tags: ["HTML", "CSS", "JavaScript"],
      },
    ],
    certs: [
      { name: "Responsive Web Design", issuer: "freeCodeCamp", date: "2024" },
      { name: "JavaScript Algorithms", issuer: "freeCodeCamp", date: "2024" },
      { name: "Agile Fundamentals", issuer: "Scrum.org", date: "2025" },
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
      { value: "3", label: "Projects" },
      { value: "3", label: "Certifications" },
      { value: "92%", label: "Top Skill" },
      { value: "Sprint 4", label: "Current Sprint" },
    ],
  },
  instructor: {
    roleLabel: "Instructor",
    roleColor: "#a78bfa",
    bio: "Experienced instructor guiding students through agile development, modern web technologies, and hands-on project-based learning.",
    skills: [
      { label: "Curriculum Design", pct: 95 },
      { label: "Full-Stack Teaching", pct: 90 },
      { label: "Agile Mentoring", pct: 92 },
      { label: "Code Review", pct: 88 },
      { label: "Technical Writing", pct: 85 },
      { label: "Student Engagement", pct: 94 },
    ],
    tools: [
      { name: "Miro", tag: "Collaboration", desc: "Virtual whiteboarding for sprint planning and retrospectives." },
      { name: "Jira", tag: "Project Mgmt", desc: "Managing student sprints, backlogs, and agile workflows." },
      { name: "GitHub Classroom", tag: "Education", desc: "Distributing assignments and auto-grading student repos." },
      { name: "Loom", tag: "Screencasts", desc: "Recording tutorials, walkthroughs, and feedback videos." },
      { name: "CodePen", tag: "Live Coding", desc: "Browser-based code demonstrations for frontend concepts." },
      { name: "Slack", tag: "Communication", desc: "Office hours, announcements, and team discussions." },
    ],
    projects: [
      {
        title: "React Workshop Series",
        status: "Ongoing",
        desc: "A 6-week hands-on workshop covering React fundamentals, hooks, and state management.",
        tags: ["React", "Workshop", "Curriculum"],
      },
      {
        title: "Agile Simulator",
        status: "In Progress",
        desc: "Interactive simulation tool to teach sprint planning and Scrum ceremonies.",
        tags: ["Node.js", "WebSockets", "Teaching"],
      },
      {
        title: "Code Review Playbook",
        status: "Published",
        desc: "Comprehensive guide for effective code reviews and feedback best practices.",
        tags: ["Documentation", "GitHub", "Best Practices"],
      },
    ],
    certs: [
      { name: "Certified ScrumMaster", issuer: "Scrum Alliance", date: "2023" },
      { name: "Advanced React Patterns", issuer: "Frontend Masters", date: "2024" },
      { name: "Technical Teaching", issuer: "Coursera", date: "2024" },
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
      { value: "120+", label: "Students Taught" },
      { value: "8", label: "Workshops" },
      { value: "95%", label: "Satisfaction" },
      { value: "3", label: "Courses" },
    ],
  },
  admin: {
    roleLabel: "Admin",
    roleColor: "#fb923c",
    bio: "System administrator managing platform infrastructure, user access, database integrity, and operational excellence.",
    skills: [
      { label: "System Administration", pct: 94 },
      { label: "Database Management", pct: 90 },
      { label: "Security & Access Control", pct: 88 },
      { label: "DevOps & Deployment", pct: 82 },
      { label: "Data Analytics", pct: 78 },
      { label: "Incident Response", pct: 86 },
    ],
    tools: [
      { name: "MongoDB Atlas", tag: "Database", desc: "Managing clusters, backups, and performance monitoring." },
      { name: "Docker", tag: "Containers", desc: "Containerizing services for consistent deployment environments." },
      { name: "AWS Console", tag: "Cloud", desc: "Managing EC2, S3, and cloud infrastructure resources." },
      { name: "Cloudflare", tag: "Security", desc: "DNS, CDN, and DDoS protection for the platform." },
      { name: "Grafana", tag: "Monitoring", desc: "System metrics, dashboards, and alert configuration." },
      { name: "Postman", tag: "API", desc: "Testing internal APIs and managing environment configs." },
    ],
    projects: [
      {
        title: "Platform Migration",
        status: "Completed",
        desc: "Migrated from legacy hosting to containerized architecture with zero downtime.",
        tags: ["Docker", "AWS", "CI/CD"],
      },
      {
        title: "SSO Integration",
        status: "In Progress",
        desc: "Implementing single sign-on for seamless user authentication across services.",
        tags: ["OAuth2", "Security", "Auth0"],
      },
      {
        title: "Monitoring Dashboard",
        status: "Live",
        desc: "Real-time system health dashboard with automated alerts and uptime tracking.",
        tags: ["Grafana", "Prometheus", "Alerting"],
      },
    ],
    certs: [
      { name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2023" },
      { name: "MongoDB Administrator", issuer: "MongoDB University", date: "2024" },
      { name: "Certified Ethical Hacker", issuer: "EC-Council", date: "2024" },
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
      { value: "99.9%", label: "Uptime SLA" },
      { value: "1.2k", label: "Users Managed" },
      { value: "50+", label: "Deployments" },
      { value: "<5m", label: "Incident MTTR" },
    ],
  },
};

function ProfileEditModal({ open, onClose, profileForm, onChange, onSave, saving }) {
  if (!open) return null;

  return (
    <div className="prof-modal-overlay" onClick={onClose}>
      <div className="prof-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="prof-modal-header">
          <h2>Edit Profile</h2>
          <button className="prof-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="prof-modal-body">
          <label>
            Name
            <input name="name" value={profileForm.name} onChange={onChange} />
          </label>
          <label>
            Email
            <input name="email" value={profileForm.email} onChange={onChange} />
          </label>
<label>
             Bio
             <textarea name="bio" rows={4} value={profileForm.bio} onChange={onChange} />
           </label>
           
           <label>
             Skills
             <input name="skillsText" value={profileForm.skillsText} onChange={onChange} placeholder="React, Node.js, MongoDB" />
           </label>
          <label>
            Tools
            <input name="toolsText" value={profileForm.toolsText} onChange={onChange} placeholder="VS Code, GitHub, Postman" />
          </label>
          <label>
            Projects
            <input name="projectsText" value={profileForm.projectsText} onChange={onChange} placeholder="Student Portal, Agile Planner" />
          </label>
          <label>
            Certifications
            <input name="certsText" value={profileForm.certsText} onChange={onChange} placeholder="Certified ScrumMaster, JS Algorithms" />
          </label>
          <label>
            Roadmap
            <input name="roadmapText" value={profileForm.roadmapText} onChange={onChange} placeholder="HTML/CSS, React, Node.js" />
          </label>
        </div>

        <div className="prof-modal-footer">
          <button className="prof-button prof-button-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="prof-button prof-button-primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage({ currentUser, joinedDate, onSaveProfile, onUploadProfileImage }) {
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const profileImageInputRef = useRef(null);
const [profileForm, setProfileForm] = useState({
  name: "",
  email: "",
  bio: "",
  skillsText: "",
  toolsText: "",
  projectsText: "",
  certsText: "",
  roadmapText: "",
  imageUrl: "",
});

  const userRole = currentUser?.role || "student";
  const config = roleConfig[userRole] || roleConfig.student;
  const userBio = currentUser?.bio || config.bio;
  const skills = currentUser?.skills || config.skills;
  const tools = currentUser?.tools || config.tools;
  const projects = currentUser?.projects || config.projects;
  const certs = currentUser?.certs || config.certs;
  const roadmap = currentUser?.roadmap || config.roadmap;

useEffect(() => {
  if (!profileModalOpen) return;
  
  setProfileForm({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    bio: userBio,
    skillsText: (currentUser?.skills || config.skills).map((item) => item.label || item.name || item.title || item).join(", "),
    toolsText: (currentUser?.tools || config.tools).map((item) => item.name || item).join(", "),
    projectsText: (currentUser?.projects || config.projects).map((item) => item.title || item).join(", "),
    certsText: (currentUser?.certs || config.certs).map((item) => item.name || item).join(", "),
    roadmapText: (currentUser?.roadmap || config.roadmap).map((item) => item.title || item).join(", "),
  });
}, [profileModalOpen, currentUser, userBio, config.skills, config.tools, config.projects, config.certs, config.roadmap]);

const handleProfileFieldChange = (event) => {
  const { name, value } = event.target;
  setProfileForm((prev) => ({ ...prev, [name]: value }));
};

  const parseSimpleList = (text) =>
    text
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

const buildProfilePayload = () => {
  const safe = (val) => (val || "").trim();
  const name = safe(profileForm.name);
  const email = safe(profileForm.email);
  const bio = safe(profileForm.bio);
  const skillsText = safe(profileForm.skillsText);
  const toolsText = safe(profileForm.toolsText);
  const projectsText = safe(profileForm.projectsText);
  const certsText = safe(profileForm.certsText);
  const roadmapText = safe(profileForm.roadmapText);
  
  if (!name || !email) {
    throw new Error("Name and email are required.");
  }
  
  return {
    name,
    email,
    bio,
    skills: parseSimpleList(skillsText).map((label) => ({
      label,
      pct: 80,
    })),
    tools: parseSimpleList(toolsText).map((name) => ({
      name,
      tag: "Tool",
      desc: "",
    })),
    projects: parseSimpleList(projectsText).map((title, index) => ({
      title,
      status: "In Progress",
      desc: "",
      tags: [],
    })),
    certs: parseSimpleList(certsText).map((name) => ({
      name,
      issuer: "",
      date: "",
    })),
    roadmap: parseSimpleList(roadmapText).map((title, index) => ({
      step: String(index + 1).padStart(2, "0"),
      title,
      done: false,
      desc: "",
    })),
  };
};

  const saveProfileDetails = async () => {
    setSavingProfile(true);
    try {
      await onSaveProfile?.(buildProfilePayload());
      setProfileModalOpen(false);
    } catch (error) {
      console.error("Profile save failed:", error);
      toast.error(error.message || "Profile update failed.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfileImageSelection = async (event) => {
    const imageFile = event.target.files?.[0];
    event.target.value = "";
    if (!imageFile || !onUploadProfileImage) return;

    try {
      await onUploadProfileImage(imageFile);
    } catch (error) {
      toast.error(error.message || "Profile image upload failed.");
    }
  };

  const firstName = currentUser?.name?.split(" ")[0] || "User";
  const initial = (currentUser?.name || "U").charAt(0).toUpperCase();
  const profileImageSrc = currentUser?.profileImage
    ? currentUser.profileImage.startsWith("/")
      ? `${API_ORIGIN}${currentUser.profileImage}`
      : currentUser.profileImage
    : "";

  const statusColor = (s) => {
    if (s === "Completed" || s === "Live" || s === "Published" || s === "Ongoing") return "#4ade80";
    if (s === "In Progress") return "#fbbf24";
    return "#94a3b8";
  };

  return (
    <div className="prof-page">
      <div className="prof-header">
        <div className="prof-header-left">
          {profileImageSrc ? (
            <img
              className="prof-avatar prof-avatar-image prof-avatar-clickable"
              src={profileImageSrc}
              alt={`${currentUser?.name || "User"} profile`}
              onClick={() => profileImageInputRef.current?.click()}
              title="Change profile photo"
            />
          ) : (
            <div
              className="prof-avatar prof-avatar-clickable"
              onClick={() => profileImageInputRef.current?.click()}
              title="Upload profile photo"
            >
              {initial}
            </div>
          )}
          <div className="prof-header-info">
            <h1 className="prof-name">{currentUser?.name || "User"}</h1>
            <p className="prof-role-email">
              <span className="prof-role-pill" style={{ background: `${config.roleColor}18`, color: config.roleColor, borderColor: `${config.roleColor}30` }}>
                {config.roleLabel}
              </span>
              <span className="prof-separator">/</span>
              <span className="prof-email">{currentUser?.email}</span>
            </p>
          </div>
        </div>
         <input
           ref={profileImageInputRef}
           type="file"
           accept="image/*"
           onChange={handleProfileImageSelection}
           hidden
         />
         <div className="prof-header-actions">
           <button className="prof-edit-btn" onClick={() => setProfileModalOpen(true)}>
             Edit Profile
           </button>
           <button className="prof-edit-btn" onClick={() => profileImageInputRef.current?.click()}>
             {profileImageSrc ? "Change Photo" : "Upload Photo"}
           </button>
         </div>
         
        </div>

      <div className="prof-stats-row">
        {(currentUser?.stats || config.stats).map((stat) => (
          <div key={stat.label} className="prof-stat">
            <span className="prof-stat-value">{stat.value}</span>
            <span className="prof-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="prof-section">
        <h2 className="prof-section-title">About</h2>
        <p className="prof-bio">{userBio}</p>
      </div>

      <div className="prof-grid-2">
        <div className="prof-section">
          <h2 className="prof-section-title">Skills</h2>
          <div className="prof-skills-list">
            {skills.map((s) => (
              <div key={s.label} className="prof-skill-item">
                <span className="prof-skill-name">{s.label}</span>
                <span className="prof-skill-level">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="prof-section">
          <h2 className="prof-section-title">Tools</h2>
          <div className="prof-tools-list">
            {tools.map((t) => (
              <div key={t.name} className="prof-tool-item">
                <div className="prof-tool-info">
                  <span className="prof-tool-name">{t.name}</span>
                  <span className="prof-tool-desc">{t.desc}</span>
                </div>
                <span className="prof-tool-tag">{t.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="prof-section">
        <h2 className="prof-section-title">Projects</h2>
        <div className="prof-projects-list">
          {projects.map((p) => (
            <div key={p.title} className="prof-project-item">
              <div className="prof-project-header">
                <span className="prof-project-title">{p.title}</span>
                <span className="prof-project-status" style={{ color: statusColor(p.status) }}>
                  {p.status}
                </span>
              </div>
              <p className="prof-project-desc">{p.desc}</p>
              <div className="prof-project-tags">
                {p.tags.map((t) => (
                  <span key={t} className="prof-project-tag">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="prof-section">
        <h2 className="prof-section-title">Certifications</h2>
        <div className="prof-certs-list">
          {certs.map((c) => (
            <div key={c.name} className="prof-cert-item">
              <div className="prof-cert-info">
                <span className="prof-cert-name">{c.name}</span>
                <span className="prof-cert-meta">{c.issuer} &middot; {c.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="prof-section">
        <h2 className="prof-section-title">Roadmap</h2>
        <div className="prof-roadmap">
          {roadmap.map((item) => (
            <div key={item.step} className={`prof-roadmap-item${item.done ? " is-done" : ""}`}>
              <div className="prof-roadmap-marker">
                {item.done ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span>{item.step}</span>
                )}
              </div>
              <div className="prof-roadmap-content">
                <p className="prof-roadmap-title">{item.title}</p>
                <p className="prof-roadmap-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProfileEditModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profileForm={profileForm}
        onChange={handleProfileFieldChange}
        onSave={saveProfileDetails}
        saving={savingProfile}
      />
    </div>
  );
}
