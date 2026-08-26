import { useState, useEffect, useCallback, useRef } from "react";
import Registration from "./Registration";
import Login from "./Login";
import ProfilePage from "./src/pages/Profile";
import "./src/styles/app.css";

const heroPhoto =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1800&q=85";

const photoStories = [
  {
    title: "Sprint planning",
    text: "Shape student projects into focused two-week delivery goals.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Pair programming",
    text: "Practice real collaboration with reviews, demos, and shared code.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Product demos",
    text: "Present working increments and learn from fast feedback loops.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
];

const sprintSteps = ["Discover", "Plan", "Build", "Review"];

const stats = [
  { value: "4", label: "sprint rituals" },
  { value: "12+", label: "project checkpoints" },
  { value: "1", label: "student workspace" },
];

/* ─── Edit Modal Component ─── */
function EditModal({ student, onClose, onSave }) {
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Both name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/students/${student._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        onSave(data.student);
      } else {
        setError(data.message || "Update failed.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Student
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-avatar-row">
          <div className="modal-avatar">{student.name.charAt(0).toUpperCase()}</div>
          <div>
            <p className="modal-avatar-name">{student.name}</p>
            <p className="modal-avatar-sub">MongoDB ID: {student._id}</p>
          </div>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              autoFocus
            />
          </label>
          <label>
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-btn-save" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal Component ─── */
function DeleteModal({ student, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/students/${student._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        onConfirm(student._id);
      }
    } catch {
      /* silently close */
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--danger" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title modal-title--danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Delete Student
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-danger-body">
          <div className="modal-danger-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="modal-danger-text">
            Are you sure you want to permanently delete <strong>{student.name}</strong>?
          </p>
          <p className="modal-danger-sub">This action cannot be undone. The student record will be removed from MongoDB.</p>
        </div>
        <div className="modal-actions">
          <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="modal-btn-delete" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
function App() {
  const [activeForm, setActiveForm] = useState("register");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [toast, setToast] = useState(null);
  const searchDebounce = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudents = useCallback(async (query = "") => {
    setIsSearching(true);
    try {
      const url = query
        ? `http://localhost:5000/api/students?search=${encodeURIComponent(query)}`
        : "http://localhost:5000/api/students";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStudentsList(data.students || []);
      }
    } catch (err) {
      console.log("Could not fetch students list:", err.message);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchStudents();
    }
  }, [isLoggedIn, fetchStudents]);

  // Debounce search input → server search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearchQuery(val);
      fetchStudents(val);
    }, 350);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    fetchStudents("");
  };

  const handleAuthSuccess = (studentData) => {
    setCurrentUser(studentData);
    setIsLoggedIn(true);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const showAuth = (formType) => {
    setActiveForm(formType);
    window.requestAnimationFrame(() => scrollToSection("auth-form"));
  };

  const handleNavClick = (event, targetId, formType) => {
    event.preventDefault();
    if (formType) setActiveForm(formType);
    scrollToSection(targetId);
  };

  const handleLogout = (event) => {
    event.preventDefault();
    if (!window.confirm("Did you want to leave?")) {
      return;
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    setStudentsList([]);
    setSearchInput("");
    setSearchQuery("");
    setActiveView("dashboard");
    window.requestAnimationFrame(() => scrollToSection("home"));
  };

  // CRUD Callbacks
  const handleEditSave = (updatedStudent) => {
    setStudentsList((prev) =>
      prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
    );
    setEditingStudent(null);
    showToast(`${updatedStudent.name}'s record updated successfully.`);
  };

  const handleDeleteConfirm = (deletedId) => {
    setStudentsList((prev) => prev.filter((s) => s._id !== deletedId));
    setDeletingStudent(null);
    showToast("Student record deleted from MongoDB.", "warning");
  };

  if (isLoggedIn) {
    const joinedDate = currentUser?.createdAt
      ? new Date(currentUser.createdAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        })
      : "Recently";

    const filteredCount = studentsList.length;
    const showNoResults = searchQuery && filteredCount === 0 && !isSearching;

    return (
      <div className="db-shell">
        {/* Modals */}
        {editingStudent && (
          <EditModal
            student={editingStudent}
            onClose={() => setEditingStudent(null)}
            onSave={handleEditSave}
          />
        )}
        {deletingStudent && (
          <DeleteModal
            student={deletingStudent}
            onClose={() => setDeletingStudent(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}

        {/* Toast notification */}
        {toast && (
          <div className={`toast toast--${toast.type}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              {toast.type === "success"
                ? <polyline points="20 6 9 17 4 12"/>
                : <><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
            </svg>
            {toast.message}
          </div>
        )}

        {/* ── Sidebar ── */}
        <aside className="db-sidebar">
          <div className="db-logo">
            <span className="db-logo-icon">R</span>
            <span>Rahul Lab</span>
          </div>

          <nav className="db-sidenav">
            <span className="db-sidenav-label">Main</span>
            <button
              className={`db-sidenav-link${activeView === "dashboard" ? " is-active" : ""}`}
              onClick={() => setActiveView("dashboard")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              Dashboard
            </button>
            <button
              className={`db-sidenav-link${activeView === "students" ? " is-active" : ""}`}
              onClick={() => setActiveView("students")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>
              Students
            </button>
            <button
              className={`db-sidenav-link${activeView === "activity" ? " is-active" : ""}`}
              onClick={() => setActiveView("activity")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Activity
            </button>
            <span className="db-sidenav-label" style={{ marginTop: "16px" }}>Account</span>
            <button
              className={`db-sidenav-link${activeView === "profile" ? " is-active" : ""}`}
              onClick={() => setActiveView("profile")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              Profile
            </button>
          </nav>

          <button className="db-logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </aside>

        {/* ── Main Content ── */}
        <div className="db-main">
          {/* Top bar — always visible */}
          <header className="db-topbar">
            <div>
              <p className="db-topbar-greeting">
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
                <strong>{currentUser?.name?.split(" ")[0] || "Student"}</strong> 👋
              </p>
              <p className="db-topbar-sub">Here's what's happening in your workspace today.</p>
            </div>
            <button
              className="db-avatar db-avatar-btn"
              title="Go to Profile"
              onClick={() => setActiveView("profile")}
            >
              {(currentUser?.name || "S").charAt(0).toUpperCase()}
            </button>
          </header>

          {/* ── Profile View ── */}
          {activeView === "profile" && (
            <ProfilePage currentUser={currentUser} joinedDate={joinedDate} />
          )}

          {/* ── Dashboard / Students / Activity views ── */}
          {activeView !== "profile" && (
            <>

              {/* KPI Cards */}
              <section className="db-kpi-row" aria-label="Key metrics">
            <article className="db-kpi-card db-kpi-teal">
              <div className="db-kpi-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <p className="db-kpi-num">{studentsList.length}</p>
                <p className="db-kpi-label">Total Students</p>
              </div>
            </article>

            <article className="db-kpi-card db-kpi-coral">
              <div className="db-kpi-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div>
                <p className="db-kpi-num">4</p>
                <p className="db-kpi-label">Sprint Rituals</p>
              </div>
            </article>

            <article className="db-kpi-card db-kpi-gold">
              <div className="db-kpi-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <p className="db-kpi-num">Active</p>
                <p className="db-kpi-label">Account Status</p>
              </div>
            </article>

            <article className="db-kpi-card db-kpi-purple">
              <div className="db-kpi-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              </div>
              <div>
                <p className="db-kpi-num">✓ Live</p>
                <p className="db-kpi-label">MongoDB Status</p>
              </div>
            </article>
              </section>

              {/* Activity Feed — shown on dashboard or activity view */}
              {(activeView === "dashboard" || activeView === "activity") && (
              <div className="db-activity-card" id="activity">
              <h3 className="db-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Recent Activity
              </h3>
              <ul className="db-activity-list">
                <li className="db-activity-item">
                  <div className="db-activity-dot db-dot-green"></div>
                  <div>
                    <p className="db-activity-text">Account created &amp; verified in MongoDB</p>
                    <p className="db-activity-time">{joinedDate}</p>
                  </div>
                </li>
                <li className="db-activity-item">
                  <div className="db-activity-dot db-dot-blue"></div>
                  <div>
                    <p className="db-activity-text">Logged into student dashboard</p>
                    <p className="db-activity-time">Just now</p>
                  </div>
                </li>
                <li className="db-activity-item">
                  <div className="db-activity-dot db-dot-orange"></div>
                  <div>
                    <p className="db-activity-text">Sprint workspace initialized</p>
                    <p className="db-activity-time">Ready for sprint planning</p>
                  </div>
                </li>
                <li className="db-activity-item">
                  <div className="db-activity-dot db-dot-purple"></div>
                  <div>
                    <p className="db-activity-text">MongoDB collection connected</p>
                    <p className="db-activity-time">student_db.students · live</p>
                  </div>
                </li>
                <li className="db-activity-item">
                  <div className="db-activity-dot db-dot-teal"></div>
                  <div>
                    <p className="db-activity-text">Friday showcase sprint demo scheduled</p>
                    <p className="db-activity-time">Upcoming</p>
                  </div>
                </li>
              </ul>
              </div>
              )}

              {/* Students Table — shown on dashboard or students view */}
              {(activeView === "dashboard" || activeView === "students") && (
              <section className="db-table-section" id="students">
            {/* Header row */}
            <div className="db-table-header">
              <h3 className="db-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                Student Records Directory
              </h3>
              <span className="db-table-badge">
                {searchQuery
                  ? `${filteredCount} result${filteredCount !== 1 ? "s" : ""}`
                  : `${filteredCount} registered`}
              </span>
            </div>
            <p className="db-table-sub">
              Live records from <code>student_db.students</code> collection
            </p>

            {/* Search bar */}
            <div className="db-search-row">
              <div className="db-search-wrap">
                <span className="db-search-icon">
                  {isSearching ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="spin">
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  )}
                </span>
                <input
                  id="student-search"
                  className="db-search-input"
                  type="text"
                  placeholder="Search by name or email…"
                  value={searchInput}
                  onChange={handleSearchChange}
                  autoComplete="off"
                />
                {searchInput && (
                  <button className="db-search-clear" onClick={clearSearch} title="Clear search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              <button
                className="db-refresh-btn"
                onClick={() => fetchStudents(searchQuery)}
                title="Refresh records"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Refresh
              </button>
            </div>

            {/* Table or states */}
            {isSearching && studentsList.length === 0 ? (
              <div className="db-empty">
                <div className="db-spinner"></div>
                <p>Searching records…</p>
              </div>
            ) : showNoResults ? (
              <div className="db-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                <p>No students match <strong>"{searchQuery}"</strong></p>
                <button className="db-empty-clear" onClick={clearSearch}>Clear search</button>
              </div>
            ) : studentsList.length === 0 ? (
              <div className="db-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>Loading student records…</p>
              </div>
            ) : (
              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Registered On</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.map((st, i) => (
                      <tr key={st._id}>
                        <td className="db-td-num">{i + 1}</td>
                        <td>
                          <div className="db-student-cell">
                            <div className="db-student-avatar">{st.name.charAt(0).toUpperCase()}</div>
                            <span className="db-student-name">{st.name}</span>
                          </div>
                        </td>
                        <td className="db-td-email">{st.email}</td>
                        <td className="db-td-date">
                          {st.createdAt
                            ? new Date(st.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                              })
                            : "Recently"}
                        </td>
                        <td><span className="db-status-pill">✓ Active</span></td>
                        <td>
                          <div className="db-action-group">
                            <button
                              className="db-action-btn db-action-edit"
                              onClick={() => setEditingStudent(st)}
                              title="Edit student"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <button
                              className="db-action-btn db-action-delete"
                              onClick={() => setDeletingStudent(st)}
                              title="Delete student"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
              </section>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="site-shell">
      <NavBar onNavigate={handleNavClick} onLogout={handleLogout} isLoggedIn={false} />

      <header
        className="hero"
        id="home"
        style={{ "--hero-photo": `url(${heroPhoto})` }}
      >
        <div className="hero-content">
          <p className="eyebrow">Agile software development learning portal</p>
          <h1>Rahul Lab Academy</h1>
          <p className="hero-copy">
            Register students into a modern agile workspace backed by Node.js &amp; MongoDB database.
          </p>
          <div className="hero-actions" aria-label="Student access actions">
            <button className="primary-action" onClick={() => showAuth("register")}>
              Start registration
            </button>
            <button className="secondary-action" onClick={() => showAuth("login")}>
              Student sign in
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="sprint-band" aria-labelledby="sprint-heading">
          <div className="section-inner sprint-layout">
            <div>
              <p className="eyebrow">Built for agile practice</p>
              <h2 id="sprint-heading">A student portal powered by Node.js &amp; MongoDB.</h2>
              <p>
                Students can enter a focused workspace that mirrors the rhythm
                of professional product squads with full MongoDB persistence.
              </p>
            </div>
            <div className="stat-row" aria-label="Portal highlights">
              {stats.map((stat) => (
                <article className="stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process-section" aria-labelledby="process-heading">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow">Sprint workflow</p>
              <h2 id="process-heading">Move from idea to demo with a clear cadence.</h2>
            </div>
            <div className="process-track" aria-label="Agile sprint workflow">
              {sprintSteps.map((step, index) => (
                <article className="process-step" key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="photo-section" aria-labelledby="photos-heading">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow">Learning by building</p>
              <h2 id="photos-heading">Photo-led spaces for modern software education.</h2>
            </div>
            <div className="photo-grid">
              {photoStories.map((story) => (
                <article className="story-card" key={story.title}>
                  <img src={story.image} alt={`${story.title} with an agile team`} />
                  <div>
                    <h3>{story.title}</h3>
                    <p>{story.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="auth-section" id="auth-form" aria-labelledby="auth-heading">
          <div className="section-inner auth-layout">
            <div className="auth-copy">
              <p className="eyebrow">Student access</p>
              <h2 id="auth-heading">Join the next sprint.</h2>
              <p>
                Create an account or sign back in to store your data securely in MongoDB Compass database.
              </p>
            </div>

            <div className="auth-card">
              <div className="segmented-control" role="tablist" aria-label="Account form">
                <button
                  aria-selected={activeForm === "register"}
                  className={activeForm === "register" ? "is-active" : ""}
                  onClick={() => setActiveForm("register")}
                  role="tab"
                  type="button"
                >
                  Register
                </button>
                <button
                  aria-selected={activeForm === "login"}
                  className={activeForm === "login" ? "is-active" : ""}
                  onClick={() => setActiveForm("login")}
                  role="tab"
                  type="button"
                >
                  Login
                </button>
              </div>

              {activeForm === "register" ? (
                <Registration onSuccess={handleAuthSuccess} />
              ) : (
                <Login onSuccess={handleAuthSuccess} />
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function NavBar({ onNavigate, onLogout, isLoggedIn }) {
  const brandTarget = isLoggedIn ? "dashboard" : "home";

  return (
    <nav className="nav-bar">
      <a className="brand" href={`#${brandTarget}`} onClick={(event) => onNavigate(event, brandTarget)}>
        Rahul Lab Academy
      </a>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <a href="#dashboard" onClick={(event) => onNavigate(event, "dashboard")}>Dashboard</a>
            <a href="#logout" onClick={onLogout}>Logout</a>
          </>
        ) : (
          <>
            <a href="#home" onClick={(event) => onNavigate(event, "home")}>Home</a>
            <a href="#process-heading" onClick={(event) => onNavigate(event, "process-heading")}>Workflow</a>
            <a href="#auth-form" onClick={(event) => onNavigate(event, "auth-form", "register")}>Register</a>
            <a href="#auth-form" onClick={(event) => onNavigate(event, "auth-form", "login")}>Login</a>
          </>
        )}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>Rahul Lab Academy</span>
      <span>Agile software development portal for students.</span>
    </footer>
  );
}

export default App;
