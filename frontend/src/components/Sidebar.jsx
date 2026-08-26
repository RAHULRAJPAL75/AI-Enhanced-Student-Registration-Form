import React from "react";
import { DashboardIcon } from "./DashboardCommon";
import { getInitials, getProfileImageUrl } from "../utils/dashboardUtils";

export function Sidebar({
  activeView,
  setActiveView,
  currentUser,
  studentsLoading,
  studentCount,
  handleLogout,
}) {
  const displayName = currentUser?.name || "Student";
  const profileImageSrc = getProfileImageUrl(currentUser?.profileImage);
  const workspaceHealth = studentsLoading ? 64 : 98;

  return (
    <aside className="db-sidebar" aria-label="Dashboard navigation">
      <div className="db-logo">
        <span className="db-logo-icon">RL</span>
        <span className="db-logo-text">
          <strong>Rahul Lab</strong>
          <small>Student Ops</small>
        </span>
      </div>

      <nav className="db-sidenav">
        <span className="db-sidenav-label">Main</span>
        <button
          className={`db-sidenav-link${activeView === "dashboard" ? " is-active" : ""}`}
          onClick={() => setActiveView("dashboard")}
          type="button"
        >
          <DashboardIcon name="layout" />
          Dashboard
        </button>
        <button
          className={`db-sidenav-link${activeView === "students" ? " is-active" : ""}`}
          onClick={() => setActiveView("students")}
          type="button"
        >
          <DashboardIcon name="users" />
          Students
        </button>
        <button
          className={`db-sidenav-link${activeView === "activity" ? " is-active" : ""}`}
          onClick={() => setActiveView("activity")}
          type="button"
        >
          <DashboardIcon name="activity" />
          Activity
        </button>

        <span className="db-sidenav-label db-sidenav-label-spaced">Account</span>
        <button
          className={`db-sidenav-link${activeView === "profile" ? " is-active" : ""}`}
          onClick={() => setActiveView("profile")}
          type="button"
        >
          <DashboardIcon name="profile" />
          Profile
        </button>
      </nav>

      <div className="db-sidebar-card">
        <span>Workspace Health</span>
        <strong>{studentsLoading ? "Syncing" : "Live"}</strong>
        <div className="db-sidebar-meter" aria-label={`${workspaceHealth}% workspace health`}>
          <span style={{ "--progress": `${workspaceHealth}%` }} />
        </div>
        <p>{studentCount} records connected</p>
      </div>

      <div className="db-sidebar-user">
        <span className="db-mini-avatar">
          {profileImageSrc ? (
            <img src={profileImageSrc} alt={`${displayName} profile`} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          ) : getInitials(displayName)}
        </span>
        <span>
          <strong>{displayName}</strong>
          <small style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{
              display: "inline-block",
              padding: "1px 6px",
              borderRadius: "8px",
              fontSize: "0.7rem",
              fontWeight: 700,
              background: currentUser?.role === "admin" ? "#ede9fe" : currentUser?.role === "instructor" ? "#fef3c7" : "#e0f2fe",
              color: currentUser?.role === "admin" ? "#6d28d9" : currentUser?.role === "instructor" ? "#92400e" : "#0369a1",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}>
              {currentUser?.role || "student"}
            </span>
          </small>
          {(currentUser?.id || currentUser?._id) && (
            <small title={`Full ID: ${currentUser?.id || currentUser?._id}`} style={{ fontSize: "0.68rem", color: "#94a3b8", fontFamily: "monospace", letterSpacing: 0 }}>
              ID: …{(currentUser?.id || currentUser?._id)?.toString().slice(-8)}
            </small>
          )}
        </span>
      </div>

      <button className="db-logout-btn" onClick={handleLogout} type="button">
        <DashboardIcon name="logout" />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
