import React from 'react'
import { getDisplayValue, getSysId, getCommentTypeLabel, isInternalComment } from '../utils/snValue'
import './ConversationThread.css'

export default function ConversationThread({ comments, loading }) {
    if (loading) {
        return <div className="conversation-loading">Loading conversation...</div>
    }

    if (!comments || comments.length === 0) {
        return <div className="conversation-empty">No replies yet. Start the conversation below.</div>
    }

    return (
        <div className="conversation-thread">
            {comments.map((comment) => {
                const isInternal = isInternalComment(comment.comment_type)

                return (
                    <div key={getSysId(comment)} className={`comment-bubble ${isInternal ? 'internal' : 'public'}`}>
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
