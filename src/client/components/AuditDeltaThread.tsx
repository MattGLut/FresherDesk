import React from 'react'
import { getDisplayValue, getSysId } from '../utils/snValue'
import './AuditDeltaThread.css'

interface DeltaPayload {
    field?: string
    old_value?: string
    new_value?: string
    old_display?: string
    new_display?: string
    source?: string
}

function parseDeltaBody(body: string): DeltaPayload | null {
    try {
        return JSON.parse(body) as DeltaPayload
    } catch {
        return null
    }
}

export default function AuditDeltaThread({ comments, loading }) {
    if (loading) {
        return <div className="audit-delta-loading">Loading audit deltas...</div>
    }

    if (!comments || comments.length === 0) {
        return <div className="audit-delta-empty">No field changes recorded for this ticket.</div>
    }

    return (
        <div className="audit-delta-thread">
            {comments.map((comment) => {
                const delta = parseDeltaBody(getDisplayValue(comment.body))

                return (
                    <div key={getSysId(comment)} className="audit-delta-card">
                        <div className="audit-delta-header">
                            <span className="audit-delta-field">{delta?.field || 'change'}</span>
                            {delta?.source && <span className="audit-delta-source">{delta.source}</span>}
                            <span className="audit-delta-time">{getDisplayValue(comment.sys_created_on)}</span>
                        </div>
                        {delta ? (
                            <p className="audit-delta-change">
                                <span className="audit-delta-from">{delta.old_display || delta.old_value || '(empty)'}</span>
                                <span className="audit-delta-arrow">→</span>
                                <span className="audit-delta-to">{delta.new_display || delta.new_value || '(empty)'}</span>
                            </p>
                        ) : (
                            <pre className="audit-delta-raw">{getDisplayValue(comment.body)}</pre>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
