import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { TicketService } from './services/TicketService'
import { CommentService } from './services/CommentService'
import { AttachmentService } from './services/AttachmentService'
import { getSysId } from './utils/snValue'
import { mergeTicketUpdate, replaceTicketInList } from './utils/ticketPatch'
import TicketSidebar from './components/TicketSidebar'
import TicketList from './components/TicketList'
import TicketDetail from './components/TicketDetail'
import TicketForm from './components/TicketForm'
import './app.css'

const TICKET_TABLE = 'x_2058901_fresher_ticket'

export default function App() {
    const [tickets, setTickets] = useState([])
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [comments, setComments] = useState([])
    const [attachments, setAttachments] = useState([])
    const [activeView, setActiveView] = useState('all')
    const [tagFilter, setTagFilter] = useState('')
    const [debouncedTagFilter, setDebouncedTagFilter] = useState('')
    const [listLoading, setListLoading] = useState(true)
    const [listRefreshing, setListRefreshing] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState(null)
    const hasLoadedList = useRef(false)

    const ticketService = useMemo(() => new TicketService(), [])
    const commentService = useMemo(() => new CommentService(), [])
    const attachmentService = useMemo(() => new AttachmentService(), [])

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedTagFilter(tagFilter), 300)
        return () => window.clearTimeout(timer)
    }, [tagFilter])

    const applyTicketUpdate = useCallback((sysId, data, serverTicket = null) => {
        const merge = (ticket) => (serverTicket ? serverTicket : mergeTicketUpdate(ticket, data))

        setTickets((prev) =>
            replaceTicketInList(
                prev,
                sysId,
                merge(prev.find((ticket) => getSysId(ticket) === sysId) || { sys_id: sysId })
            )
        )
        setSelectedTicket((prev) => {
            if (!prev || getSysId(prev) !== sysId) return prev
            return merge(prev)
        })
    }, [])

    const refreshTickets = useCallback(async () => {
        const showFullLoading = !hasLoadedList.current
        try {
            if (showFullLoading) {
                setListLoading(true)
            } else {
                setListRefreshing(true)
            }
            setError(null)
            const filter = {
                ...(activeView === 'all' ? {} : { view: activeView }),
                ...(debouncedTagFilter.trim() ? { tag: debouncedTagFilter.trim() } : {}),
            }
            const data = await ticketService.list(filter)
            setTickets(data)
            hasLoadedList.current = true
        } catch (err) {
            setError('Failed to load tickets: ' + (err.message || 'Unknown error'))
        } finally {
            setListLoading(false)
            setListRefreshing(false)
        }
    }, [ticketService, activeView, debouncedTagFilter])

    const loadTicketDetail = useCallback(
        async (sysId, { showLoading = true } = {}) => {
            if (!sysId) return
            try {
                if (showLoading) setDetailLoading(true)
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
                if (showLoading) setDetailLoading(false)
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
    }

    const handleCreateClick = () => setShowForm(true)

    const handleFormClose = () => setShowForm(false)

    const handleFormSubmit = async (formData) => {
        try {
            const created = await ticketService.create(formData)
            setShowForm(false)
            if (created) {
                setTickets((prev) => [created, ...prev])
                await loadTicketDetail(getSysId(created))
            }
        } catch (err) {
            setError('Failed to create ticket: ' + (err.message || 'Unknown error'))
        }
    }

    const handleUpdate = async (sysId, data) => {
        applyTicketUpdate(sysId, data)
        try {
            const updated = await ticketService.update(sysId, data)
            applyTicketUpdate(sysId, data, updated)
        } catch (err) {
            setError('Failed to update ticket: ' + (err.message || 'Unknown error'))
            await refreshTickets()
            if (selectedTicket && getSysId(selectedTicket) === sysId) {
                await loadTicketDetail(sysId, { showLoading: false })
            }
        }
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
        setTickets((prev) => prev.filter((item) => getSysId(item) !== sysId))
    }

    return (
        <div className="workspace-app">
            <TicketSidebar
                activeView={activeView}
                onViewChange={handleViewChange}
                onCreateClick={handleCreateClick}
            />

            <div className="workspace-main">
                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={() => setError(null)}>Dismiss</button>
                    </div>
                )}

                <div className="workspace-panels">
                    <TicketList
                        tickets={tickets}
                        selectedId={selectedTicket ? getSysId(selectedTicket) : null}
                        onSelect={handleSelectTicket}
                        loading={listLoading}
                        refreshing={listRefreshing}
                        tagFilter={tagFilter}
                        onTagFilterChange={setTagFilter}
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
        </div>
    )
}
