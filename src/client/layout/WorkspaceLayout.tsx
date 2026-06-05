import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import TicketSidebar from '../components/TicketSidebar'
import { useWorkspace } from '../context/WorkspaceContext'

function pageTitle(pathname: string): string {
    if (pathname.startsWith('/tickets/')) {
        return 'Ticket'
    }
    return 'Tickets'
}

export default function WorkspaceLayout() {
    const { error, setError } = useWorkspace()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const title = pageTitle(location.pathname)

    const closeSidebar = () => setSidebarOpen(false)

    const handleViewChange = (view: string) => {
        const params = new URLSearchParams(location.search)
        if (view === 'all') {
            params.delete('view')
        } else {
            params.set('view', view)
        }
        const search = params.toString()
        navigate({ pathname: '/', search: search ? `?${search}` : '' })
        closeSidebar()
    }

    const handleCreateClick = () => {
        navigate('/?create=1')
        closeSidebar()
    }

    const activeView = new URLSearchParams(location.search).get('view') || 'all'

    return (
        <div className="workspace-app">
            {sidebarOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    aria-label="Close menu"
                    onClick={closeSidebar}
                />
            )}

            <TicketSidebar
                activeView={activeView}
                onViewChange={handleViewChange}
                onCreateClick={handleCreateClick}
                open={sidebarOpen}
                onClose={closeSidebar}
            />

            <div className="workspace-main">
                <header className="workspace-topbar">
                    <button
                        type="button"
                        className="menu-btn"
                        aria-label="Open menu"
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰
                    </button>
                    <h1 className="topbar-title">{title}</h1>
                </header>

                {error && (
                    <div className="error-message">
                        {error}
                        <button type="button" onClick={() => setError(null)}>
                            Dismiss
                        </button>
                    </div>
                )}

                <main className="workspace-content">
                    <Outlet context={{ closeSidebar }} />
                </main>
            </div>
        </div>
    )
}
