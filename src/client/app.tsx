import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { WorkspaceProvider } from './context/WorkspaceContext'
import WorkspaceLayout from './layout/WorkspaceLayout'
import TicketIndexPage from './pages/TicketIndexPage'
import TicketShowPage from './pages/TicketShowPage'
import './app.css'

export default function App() {
    return (
        <WorkspaceProvider>
            <Routes>
                <Route element={<WorkspaceLayout />}>
                    <Route index element={<TicketIndexPage />} />
                    <Route path="tickets/:sysId" element={<TicketShowPage />} />
                </Route>
            </Routes>
        </WorkspaceProvider>
    )
}
