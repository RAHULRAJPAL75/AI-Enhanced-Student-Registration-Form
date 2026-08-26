import React from "react";
import { DashboardIcon, MetricCard, ProgressRow } from "../components/DashboardCommon";
import AIInsights from "../components/AIInsights";
import { formatStudentDate, getInitials, getStudentId } from "../utils/dashboardUtils";

export function DashboardView({
  currentUser,
  studentsList,
  filteredStudents,
  studentsLoading,
  recentStudentCount,
  newestStudent,
  joinedDate,
  registrationBars,
  sprintReadiness,
  workspaceHealth,
  visiblePercent,
  openCreateStudent,
  setActiveView,
  fetchStudents,
}) {
  const now = new Date();
  const isAdminUser = currentUser?.role === "admin";
  const displayName = currentUser?.name || "Student";
  const firstName = displayName.split(" ")[0] || "Student";
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const studentCount = studentsList.length;

  const sortedStudents = [...studentsList].sort((a, b) => {
    const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  const latestStudents = sortedStudents.slice(0, 4);

  return (
    <>
      <section className="db-hero-panel" aria-label="Dashboard summary">
        <div className="db-welcome-copy">
          <span className="db-status-chip">
            <span />
            {studentsLoading ? "Syncing records" : "Live database"}
          </span>
          <h2>{greeting}, {firstName}</h2>
          <p>
            Manage registrations, keep student data clean, and see the next useful action without digging through the table.
          </p>
          <div className="db-hero-actions">
            {isAdminUser && (
              <button className="db-primary-action" onClick={openCreateStudent} type="button">
                <DashboardIcon name="plus" />
                Add Student
              </button>
            )}
            <button className="db-secondary-action" onClick={() => setActiveView("students")} type="button">
              <DashboardIcon name="table" />
              Review Records
            </button>
            <button className="db-ghost-action" onClick={fetchStudents} type="button">
              <DashboardIcon name="refresh" />
              Refresh
            </button>
          </div>
        </div>

        <aside className="db-focus-card" aria-label="Today focus">
          <div className="db-focus-header">
            <span>Today Focus</span>
            <strong>{now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
          </div>
          <ul className="db-focus-list">
            <li>
              <DashboardIcon name="spark" />
              <span>
                <strong>Latest registration</strong>
                <small>{newestStudent ? `${newestStudent.name} joined ${formatStudentDate(newestStudent.createdAt, "short")}` : "No registrations yet"}</small>
              </span>
            </li>
            <li>
              <DashboardIcon name="filter" />
              <span>
                <strong>Directory visibility</strong>
                <small>{filteredStudents.length} of {studentCount} records visible</small>
              </span>
            </li>
            <li>
              <DashboardIcon name="target" />
              <span>
                <strong>Sprint readiness</strong>
                <small>{sprintReadiness}% cohort preparation score</small>
              </span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="db-kpi-row" aria-label="Key metrics">
        <MetricCard
          icon="users"
          label="Total Students"
          value={studentCount}
          helper={`${filteredStudents.length} visible records`}
          tone="blue"
        />
        <MetricCard
          icon="spark"
          label="New This Week"
          value={recentStudentCount}
          helper={newestStudent ? `Latest: ${newestStudent.name}` : "No new joins yet"}
          tone="green"
        />
        <MetricCard
          icon="database"
          label="MongoDB Status"
          value={studentsLoading ? "Syncing" : "Live"}
          helper="student_db.students"
          tone="amber"
        />
        <MetricCard
          icon="shield"
          label="Account Status"
          value="Active"
          helper={`Joined ${joinedDate}`}
          tone="rose"
        />
      </section>

      <section className="db-dashboard-grid">
        <article className="db-panel db-panel-large">
          <div className="db-panel-header">
            <div>
              <span className="db-panel-kicker">Analytics</span>
              <h3>Registration Trend</h3>
            </div>
            <span className="db-panel-badge">Last 7 days</span>
          </div>

          <div className="db-chart-bars" aria-label="Student registrations by day">
            {registrationBars.map((bar) => (
              <div className="db-chart-column" key={bar.key}>
                <div className="db-chart-track">
                  <span className="db-chart-bar" style={{ "--bar-height": bar.height }} />
                </div>
                <strong>{bar.count}</strong>
                <span>{bar.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="db-panel">
          <div className="db-panel-header">
            <div>
              <span className="db-panel-kicker">Quality</span>
              <h3>Cohort Health</h3>
            </div>
          </div>
          <div className="db-progress-stack">
            <ProgressRow label="Active records" value={studentCount ? 100 : 0} detail={`${studentCount} active students`} />
            <ProgressRow label="Directory coverage" value={visiblePercent} detail={`${filteredStudents.length} currently visible`} />
            <ProgressRow label="Sprint readiness" value={sprintReadiness} detail="Based on cohort size" />
            <ProgressRow label="Data sync" value={workspaceHealth} detail={studentsLoading ? "Refreshing records" : "Connected"} />
          </div>
        </article>
      </section>

      <section className="db-dashboard-grid db-dashboard-grid-secondary">
        <AIInsights currentUser={currentUser} />

        <article className="db-panel">
          <div className="db-panel-header">
            <div>
              <span className="db-panel-kicker">Directory</span>
              <h3>Latest Students</h3>
            </div>
            <button className="db-link-action" onClick={() => setActiveView("students")} type="button">
              View all
            </button>
          </div>

          {latestStudents.length > 0 ? (
            <div className="db-mini-student-list">
              {latestStudents.map((student) => (
                <div className="db-mini-student-card" key={getStudentId(student)}>
                  <span className="db-mini-avatar">{getInitials(student.name)}</span>
                  <span>
                    <strong>{student.name}</strong>
                    <small>{student.email}</small>
                  </span>
                  <em>{formatStudentDate(student.createdAt, "short")}</em>
                </div>
              ))}
            </div>
          ) : (
            <div className="db-empty db-empty-compact">
              <DashboardIcon name="users" />
              <p>No student records yet.</p>
            </div>
          )}
        </article>
      </section>
    </>
  );
}

export default DashboardView;
