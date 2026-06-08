import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TicketDetail from '../components/TicketDetail'
import TicketForm from '../components/TicketForm'
import { useWorkspace } from '../context/WorkspaceContext'
import { getSysId, getValue, getDisplayValue } from '../utils/snValue'
import { TICKET_TABLE } from '../constants/tables'
import { mergeTicketUpdate } from '../utils/ticketPatch'

export default function TicketShowPage() {
    const { sysId } = useParams()
    const navigate = useNavigate()
    const { ticketService, commentService, attachmentService, reportError, showToast } = useWorkspace()

    const [ticket, setTicket] = useState(null)
    const [comments, setComments] = useState([])
    const [attachments, setAttachments] = useState([])
    const [detailLoading, setDetailLoading] = useState(true)
    const [childParentTicket, setChildParentTicket] = useState(null)
    const [editingTicket, setEditingTicket] = useState(null)
    const [childrenRefreshKey, setChildrenRefreshKey] = useState(0)

    const loadTicketDetail = useCallback(
        async (ticketSysId: string, { showLoading = true } = {}) => {
            if (!ticketSysId) return
            try {
                if (showLoading) setDetailLoading(true)
                const [ticketData, commentData, attachmentData] = await Promise.all([
                    ticketService.get(ticketSysId),
                    commentService.listForTicket(ticketSysId),
                    attachmentService.list(TICKET_TABLE, ticketSysId),
                ])
                setTicket(ticketData)
                setComments(commentData)
                setAttachments(attachmentData)
            } catch (err) {
                reportError('Failed to load ticket', err)
            } finally {
                if (showLoading) setDetailLoading(false)
            }
        },
        [ticketService, commentService, attachmentService, reportError]
    )

    useEffect(() => {
        if (sysId) {
            void loadTicketDetail(sysId)
        }
    }, [sysId, loadTicketDetail])

    const handleNavigateTicket = (targetSysId: string) => {
        navigate(`/tickets/${targetSysId}`)
    }

    const handleBack = () => {
        navigate('/')
    }

    const handleUpdate = async (ticketSysId: string, data: Record<string, string>, successMessage?: string) => {
        setTicket((prev) => (prev ? mergeTicketUpdate(prev, data) : prev))
        try {
            await ticketService.update(ticketSysId, data)
            const updated = await ticketService.get(ticketSysId)
            setTicket(updated)
            if (successMessage) {
                showToast(successMessage)
            }
        } catch (err) {
            reportError('Failed to update ticket', err)
            if (sysId) {
                await loadTicketDetail(sysId, { showLoading: false })
            }
        }
    }

    const handleReply = async (ticketSysId: string, body: string, commentType: string) => {
        await commentService.create(ticketSysId, body, commentType)
        showToast(commentType === 'internal_note' ? 'Internal note added' : 'Reply sent')
    }

    const handleUpload = async (ticketSysId: string, file: File) => {
        await attachmentService.upload(TICKET_TABLE, ticketSysId, file)
        showToast('Attachment uploaded')
    }

    const handleDelete = async (ticketRecord: { number: unknown; sys_id: unknown }) => {
        const number = getDisplayValue(ticketRecord.number) || getValue(ticketRecord.number)
        if (!confirm(`Delete ticket ${number}?`)) return

        const ticketSysId = getSysId(ticketRecord)
        try {
            await ticketService.delete(ticketSysId)
            showToast(`Ticket ${number} deleted`)
            navigate('/')
        } catch (err) {
            reportError('Failed to delete ticket', err)
        }
    }

    const handleEditSubmit = async (formData: Record<string, string>) => {
        if (!editingTicket) return
        const ticketSysId = getSysId(editingTicket)
        try {
            await ticketService.update(ticketSysId, formData)
            setEditingTicket(null)
            showToast('Ticket updated')
            await loadTicketDetail(ticketSysId, { showLoading: false })
        } catch (err) {
            reportError('Failed to update ticket', err)
        }
    }

    const handleChildFormSubmit = async (formData: Record<string, string>) => {
        if (!childParentTicket) return
        const parentSysId = getSysId(childParentTicket)
        try {
            const created = await ticketService.create({
                ...formData,
                parent: parentSysId,
                requester_email: getValue(childParentTicket.requester_email) || formData.requester_email,
                opened_by: getValue(childParentTicket.opened_by),
            })
            setChildParentTicket(null)
            setChildrenRefreshKey((k) => k + 1)
            showToast('Child ticket created')
            if (created) {
                navigate(`/tickets/${getSysId(created)}`)
            }
        } catch (err) {
            reportError('Failed to create child ticket', err)
        }
    }

    if (!sysId) {
        return (
            <div className="ticket-detail-panel empty">
                <p>Invalid ticket link</p>
                <button type="button" className="back-btn" onClick={handleBack}>
                    Back to tickets
                </button>
            </div>
        )
    }

    return (
        <>
            <TicketDetail
                ticket={ticket}
                comments={comments}
                attachments={attachments}
                loading={detailLoading}
                onUpdate={handleUpdate}
                onReply={handleReply}
                onUpload={handleUpload}
                onRefresh={loadTicketDetail}
                onDelete={handleDelete}
                onNavigateTicket={handleNavigateTicket}
                onCreateChild={() => ticket && setChildParentTicket(ticket)}
                onEdit={(ticketRecord) => setEditingTicket(ticketRecord)}
                onBack={handleBack}
                childrenRefreshKey={childrenRefreshKey}
            />
            {editingTicket && (
                <TicketForm
                    ticket={editingTicket}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setEditingTicket(null)}
                />
            )}
            {childParentTicket && (
                <TicketForm
                    parentTicket={childParentTicket}
                    onSubmit={handleChildFormSubmit}
                    onCancel={() => setChildParentTicket(null)}
                />
            )}
        </>
    )
}
