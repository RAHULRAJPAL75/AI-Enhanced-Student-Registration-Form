import { useEffect } from "react";

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="logout-modal-overlay" onClick={handleOverlayClick}>
      <section className="logout-modal-container" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
        <div className="logout-modal-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <p className="logout-modal-eyebrow">End session</p>
        <h2 id="logout-modal-title" className="logout-modal-title">Ready to leave?</h2>
        <p className="logout-modal-description">Your workspace is saved. You can sign back in whenever you are ready.</p>
        <div className="logout-modal-actions">
          <button className="logout-modal-cancel" onClick={onClose} type="button">Stay signed in</button>
          <button className="logout-modal-confirm" onClick={onConfirm} type="button">Yes, log out</button>
        </div>
      </section>
    </div>
  );
}
