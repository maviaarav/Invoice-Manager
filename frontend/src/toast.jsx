// Toast.jsx
import { useEffect, useState } from "react";
import "./toast.css";

const Toast = ({ toast, onClose, duration = 3500 }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!toast) return;
        const enter = requestAnimationFrame(() => setVisible(true));
        const hideTimer = setTimeout(() => setVisible(false), duration);
        const closeTimer = setTimeout(() => onClose?.(), duration + 300);
        return () => {
            cancelAnimationFrame(enter);
            clearTimeout(hideTimer);
            clearTimeout(closeTimer);
        };
    }, [toast, duration, onClose]);

    if (!toast) return null;

    const { type = "success", message } = toast;

    return (
        <div className={`toast-wrapper ${visible ? "toast-visible" : "toast-hidden"}`}>
            <div className={`toast toast-${type}`}>
                <span className="toast-icon">
                    {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
                </span>
                <span className="toast-message">{message}</span>
                <button className="toast-close" onClick={() => setVisible(false)} aria-label="Dismiss">×</button>
            </div>
        </div>
    );
};

export default Toast;