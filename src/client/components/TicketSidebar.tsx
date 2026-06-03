import React from 'react'

const VIEWS = [
    { id: 'all', label: 'All Tickets' },
    { id: 'open', label: 'Open' },
    { id: 'pending', label: 'Pending' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'unassigned', label: 'Unassigned' },
]

export default function TicketSidebar({ activeView, onViewChange, onCreateClick }) {
    return (
        <aside className="flex h-full w-56 min-w-56 flex-col border-r border-gray-200 bg-white dark:border-rh-border dark:bg-rh-surface">
            <div className="border-b border-gray-200 px-4 py-5 dark:border-rh-border">
                <h1 className="m-0 text-xl font-bold text-rh-green">FresherDesk</h1>
                <p className="mt-1 text-xs text-gray-500 dark:text-rh-muted">Agent Workspace</p>
            </div>

            <button
                type="button"
                className="mx-4 mt-4 cursor-pointer rounded-lg bg-rh-green px-3.5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-rh-green-dim"
                onClick={onCreateClick}
            >
                + New Ticket
            </button>

            <nav className="flex-1 px-2 pt-2">
                <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-rh-muted">
                    Views
                </p>
                <ul className="m-0 list-none p-0">
                    {VIEWS.map((view) => {
                        const isActive = activeView === view.id
                        return (
                            <li key={view.id}>
                                <button
                                    type="button"
                                    className={`mb-0.5 block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                        isActive
                                            ? 'bg-rh-green/10 font-semibold text-rh-green'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-rh-surface-2'
                                    }`}
                                    onClick={() => onViewChange(view.id)}
                                >
                                    {view.label}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </aside>
    )
}
