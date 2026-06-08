import React, { useEffect, useRef } from 'react'
import { getDisplayValue, getSysId, getCommentTypeLabel, isInternalComment, getCommentTypeValue, isVisibleCommentType } from '../utils/snValue'
import { isOptimisticComment } from '../utils/optimisticComment'
import './ConversationThread.css'

export default function ConversationThread({ comments, loading }) {
    const threadRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const last = threadRef.current?.lastElementChild
        last?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, [comments])

    if (loading) {
        return <div className="conversation-loading">Loading conversation...</div>
    }

    if (!comments || comments.length === 0) {
        return <div className="conversation-empty">No replies yet. Start the conversation below.</div>
    }

    return (
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
    )
}
