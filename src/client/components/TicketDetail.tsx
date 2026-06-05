import React, { useState, useEffect } from 'react'
import { getDisplayValue, getValue, getSysId, getRequesterDisplay } from '../utils/snValue'
import { parseTags, serializeTags } from '../utils/ticketTags'
import { AgentService } from '../services/AgentService'
import { UserService } from '../services/UserService'
import ConversationPanel from './ConversationPanel'
import ChildTicketsPanel from './ChildTicketsPanel'
import './TicketDetail.css'

export default function TicketDetail({
    ticket,
    comments,
    attachments,
    loading,
    onUpdate,
    onReply,
    onUpload,
    onDownloadAttachment,
    onRefresh,
    onDelete,
    onNavigateTicket,
    onCreateChild,
    childrenRefreshKey = 0,
}) {
    const [replyBody, setReplyBody] = useState('')
    const [replyType, setReplyType] = useState('public_reply')
    const [submitting, setSubmitting] = useState(false)
    const [agents, setAgents] = useState([])
    const [localState, setLocalState] = useState({ state: '1', priority: '3', assigned_to: '' })
    const [localTags, setLocalTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const agentService = new AgentService()
        agentService
            .list()
            .then(setAgents)
            .catch(() => setAgents([]))
    }, [])

    useEffect(() => {
        const userService = new UserService()
        userService
            .isAdmin()
            .then(setIsAdmin)
            .catch(() => setIsAdmin(false))
    }, [])

    useEffect(() => {
        if (ticket) {
            setLocalState({
                state: getValue(ticket.state) || '1',
                priority: getValue(ticket.priority) || '3',
                assigned_to: getValue(ticket.assigned_to) || '',
            })
            setLocalTags(parseTags(ticket.tags))
            setNewTag('')
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

    const handleTagsUpdate = async (nextTags: string[]) => {
        setLocalTags(nextTags)
        await onUpdate(sysId, { tags: serializeTags(nextTags) })
    }

    const handleAddTag = async (e) => {
        e.preventDefault()
        const trimmed = newTag.trim()
        if (!trimmed || localTags.includes(trimmed)) {
            setNewTag('')
            return
        }
        await handleTagsUpdate([...localTags, trimmed])
        setNewTag('')
    }

    const handleRemoveTag = async (tag: string) => {
        await handleTagsUpdate(localTags.filter((t) => t !== tag))
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
        e.target.value = ''
        await onRefresh(sysId, { showLoading: false })
    }

    const handleAttachmentClick = async (event, attachment) => {
        event.preventDefault()
        if (!onDownloadAttachment) return
        try {
            const url = await onDownloadAttachment(sysId, getSysId(attachment))
            window.open(url, '_blank', 'noopener,noreferrer')
        } catch (err) {
            window.alert(`Failed to download attachment: ${err.message || 'Unknown error'}`)
        }
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
                    <label>Assignee</label>
                    <select
                        value={localState.assigned_to}
                        onChange={(e) => handleFieldUpdate('assigned_to', e.target.value)}
                    >
                        <option value="">Unassigned</option>
                        {agents.map((agent) => (
                            <option key={getSysId(agent)} value={getValue(agent.sys_id)}>
                                {getDisplayValue(agent.name)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="field-group">
                    <label>Requester</label>
                    <span className="field-readonly">{getRequesterDisplay(ticket)}</span>
                </div>
                <div className="field-group">
                    <label>Category</label>
                    <span className="field-readonly">{getDisplayValue(ticket.category)}</span>
                </div>
                <div className="field-group field-group-full">
                    <label>Tags</label>
                    <div className="tag-editor">
                        <div className="tag-list">
                            {localTags.length === 0 ? (
                                <span className="tag-empty">No tags</span>
                            ) : (
                                localTags.map((tag) => (
                                    <span key={tag} className="tag-chip">
                                        {tag}
                                        <button type="button" className="tag-remove" onClick={() => handleRemoveTag(tag)} aria-label={`Remove ${tag}`}>
                                            ×
                                        </button>
                                    </span>
                                ))
                            )}
                        </div>
                        <form className="tag-add-form" onSubmit={handleAddTag}>
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add tag..."
                            />
                            <button type="submit" disabled={!newTag.trim()}>
                                Add
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <ChildTicketsPanel
                key={childrenRefreshKey}
                parentTicket={ticket}
                onNavigateTicket={onNavigateTicket}
                onCreateChild={onCreateChild}
            />

            {getDisplayValue(ticket.description) && (
                <div className="detail-description">
                    <h3>Description</h3>
                    <p>{getDisplayValue(ticket.description)}</p>
                </div>
            )}

            <div className="detail-section">
                <h3>Conversation</h3>
                <ConversationPanel
                    ticketSysId={sysId}
                    comments={comments}
                    detailLoading={loading}
                    isAdmin={isAdmin}
                    replyBody={replyBody}
                    replyType={replyType}
                    submitting={submitting}
                    onReplyBodyChange={setReplyBody}
                    onReplyTypeChange={setReplyType}
                    onReplySubmit={handleReplySubmit}
                />
            </div>

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
                                <a href="#" onClick={(event) => void handleAttachmentClick(event, att)}>
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
