import React from 'react'
import { TICKET_SIDEBAR_VIEWS } from '../constants/ticketViews'
import './TicketSidebar.css'

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
                    {TICKET_SIDEBAR_VIEWS.map((view) => (
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
