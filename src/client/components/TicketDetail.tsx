import React, { useState, useEffect } from 'react'
import {
    getDisplayValue,
    getValue,
    getSysId,
    getRequesterDisplay,
    PRIORITY_DISPLAY_LABELS,
    PRIORITY_VALUES,
    STATE_DISPLAY_LABELS,
} from '../utils/snValue'
import { getAllowedStatusOptions, normalizeTicketStateValue } from '../../shared/ticketStateTransitions'
import { parseTags, serializeTags } from '../utils/ticketTags'
import { formatFileSize } from '../utils/formatFileSize'
import { AgentService } from '../services/AgentService'
import { UserService } from '../services/UserService'
import ConversationPanel from './ConversationPanel'
import ChildTicketsPanel from './ChildTicketsPanel'
import './TicketDetail.css'

export default function TicketDetail({
    ticket,
    comments,
    commentPage,
    commentTotal,
    commentsLoading,
    onCommentPageChange,
    attachments,
    loading,
    onUpdate,
    onReply,
    onUpload,
    onRefresh,
    onDelete,
    onNavigateTicket,
    onCreateChild,
    onEdit,
    onCopyLink,
    onBack,
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
    const [currentUserSysId, setCurrentUserSysId] = useState<string | null>(null)

    useEffect(() => {
        const agentService = new AgentService()
        agentService
            .list()
            .then(setAgents)
            .catch(() => setAgents([]))
    }, [])

    useEffect(() => {
        const userService = new UserService()
        Promise.all([userService.isAdmin(), userService.getCurrentUserSysId()])
            .then(([admin, userSysId]) => {
                setIsAdmin(admin)
                setCurrentUserSysId(userSysId)
            })
            .catch(() => {
                setIsAdmin(false)
                setCurrentUserSysId(null)
            })
    }, [])

    useEffect(() => {
        if (ticket) {
            setLocalState({
                state: normalizeTicketStateValue(getValue(ticket.state)),
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
                {loading ? (
                    <>
                        <span className="empty-icon" aria-hidden="true">⏳</span>
                        <p className="empty-title">Loading ticket...</p>
                    </>
                ) : (
                    <>
                        <span className="empty-icon" aria-hidden="true">🔍</span>
                        <p className="empty-title">Ticket not found</p>
                        <p className="empty-hint">It may have been deleted or the link is invalid.</p>
                    </>
                )}
                {onBack && (
                    <button type="button" className="back-btn" onClick={onBack}>
                        Back to tickets
                    </button>
                )}
            </div>
        )
    }

    const sysId = getSysId(ticket)

    const handleFieldUpdate = async (field, value, successMessage?: string) => {
        const updated = { ...localState, [field]: value }
        setLocalState(updated)
        await onUpdate(sysId, { [field]: value }, successMessage)
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
        const bodyToSend = replyBody.trim()
        if (!bodyToSend) return

        setSubmitting(true)
        setReplyBody('')
        try {
            await onReply(sysId, bodyToSend, replyType)
        } catch {
            setReplyBody(bodyToSend)
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

    const handleAssignToMe = async () => {
        if (!currentUserSysId || localState.assigned_to === currentUserSysId) return
        await handleFieldUpdate('assigned_to', currentUserSysId, 'Assigned to you')
    }

    const isAssignedToMe = !!currentUserSysId && localState.assigned_to === currentUserSysId
    const statusOptions = getAllowedStatusOptions(localState.state)

    return (
        <div className="ticket-detail-panel">
            {onBack && (
                <div className="detail-back-bar">
                    <button type="button" className="back-btn" onClick={onBack}>
                        ← Back to tickets
                    </button>
                </div>
            )}

            <div className="detail-header">
                <div className="detail-header-title">
                    <span className="detail-number">{getDisplayValue(ticket.number)}</span>
                    <h2>{getDisplayValue(ticket.short_description)}</h2>
                </div>
                <div className="detail-header-actions">
                    {onCopyLink && (
                        <button
                            type="button"
                            className="copy-link-btn"
                            onClick={() => onCopyLink(ticket)}
                            aria-label="Copy ticket link"
                            title="Copy ticket link"
                        >
                            <svg className="copy-link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                        </button>
                    )}
                    {onEdit && (
                        <button type="button" className="edit-btn" onClick={() => onEdit(ticket)}>
                            Edit
                        </button>
                    )}
                    <button type="button" className="delete-btn" onClick={() => onDelete(ticket)}>
                        Delete
                    </button>
                </div>
            </div>

            <div className="detail-fields">
                <div className="field-group">
                    <span className="field-label">Status</span>
                    <select value={localState.state} onChange={(e) => handleFieldUpdate('state', e.target.value)}>
                        {statusOptions.map((value) => (
                            <option key={value} value={value}>
                                {STATE_DISPLAY_LABELS[value] ?? value}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="field-group">
                    <span className="field-label">Priority</span>
                    <select value={localState.priority} onChange={(e) => handleFieldUpdate('priority', e.target.value)}>
                        {PRIORITY_VALUES.map((value) => (
                            <option key={value} value={value}>
                                {PRIORITY_DISPLAY_LABELS[value]}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="field-group field-group-assignee">
                    <span className="field-label">Assignee</span>
                    <div className="assignee-controls">
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
                        <button
                            type="button"
                            className="assign-me-btn"
                            onClick={handleAssignToMe}
                            disabled={!currentUserSysId || isAssignedToMe}
                        >
                            Assign to me
                        </button>
                    </div>
                </div>
                <div className="field-group">
                    <span className="field-label">Requester</span>
                    <span className="field-readonly">{getRequesterDisplay(ticket)}</span>
                </div>
                <div className="field-group">
                    <span className="field-label">Category</span>
                    <span className="field-readonly">{getDisplayValue(ticket.category)}</span>
                </div>
                <div className="field-group field-group-tags">
                    <span className="field-label">Tags</span>
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
                    commentsLoading={commentsLoading}
                    commentPage={commentPage}
                    commentTotal={commentTotal}
                    onCommentPageChange={onCommentPageChange}
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
                                <a href={`/api/now/attachment/${getSysId(att)}/file`} target="_blank" rel="noreferrer">
                                    {getDisplayValue(att.file_name)}
                                </a>
                                <span className="att-size">{formatFileSize(att.size_bytes)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
