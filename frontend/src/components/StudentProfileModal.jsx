import { useEffect } from "react";
import { formatStudentDate, getInitials, getProfileImageUrl, getStudentId } from "../utils/dashboardUtils";

const getItemLabel = (item) => item?.label || item?.name || item?.title || item;

export default function StudentProfileModal({ student, onClose }) {
  useEffect(() => {
    if (!student) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [student, onClose]);

  if (!student) return null;

  const imageSrc = getProfileImageUrl(student.profileImage);
  const role = student.role || "student";
  const listSections = [
    ["Skills", student.skills],
    ["Tools", student.tools],
    ["Projects", student.projects],
    ["Certifications", student.certs],
  ].filter(([, items]) => Array.isArray(items) && items.length > 0);

  return (
    <div className="student-profile-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className="student-profile-modal" role="dialog" aria-modal="true" aria-labelledby="student-profile-title">
        <button className="student-profile-close" onClick={onClose} aria-label="Close profile" type="button">&times;</button>
        <div className="student-profile-identity">
          <div className="student-profile-avatar">
            {imageSrc ? <img src={imageSrc} alt={`${student.name} profile`} /> : getInitials(student.name)}
          </div>
          <div>
            <p className="student-profile-kicker">Student profile</p>
            <h2 id="student-profile-title">{student.name}</h2>
            <p className="student-profile-email">{student.email}</p>
            <span className={`student-profile-role student-profile-role-${role}`}>{role}</span>
          </div>
        </div>

        <div className="student-profile-meta">
          <div><span>Registered</span><strong>{formatStudentDate(student.createdAt, "short")}</strong></div>
          <div><span>MongoDB ID</span><strong>{getStudentId(student)?.slice(-8) || "—"}</strong></div>
          <div><span>Status</span><strong className="student-profile-active">Active</strong></div>
        </div>

        <div className="student-profile-body">
          <h3>About</h3>
          <p>{student.bio || "No profile bio has been added yet."}</p>
          {listSections.map(([title, items]) => (
            <div className="student-profile-section" key={title}>
              <h3>{title}</h3>
              <div className="student-profile-tags">
                {items.map((item, index) => <span key={`${title}-${index}`}>{getItemLabel(item)}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
