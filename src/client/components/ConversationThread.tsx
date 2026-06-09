import React, { useEffect, useRef } from 'react'
import { getDisplayValue, getSysId, getCommentTypeLabel, isInternalComment, getCommentTypeValue, isVisibleCommentType } from '../utils/snValue'
import { isOptimisticComment } from '../utils/optimisticComment'
import { COMMENT_PAGE_SIZE, totalPages } from '../constants/pagination'
import PanelPagination from './PanelPagination'
import './ConversationThread.css'

export default function ConversationThread({
    comments,
    loading,
    commentPage = 1,
    commentTotal = 0,
    onCommentPageChange,
}) {
    const threadRef = useRef<HTMLDivElement>(null)
    const isLastPage = commentPage >= totalPages(commentTotal, COMMENT_PAGE_SIZE)

    useEffect(() => {
        if (!isLastPage) {
            return
        }
        const last = threadRef.current?.lastElementChild
        last?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, [comments, isLastPage])

    return (
        <>
            {onCommentPageChange && (
                <PanelPagination
                    page={commentPage}
                    pageSize={COMMENT_PAGE_SIZE}
                    totalItems={commentTotal}
                    onPageChange={onCommentPageChange}
                    disabled={loading}
                />
            )}

            {loading ? (
                <div className="conversation-loading">Loading conversation...</div>
            ) : !comments || comments.length === 0 ? (
                <div className="conversation-empty">No replies yet. Start the conversation below.</div>
            ) : (
                <div className="conversation-thread" ref={threadRef}>
                    {comments.filter((comment) => isVisibleCommentType(getCommentTypeValue(comment.comment_type))).map((comment) => {
                        const isInternal = isInternalComment(comment.comment_type)
                        const pending = isOptimisticComment(comment)

                        return (
                            <div
                                key={getSysId(comment)}
                                className={`comment-bubble ${isInternal ? 'internal' : 'public'}${pending ? ' is-pending' : ''}`}
                            >
                                <div className="comment-header">
                                    <span className="comment-author">{getDisplayValue(comment.author) || 'System'}</span>
                                    <span className="comment-type">{getCommentTypeLabel(comment.comment_type)}</span>
                                    <span className="comment-time">{getDisplayValue(comment.sys_created_on)}</span>
                                </div>
                                <div className="comment-body">{getDisplayValue(comment.body)}</div>
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    )
}
