import React, { useState, useEffect, useCallback } from 'react'
import ConversationThread from './ConversationThread'
import AuditDeltaThread from './AuditDeltaThread'
import PanelPagination from './PanelPagination'
import { CommentService } from '../services/CommentService'
import { AUDIT_DELTA_PAGE_SIZE, pageOffset } from '../constants/pagination'
import './ConversationPanel.css'

export default function ConversationPanel({
    ticketSysId,
    comments,
    commentsLoading,
    commentPage,
    commentTotal,
    onCommentPageChange,
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
    const [auditTotal, setAuditTotal] = useState(0)
    const [auditPage, setAuditPage] = useState(1)
    const [auditLoading, setAuditLoading] = useState(false)
    const [auditLoadedFor, setAuditLoadedFor] = useState(null)

    useEffect(() => {
        setActiveTab('conversation')
        setAuditDeltas([])
        setAuditTotal(0)
        setAuditPage(1)
        setAuditLoadedFor(null)
    }, [ticketSysId])

    const fetchAuditPage = useCallback(async (targetPage: number) => {
        const commentService = new CommentService()
        return commentService.listAuditDeltasPageForTicket(
            ticketSysId,
            AUDIT_DELTA_PAGE_SIZE,
            pageOffset(targetPage, AUDIT_DELTA_PAGE_SIZE)
        )
    }, [ticketSysId])

    const loadAuditDeltas = useCallback(async () => {
        if (!ticketSysId || auditLoadedFor === ticketSysId) {
            return
        }

        setAuditLoading(true)
        try {
            const result = await fetchAuditPage(1)
            setAuditDeltas(result.items)
            setAuditTotal(result.total)
            setAuditPage(1)
            setAuditLoadedFor(ticketSysId)
        } catch {
            setAuditDeltas([])
            setAuditTotal(0)
            setAuditPage(1)
        } finally {
            setAuditLoading(false)
        }
    }, [ticketSysId, auditLoadedFor, fetchAuditPage])

    const handleAuditPageChange = useCallback(async (nextPage: number) => {
        setAuditLoading(true)
        try {
            const result = await fetchAuditPage(nextPage)
            setAuditDeltas(result.items)
            setAuditTotal(result.total)
            setAuditPage(nextPage)
        } catch {
            setAuditDeltas([])
        } finally {
            setAuditLoading(false)
        }
    }, [fetchAuditPage])

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
                    <ConversationThread
                        comments={comments}
                        loading={detailLoading || commentsLoading}
                        commentPage={commentPage}
                        commentTotal={commentTotal}
                        onCommentPageChange={onCommentPageChange}
                    />
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
                <>
                    <PanelPagination
                        page={auditPage}
                        pageSize={AUDIT_DELTA_PAGE_SIZE}
                        totalItems={auditTotal}
                        onPageChange={handleAuditPageChange}
                        disabled={auditLoading}
                    />
                    <AuditDeltaThread comments={auditDeltas} loading={auditLoading} />
                </>
            )}
        </div>
    )
}
