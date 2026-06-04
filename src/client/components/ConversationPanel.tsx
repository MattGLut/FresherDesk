import React, { useState, useEffect, useCallback } from 'react'
import ConversationThread from './ConversationThread'
import AuditDeltaThread from './AuditDeltaThread'
import { CommentService } from '../services/CommentService'
import './ConversationPanel.css'

export default function ConversationPanel({
    ticketSysId,
    comments,
    detailLoading,
    isAdmin,
    replyBody,
    replyType,
    submitting,
    onReplyBodyChange,
    onReplyTypeChange,
    onReplySubmit,
}) {
    const [activeTab, setActiveTab] = useState('conversation')
    const [auditDeltas, setAuditDeltas] = useState([])
    const [auditLoading, setAuditLoading] = useState(false)
    const [auditLoadedFor, setAuditLoadedFor] = useState(null)

    useEffect(() => {
        setActiveTab('conversation')
        setAuditDeltas([])
        setAuditLoadedFor(null)
    }, [ticketSysId])

    useEffect(() => {
        setAuditLoadedFor(null)
    }, [comments])

    const loadAuditDeltas = useCallback(async () => {
        if (!ticketSysId || auditLoadedFor === ticketSysId) {
            return
        }

        setAuditLoading(true)
        try {
            const commentService = new CommentService()
            const deltas = await commentService.listAuditDeltasForTicket(ticketSysId)
            setAuditDeltas(deltas)
            setAuditLoadedFor(ticketSysId)
        } catch {
            setAuditDeltas([])
        } finally {
            setAuditLoading(false)
        }
    }, [ticketSysId, auditLoadedFor])

    const handleAuditTab = () => {
        setActiveTab('audit')
        void loadAuditDeltas()
    }

    const handleReplySubmit = async (e) => {
        e.preventDefault()
        await onReplySubmit(e)
        if (isAdmin && auditLoadedFor === ticketSysId) {
            setAuditLoadedFor(null)
            void loadAuditDeltas()
        }
    }

    return (
        <div className="conversation-panel">
            <div className="conversation-tabs">
                <button
                    type="button"
                    className={activeTab === 'conversation' ? 'active' : ''}
                    onClick={() => setActiveTab('conversation')}
                >
                    Conversation
                </button>
                {isAdmin && (
                    <button
                        type="button"
                        className={activeTab === 'audit' ? 'active' : ''}
                        onClick={handleAuditTab}
                    >
                        Audit Deltas
                    </button>
                )}
            </div>

            {activeTab === 'conversation' ? (
                <>
                    <ConversationThread comments={comments} loading={detailLoading} />
                    <form className="reply-composer" onSubmit={handleReplySubmit}>
                        <div className="reply-type-toggle">
                            <button
                                type="button"
                                className={replyType === 'public_reply' ? 'active' : ''}
                                onClick={() => onReplyTypeChange('public_reply')}
                            >
                                Public Reply
                            </button>
                            <button
                                type="button"
                                className={replyType === 'internal_note' ? 'active' : ''}
                                onClick={() => onReplyTypeChange('internal_note')}
                            >
                                Internal Note
                            </button>
                        </div>
                        <textarea
                            value={replyBody}
                            onChange={(e) => onReplyBodyChange(e.target.value)}
                            placeholder={replyType === 'internal_note' ? 'Add an internal note...' : 'Write a reply...'}
                            rows={4}
                        />
                        <div className="reply-actions">
                            <button type="submit" className="reply-submit" disabled={submitting || !replyBody.trim()}>
                                {submitting ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <AuditDeltaThread comments={auditDeltas} loading={auditLoading} />
            )}
        </div>
    )
}
