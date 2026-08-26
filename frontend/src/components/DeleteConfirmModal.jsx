export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  student,
  loading 
}) {
  if (!isOpen || !student) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div className="delete-modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-modal-container">
        {/* Danger Icon */}
        <div className="delete-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        {/* Title */}
        <h2 className="delete-modal-title">Delete Student Record?</h2>
        
        {/* Description */}
        <p className="delete-modal-description">
          You are about to permanently delete the following student from the system:
        </p>

        {/* Student Info Card */}
        <div className="delete-modal-student-card">
          <div className="delete-student-avatar">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="delete-student-info">
            <p className="delete-student-name">{student.name}</p>
            <p className="delete-student-email">{student.email}</p>
            {student.createdAt && (
              <p className="delete-student-date">
                Joined: {new Date(student.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </p>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="delete-modal-warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>This action cannot be undone. All student data will be permanently removed.</span>
        </div>

        {/* Actions */}
        <div className="delete-modal-actions">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-delete"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Deleting...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Yes, Delete Student
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
