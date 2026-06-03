import React from 'react'
import { getDisplayValue, getSysId } from '../utils/snValue'

export default function ConversationThread({ comments, loading }) {
    if (loading) {
        return (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-rh-muted">Loading conversation...</div>
        )
    }

    if (!comments || comments.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-rh-muted">
                No replies yet. Start the conversation below.
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3 py-4">
            {comments.map((comment) => {
                const type = getDisplayValue(comment.comment_type)
                const isInternal = type === 'Internal Note' || comment.comment_type === 'internal_note'

                return (
                    <div
                        key={getSysId(comment)}
                        className={`rounded-lg border px-4 py-3 dark:border-rh-border ${
                            isInternal
                                ? 'border-l-[3px] border-l-amber-500 bg-amber-50 dark:bg-amber-950/20'
                                : 'border-l-[3px] border-l-rh-green bg-white dark:bg-rh-surface'
                        }`}
                    >
                        <div className="mb-2 flex items-center gap-2.5 text-xs">
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {getDisplayValue(comment.author) || 'System'}
                            </span>
                            <span
                                className={`rounded-lg px-2 py-0.5 ${
                                    isInternal
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-rh-surface-2 dark:text-rh-muted'
                                }`}
                            >
                                {isInternal ? 'Internal Note' : 'Public Reply'}
                            </span>
                            <span className="ml-auto text-gray-400 dark:text-rh-muted">
                                {getDisplayValue(comment.sys_created_on)}
                            </span>
                        </div>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                            {getDisplayValue(comment.body)}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
