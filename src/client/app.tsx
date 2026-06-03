import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { TicketService } from './services/TicketService'
import { CommentService } from './services/CommentService'
import { AttachmentService } from './services/AttachmentService'
import { getSysId } from './utils/snValue'
import TicketSidebar from './components/TicketSidebar'
import TicketList from './components/TicketList'
import TicketDetail from './components/TicketDetail'
import TicketForm from './components/TicketForm'
import DarkModeToggle from './components/DarkModeToggle'
import './app.tailwind.css'

const TICKET_TABLE = 'x_2058901_fresher_ticket'

export default function App() {
    const [tickets, setTickets] = useState([])
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [comments, setComments] = useState([])
    const [attachments, setAttachments] = useState([])
    const [activeView, setActiveView] = useState('all')
    const [listLoading, setListLoading] = useState(true)
    const [detailLoading, setDetailLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState(null)

    const ticketService = useMemo(() => new TicketService(), [])
    const commentService = useMemo(() => new CommentService(), [])
    const attachmentService = useMemo(() => new AttachmentService(), [])

    const refreshTickets = useCallback(async () => {
        try {
            setListLoading(true)
            setError(null)
            const filter = activeView === 'all' ? {} : { view: activeView }
            const data = await ticketService.list(filter)
            setTickets(data)
        } catch (err) {
            setError('Failed to load tickets: ' + (err.message || 'Unknown error'))
        } finally {
            setListLoading(false)
        }
    }, [ticketService, activeView])

    const loadTicketDetail = useCallback(
        async (sysId) => {
            if (!sysId) return
            try {
                setDetailLoading(true)
                const [ticketData, commentData, attachmentData] = await Promise.all([
                    ticketService.get(sysId),
                    commentService.listForTicket(sysId),
                    attachmentService.list(TICKET_TABLE, sysId),
                ])
                setSelectedTicket(ticketData)
                setComments(commentData)
                setAttachments(attachmentData)
            } catch (err) {
                setError('Failed to load ticket: ' + (err.message || 'Unknown error'))
            } finally {
                setDetailLoading(false)
            }
        },
        [ticketService, commentService, attachmentService]
    )

    useEffect(() => {
        void refreshTickets()
    }, [refreshTickets])

    const handleSelectTicket = (ticket) => {
        const sysId = getSysId(ticket)
        void loadTicketDetail(sysId)
    }

    const handleViewChange = (view) => {
        setActiveView(view)
        setSelectedTicket(null)
        setComments([])
        setAttachments([])
    }

    const handleCreateClick = () => setShowForm(true)

    const handleFormClose = () => setShowForm(false)

    const handleFormSubmit = async (formData) => {
        try {
            setListLoading(true)
            await ticketService.create(formData)
            setShowForm(false)
            await refreshTickets()
        } catch (err) {
            setError('Failed to create ticket: ' + (err.message || 'Unknown error'))
        } finally {
            setListLoading(false)
        }
    }

    const handleUpdate = async (sysId, data) => {
        await ticketService.update(sysId, data)
        await refreshTickets()
    }

    const handleReply = async (sysId, body, commentType) => {
        await commentService.create(sysId, body, commentType)
    }

    const handleUpload = async (sysId, file) => {
        await attachmentService.upload(TICKET_TABLE, sysId, file)
    }

    const handleDelete = async (ticket) => {
        const number = typeof ticket.number === 'object' ? ticket.number.display_value : ticket.number
        if (!confirm(`Delete ticket ${number}?`)) return

        const sysId = getSysId(ticket)
        await ticketService.delete(sysId)
        setSelectedTicket(null)
        setComments([])
        setAttachments([])
        await refreshTickets()
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-rh-black">
            <TicketSidebar
                activeView={activeView}
                onViewChange={handleViewChange}
                onCreateClick={handleCreateClick}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                {error && (
                    <div className="flex items-center justify-between border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                        {error}
                        <button
                            type="button"
                            onClick={() => setError(null)}
                            className="cursor-pointer font-semibold underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                <div className="flex flex-1 overflow-hidden">
                    <TicketList
                        tickets={tickets}
                        selectedId={selectedTicket ? getSysId(selectedTicket) : null}
                        onSelect={handleSelectTicket}
                        loading={listLoading}
                    />
                    <TicketDetail
                        ticket={selectedTicket}
                        comments={comments}
                        attachments={attachments}
                        loading={detailLoading}
                        onUpdate={handleUpdate}
                        onReply={handleReply}
                        onUpload={handleUpload}
                        onRefresh={loadTicketDetail}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            {showForm && <TicketForm onSubmit={handleFormSubmit} onCancel={handleFormClose} />}

            <DarkModeToggle />
        </div>
    )
}
