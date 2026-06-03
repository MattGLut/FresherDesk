import React, { useState, useEffect } from 'react'
import { getDisplayValue, getValue, getSysId } from '../utils/snValue'
import ConversationThread from './ConversationThread'
import './TicketDetail.css'

export default function TicketDetail({
    ticket,
    comments,
    attachments,
    loading,
    onUpdate,
    onReply,
    onUpload,
    onRefresh,
    onDelete,
}) {
    const [replyBody, setReplyBody] = useState('')
    const [replyType, setReplyType] = useState('public_reply')
    const [submitting, setSubmitting] = useState(false)
    const [localState, setLocalState] = useState({ state: '1', priority: '3', assigned_to: '' })

    useEffect(() => {
        if (ticket) {
            setLocalState({
                state: getValue(ticket.state) || '1',
                priority: getValue(ticket.priority) || '3',
                assigned_to: getValue(ticket.assigned_to) || '',
            })
        }
    }, [ticket])

    if (!ticket) {
        return (
            <div className="ticket-detail-panel empty">
                <p>Select a ticket to view details</p>
            </div>
        )
    }

    const sysId = getSysId(ticket)

    const handleFieldUpdate = async (field, value) => {
        const updated = { ...localState, [field]: value }
        setLocalState(updated)
        await onUpdate(sysId, { [field]: value })
    }

    const handleReplySubmit = async (e) => {
        e.preventDefault()
        if (!replyBody.trim()) return

        setSubmitting(true)
        try {
            await onReply(sysId, replyBody, replyType)
            setReplyBody('')
            await onRefresh(sysId)
        } finally {
            setSubmitting(false)
        }
    }

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        await onUpload(sysId, file)
        await onRefresh(sysId)
        e.target.value = ''
    }

    return (
        <div className="ticket-detail-panel">
            <div className="detail-header">
                <div>
                    <span className="detail-number">{getDisplayValue(ticket.number)}</span>
                    <h2>{getDisplayValue(ticket.short_description)}</h2>
                </div>
                <button className="delete-btn" onClick={() => onDelete(ticket)}>
                    Delete
                </button>
            </div>

            <div className="detail-fields">
                <div className="field-group">
                    <label>Status</label>
                    <select value={localState.state} onChange={(e) => handleFieldUpdate('state', e.target.value)}>
                        <option value="1">Open</option>
                        <option value="2">Pending</option>
                        <option value="6">Resolved</option>
                        <option value="7">Closed</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>Priority</label>
                    <select value={localState.priority} onChange={(e) => handleFieldUpdate('priority', e.target.value)}>
                        <option value="1">Critical</option>
                        <option value="2">High</option>
                        <option value="3">Medium</option>
                        <option value="4">Low</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>Requester</label>
                    <span className="field-readonly">
                        {getDisplayValue(ticket.requester_email) || getDisplayValue(ticket.opened_by)}
                    </span>
                </div>
                <div className="field-group">
                    <label>Category</label>
                    <span className="field-readonly">{getDisplayValue(ticket.category)}</span>
                </div>
            </div>

            {getDisplayValue(ticket.description) && (
                <div className="detail-description">
                    <h3>Description</h3>
                    <p>{getDisplayValue(ticket.description)}</p>
                </div>
            )}

            <div className="detail-section">
                <h3>Conversation</h3>
                <ConversationThread comments={comments} loading={loading} />
            </div>

            <form className="reply-composer" onSubmit={handleReplySubmit}>
                <div className="reply-type-toggle">
                    <button
                        type="button"
                        className={replyType === 'public_reply' ? 'active' : ''}
                        onClick={() => setReplyType('public_reply')}
                    >
                        Public Reply
                    </button>
                    <button
                        type="button"
                        className={replyType === 'internal_note' ? 'active' : ''}
                        onClick={() => setReplyType('internal_note')}
                    >
                        Internal Note
                    </button>
                </div>
                <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={replyType === 'internal_note' ? 'Add an internal note...' : 'Write a reply...'}
                    rows={4}
                />
                <div className="reply-actions">
                    <button type="submit" className="reply-submit" disabled={submitting || !replyBody.trim()}>
                        {submitting ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>

            <div className="detail-section attachments-section">
                <div className="attachments-header">
                    <h3>Attachments</h3>
                    <label className="upload-btn">
                        Upload
                        <input type="file" hidden onChange={handleFileChange} />
                    </label>
                </div>
                {attachments.length === 0 ? (
                    <p className="no-attachments">No attachments</p>
                ) : (
                    <ul className="attachment-list">
                        {attachments.map((att) => (
                            <li key={getSysId(att)}>
                                <a href={`/api/now/attachment/${getSysId(att)}/file`} target="_blank" rel="noreferrer">
                                    {getDisplayValue(att.file_name)}
                                </a>
                                <span className="att-size">{getDisplayValue(att.size_bytes)} bytes</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
