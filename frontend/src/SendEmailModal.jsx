// SendEmailModal.jsx
import { useState } from "react";
import "./sendEmailModal.css";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const SendEmailModal = ({ open, onClose, defaultEmails = [], documentLabel, isSending, onSend }) => {
    const [emails, setEmails] = useState(defaultEmails.filter(Boolean));
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    if (!open) return null;

    const addEmail = (raw) => {
        const value = raw.trim().replace(/,$/, "");
        if (!value) return;
        if (!isValidEmail(value)) {
            setError(`"${value}" is not a valid email address`);
            return;
        }
        if (emails.includes(value)) {
            setInputValue("");
            return;
        }
        setEmails((prev) => [...prev, value]);
        setInputValue("");
        setError("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
            e.preventDefault();
            addEmail(inputValue);
        } else if (e.key === "Backspace" && !inputValue && emails.length) {
            setEmails((prev) => prev.slice(0, -1));
        }
    };

    const removeEmail = (email) => setEmails((prev) => prev.filter((e) => e !== email));

    const handleSend = () => {
        let finalEmails = emails;
        const pending = inputValue.trim();
        if (pending) {
            if (!isValidEmail(pending)) {
                setError(`"${pending}" is not a valid email address`);
                return;
            }
            finalEmails = [...emails, pending];
        }
        if (finalEmails.length === 0) {
            setError("Add at least one recipient email");
            return;
        }
        onSend(finalEmails);
    };

    return (
        <div className="sem-overlay" onClick={onClose}>
            <div className="sem-modal" onClick={(e) => e.stopPropagation()}>
                <div className="sem-header">
                    <div>
                        <h3>Send Invoice</h3>
                        {documentLabel && <p className="sem-subtitle">{documentLabel}</p>}
                    </div>
                    <button className="sem-close" onClick={onClose} aria-label="Close">×</button>
                </div>

                <div className="sem-body">
                    <label className="sem-label">Recipients</label>
                    <div className="sem-chip-input" onClick={() => document.getElementById("sem-email-input")?.focus()}>
                        {emails.map((email) => (
                            <span className="sem-chip" key={email}>
                                {email}
                                <button type="button" className="sem-chip-remove" onClick={() => removeEmail(email)} aria-label={`Remove ${email}`}>×</button>
                            </span>
                        ))}
                        <input
                            id="sem-email-input"
                            type="text"
                            className="sem-input"
                            placeholder={emails.length ? "Add another email..." : "Enter recipient email..."}
                            value={inputValue}
                            onChange={(e) => { setInputValue(e.target.value); if (error) setError(""); }}
                            onKeyDown={handleKeyDown}
                            onBlur={() => inputValue.trim() && addEmail(inputValue)}
                        />
                    </div>
                    {error && <p className="sem-error">{error}</p>}
                    <p className="sem-hint">Press Enter or comma to add multiple recipients.</p>
                </div>

                <div className="sem-footer">
                    <button className="sem-btn sem-btn-secondary" onClick={onClose} disabled={isSending}>Cancel</button>
                    <button className="sem-btn sem-btn-primary" onClick={handleSend} disabled={isSending}>
                        {isSending ? (<><span className="sem-spinner" /> Sending...</>) : (<>📧 Send Invoice</>)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendEmailModal;