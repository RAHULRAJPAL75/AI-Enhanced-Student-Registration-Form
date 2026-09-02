import React, { useEffect, useRef, useState } from "react";
import { DashboardIcon } from "./DashboardCommon";
import { getInitials, getProfileImageUrl } from "../utils/dashboardUtils";

export function DashboardTopbar({
  viewMeta,
  fetchStudents,
  exportStudents,
  studentsListLength,
  setActiveView,
  displayName,
  profileImage,
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

  const profileImageSrc = getProfileImageUrl(profileImage);

  return (
    <header className="db-topbar">
      <div className="db-topbar-title">
        <span className="db-page-kicker">{viewMeta.eyebrow}</span>
        <h1>{viewMeta.title}</h1>
        <p>{viewMeta.text}</p>
      </div>

      <div className="db-topbar-actions">
        <button className="db-icon-btn" onClick={fetchStudents} title="Refresh data" type="button">
          <DashboardIcon name="refresh" />
        </button>
        <div className="db-export-menu" ref={exportMenuRef}>
          <button
            aria-expanded={isExportMenuOpen}
            aria-haspopup="menu"
            className="db-secondary-action"
            disabled={studentsListLength === 0}
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
        <button
          className="db-avatar db-avatar-btn"
          title="Go to Profile"
          onClick={() => setActiveView("profile")}
          type="button"
        >
          {profileImageSrc ? (
            <img
              src={profileImageSrc}
              alt={`${displayName} profile`}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            getInitials(displayName)
          )}
        </button>
      </div>
    </header>
  );
}

export default DashboardTopbar;
