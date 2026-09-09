import { AlertTriangle, X } from "lucide-react";

function ConfirmDialog({
  title,
  message,
  busy,
  confirmLabel = "Delete workout",
  busyLabel = "Deleting",
  onCancel,
  onConfirm
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <header className="modal-header">
          <span className="warning-mark"><AlertTriangle size={21} /></span>
          <button className="icon-button" type="button" onClick={onCancel} title="Close" aria-label="Close confirmation">
            <X size={20} />
          </button>
        </header>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <footer className="modal-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>
          <button className="danger-button" type="button" onClick={onConfirm} disabled={busy}>{busy ? busyLabel : confirmLabel}</button>
        </footer>
      </section>
    </div>
  );
}

export default ConfirmDialog;
