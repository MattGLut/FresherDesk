import React from 'react'
import './ToastContainer.css'

export interface ToastItem {
    id: number
    message: string
    type: 'success' | 'error'
}

export default function ToastContainer({
    toasts,
    onDismiss,
}: {
    toasts: ToastItem[]
    onDismiss: (id: number) => void
}) {
    if (toasts.length === 0) {
        return null
    }

    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
                    <span className="toast-message">{toast.message}</span>
                    <button type="button" className="toast-dismiss" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
                        ×
                    </button>
                </div>
            ))}
        </div>
    )
}
