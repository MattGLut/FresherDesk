import React from 'react'
import './TicketSidebar.css'

const VIEWS = [
    { id: 'all', label: 'All Tickets' },
    { id: 'open', label: 'Open' },
    { id: 'pending', label: 'Pending' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'unassigned', label: 'Unassigned' },
]

export default function TicketSidebar({ activeView, onViewChange, onCreateClick, open = false, onClose }) {
    return (
        <aside className={`ticket-sidebar${open ? ' is-open' : ''}`}>
            <div className="sidebar-brand">
                <h1>FresherDesk</h1>
                <p className="sidebar-subtitle">Agent Workspace</p>
            </div>

            <button type="button" className="sidebar-create-btn" onClick={onCreateClick}>
                + New Ticket
            </button>

            <nav className="sidebar-nav">
                <p className="nav-section-label">Views</p>
                <ul>
                    {VIEWS.map((view) => (
                        <li key={view.id}>
                            <button
                                type="button"
                                className={`nav-item ${activeView === view.id ? 'active' : ''}`}
                                onClick={() => onViewChange(view.id)}
                            >
                                {view.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <button type="button" className="sidebar-close-btn" onClick={onClose}>
                Close menu
            </button>
        </aside>
    )
}
