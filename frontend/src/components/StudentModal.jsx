import { useState, useEffect } from "react";

export default function StudentModal({ 
  isOpen, 
  onClose, 
  student, 
  onSave,
  mode = "create" // "create" or "edit"
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Only used when creating a new student account
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && student && mode === "edit") {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        password: "",
      });
      setError("");
    } else if (isOpen && mode === "create") {
      setFormData({
        name: "",
        email: "",
        password: "",
      });
      setError("");
    }
  }, [isOpen, student, mode, student?._id, student?.id]); // Added IDs to force refresh

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password.trim();

    // Validation
    if (!cleanName) {
      setError("Full name is required");
      return;
    }
    if (!cleanEmail) {
      setError("Email address is required");
      return;
    }
    if (mode === "create" && !cleanPassword) {
      setError("Password is required for new students");
      return;
    }
    if (mode === "create" && cleanPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = { name: cleanName, email: cleanEmail };
      if (mode === "create" && cleanPassword) {
        payload.password = cleanPassword;
      }
      await onSave(payload);
      // onSave will handle toast and close
    } catch (err) {
      setError(err.message || "Failed to save student");
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="student-modal-overlay" onClick={handleOverlayClick}>
      <div className="student-modal-container">
        {/* Header */}
        <div className="student-modal-header">
          <div className="student-modal-title-wrap">
            <div className="student-modal-icon">
              {mode === "create" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              )}
            </div>
            <div>
              <h2 className="student-modal-title">
                {mode === "create" ? "Add New Student" : "Edit Student Record"}
              </h2>
              <p className="student-modal-subtitle">
                {mode === "create" 
                  ? "Create a new student account in the system"
                  : `Updating record for ${student?.name || "student"}`
                }
              </p>
            </div>
          </div>
          <button
            className="student-modal-close"
            onClick={onClose}
            disabled={loading}
            title="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Student Preview (Edit Mode) */}
        {mode === "edit" && student && (
          <div className="student-modal-preview">
            <div className="student-preview-avatar">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="student-preview-info">
              <p className="student-preview-name">{student.name}</p>
              <p className="student-preview-id">ID: {student._id || student.id}</p>
            </div>
            <span className="student-preview-badge">✓ Active</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="student-modal-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form className="student-modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="student-name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="student-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Enter student's full name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="student-email" className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="student-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="student@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {mode === "create" && (
            <div className="form-group">
              <label htmlFor="student-password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <input
                id="student-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="student-modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>
                  {mode === "create" ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" y1="8" x2="19" y2="14"/>
                        <line x1="22" y1="11" x2="16" y2="11"/>
                      </svg>
                      Create Student
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Save Changes
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
