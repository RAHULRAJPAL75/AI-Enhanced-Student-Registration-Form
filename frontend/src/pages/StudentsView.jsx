import React, { useEffect, useRef, useState } from "react";
import { DashboardIcon } from "../components/DashboardCommon";
import { formatStudentDate, getInitials, getStudentId } from "../utils/dashboardUtils";

export function StudentsView({
  filteredStudents,
  studentCount,
  studentsLoading,
  studentSearch,
  setStudentSearch,
  exportStudents,
  isAdminUser,
  openCreateStudent,
  openEditStudent,
  openViewProfile,
  openDeleteConfirm,
  studentDeletingId,
}) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const closeExportMenu = (event) => {
      if (!exportMenuRef.current?.contains(event.target)) setIsExportMenuOpen(false);
    };

    document.addEventListener("mousedown", closeExportMenu);
    return () => document.removeEventListener("mousedown", closeExportMenu);
  }, []);

  const handleExport = (format) => {
    exportStudents(format);
    setIsExportMenuOpen(false);
  };

  return (
    <section className="db-table-section" id="students">
      <div className="db-table-header">
        <div>
          <span className="db-panel-kicker">Records</span>
          <h3>Student Records</h3>
          <p className="db-table-sub">Live records from <code>student_db.students</code> collection</p>
        </div>
        <span className="db-table-badge">
          {filteredStudents.length} shown / {studentCount} registered
        </span>
      </div>

      <div className="db-record-toolbar">
        <label className="db-search-field" aria-label="Search student records">
          <DashboardIcon name="search" />
          <input
            onChange={(event) => setStudentSearch(event.target.value)}
            placeholder="Search by name, email, or date"
            type="search"
            value={studentSearch}
          />
        </label>

        <div className="db-toolbar-actions">
          <div className="db-export-menu" ref={exportMenuRef}>
            <button
              aria-expanded={isExportMenuOpen}
              aria-haspopup="menu"
              className="db-secondary-action"
              disabled={filteredStudents.length === 0}
              onClick={() => setIsExportMenuOpen((isOpen) => !isOpen)}
              type="button"
            >
              <DashboardIcon name="download" />
              Export
              <span className="db-export-chevron" aria-hidden="true">▾</span>
            </button>
            {isExportMenuOpen && (
              <div className="db-export-dropdown" role="menu">
                <button onClick={() => handleExport("csv")} role="menuitem" type="button">
                  <strong>CSV</strong>
                  <span>Comma-separated values</span>
                </button>
                <button onClick={() => handleExport("excel")} role="menuitem" type="button">
                  <strong>Microsoft Excel</strong>
                  <span>Editable .xlsx workbook</span>
                </button>
                <button onClick={() => handleExport("pdf")} role="menuitem" type="button">
                  <strong>PDF</strong>
                  <span>Printable records report</span>
                </button>
              </div>
            )}
          </div>
          {isAdminUser && (
            <button className="db-add-student-btn" onClick={openCreateStudent} type="button">
              <DashboardIcon name="plus" />
              Add Student
            </button>
          )}
        </div>
      </div>

      {studentsLoading ? (
        <div className="db-empty">
          <DashboardIcon name="refresh" />
          <p>Loading student records...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="db-empty">
          <DashboardIcon name="search" />
          <p>{studentCount === 0 ? "No student records yet." : "No records match your search."}</p>
        </div>
      ) : (
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Email</th>
                <th>MongoDB ID</th>
                <th>Role</th>
                <th>Registered On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st, i) => (
                <tr key={getStudentId(st)}>
                  <td className="db-td-num">{i + 1}</td>
                  <td>
                    <div className="db-student-cell">
                      <div className="db-student-avatar">{getInitials(st.name)}</div>
                      <span className="db-student-name">{st.name}</span>
                    </div>
                  </td>
                  <td className="db-td-email">{st.email}</td>
                  <td className="db-td-id" title={getStudentId(st)}>
                    <code style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#475569", fontFamily: "monospace", letterSpacing: "0" }}>
                      {getStudentId(st)?.slice(-8) || "—"}
                    </code>
                  </td>
                  <td>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: st.role === "admin" ? "#ede9fe" : st.role === "instructor" ? "#fef3c7" : "#e0f2fe",
                      color: st.role === "admin" ? "#6d28d9" : st.role === "instructor" ? "#92400e" : "#0369a1",
                    }}>
                      {st.role || "student"}
                    </span>
                  </td>
                  <td className="db-td-date">{formatStudentDate(st.createdAt, "short")}</td>
                  <td><span className="db-status-pill">Active</span></td>
                  <td>
                    {isAdminUser ? (
                      <div className="db-row-actions">
                        <button
                          aria-label={`View ${st.name} profile`}
                          className="db-action-btn db-action-view"
                          onClick={() => openViewProfile(st)}
                          title="View profile"
                          type="button"
                        >
                          <DashboardIcon name="eye" />
                        </button>
                        <button
                          aria-label={`Edit ${st.name}`}
                          className="db-action-btn db-action-edit"
                          onClick={() => openEditStudent(st)}
                          title="Edit"
                          type="button"
                        >
                          <DashboardIcon name="edit" />
                        </button>
                        <button
                          aria-label={`Delete ${st.name}`}
                          className="db-action-btn db-action-delete"
                          disabled={studentDeletingId === getStudentId(st)}
                          onClick={() => openDeleteConfirm(st)}
                          title="Delete"
                          type="button"
                        >
                          <DashboardIcon name="trash" />
                        </button>
                      </div>
                    ) : (
                      <span className="db-status-pill">Read only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default StudentsView;
