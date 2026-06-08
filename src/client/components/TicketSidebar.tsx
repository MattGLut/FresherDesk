import React from 'react'
import { TICKET_SIDEBAR_VIEWS } from '../constants/ticketViews'
import './TicketSidebar.css'

export default function TicketSidebar({
    activeView,
    onViewChange,
    onCreateClick,
    open = false,
    onClose,
    collapsed = false,
    onToggleCollapse,
}) {
    return (
        <aside className={`ticket-sidebar${open ? ' is-open' : ''}${collapsed ? ' is-collapsed' : ''}`}>
            <div className="sidebar-brand">
                {collapsed ? (
                    <span className="sidebar-logo-mark" title="FresherDesk">
                        F
                    </span>
                ) : (
                    <>
                        <h1>FresherDesk</h1>
                        <p className="sidebar-subtitle">Agent Workspace</p>
                    </>
                )}
                {onToggleCollapse && (
                    <button
                        type="button"
                        className="sidebar-collapse-btn"
                        onClick={onToggleCollapse}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? '»' : '«'}
                    </button>
                )}
            </div>

            <button
                type="button"
                className="sidebar-create-btn"
                onClick={onCreateClick}
                title="New Ticket"
            >
                <span className="sidebar-create-icon" aria-hidden="true">
                    +
                </span>
                <span className="sidebar-create-label">New Ticket</span>
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
                                title={view.label}
                            >
                                <span className="nav-item-collapsed" aria-hidden="true">
                                    {view.collapsedLabel}
                                </span>
                                <span className="nav-item-label">{view.label}</span>
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
