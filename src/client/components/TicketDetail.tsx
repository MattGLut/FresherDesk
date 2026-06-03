import React, { useState, useEffect } from 'react'
import { getDisplayValue, getValue, getSysId } from '../utils/snValue'
import ConversationThread from './ConversationThread'

const inputClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-rh-green focus:outline-none focus:ring-2 focus:ring-rh-green/20 dark:border-rh-border dark:bg-rh-surface-2 dark:text-white dark:focus:border-rh-green'

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
            <div className="flex h-full flex-1 items-center justify-center bg-white text-base text-gray-400 dark:bg-rh-black dark:text-rh-muted">
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
        <div className="h-full flex-1 overflow-y-auto bg-white p-5 dark:bg-rh-black lg:px-6">
            <div className="mb-5 flex items-start justify-between border-b border-gray-200 pb-4 dark:border-rh-border">
                <div>
                    <span className="mb-1 block text-[13px] font-bold text-rh-green">
                        {getDisplayValue(ticket.number)}
                    </span>
                    <h2 className="m-0 text-xl font-semibold text-gray-900 dark:text-white">
                        {getDisplayValue(ticket.short_description)}
                    </h2>
                </div>
                <button
                    type="button"
                    className="cursor-pointer rounded border border-red-300 px-3.5 py-1.5 text-[13px] text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={() => onDelete(ticket)}
                >
                    Delete
                </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
                <div>
                    <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500 dark:text-rh-muted">
                        Status
                    </label>
                    <select
                        className={inputClass}
                        value={localState.state}
                        onChange={(e) => handleFieldUpdate('state', e.target.value)}
                    >
                        <option value="1">Open</option>
                        <option value="2">Pending</option>
                        <option value="6">Resolved</option>
                        <option value="7">Closed</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500 dark:text-rh-muted">
                        Priority
                    </label>
                    <select
                        className={inputClass}
                        value={localState.priority}
                        onChange={(e) => handleFieldUpdate('priority', e.target.value)}
                    >
                        <option value="1">Critical</option>
                        <option value="2">High</option>
                        <option value="3">Medium</option>
                        <option value="4">Low</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500 dark:text-rh-muted">
                        Requester
                    </label>
                    <span className="block py-2 text-sm text-gray-800 dark:text-gray-200">
                        {getDisplayValue(ticket.requester_email) || getDisplayValue(ticket.opened_by)}
                    </span>
                </div>
                <div>
                    <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-500 dark:text-rh-muted">
                        Category
                    </label>
                    <span className="block py-2 text-sm text-gray-800 dark:text-gray-200">
                        {getDisplayValue(ticket.category)}
                    </span>
                </div>
            </div>

            {getDisplayValue(ticket.description) && (
                <div className="mb-5 rounded-lg bg-gray-50 p-4 dark:bg-rh-surface">
                    <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-rh-muted">
                        Description
                    </h3>
                    <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {getDisplayValue(ticket.description)}
                    </p>
                </div>
            )}

            <div className="mb-5">
                <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-rh-muted">
                    Conversation
                </h3>
                <ConversationThread comments={comments} loading={loading} />
            </div>

            <form
                className="mb-5 overflow-hidden rounded-lg border border-gray-200 dark:border-rh-border"
                onSubmit={handleReplySubmit}
            >
                <div className="flex border-b border-gray-200 dark:border-rh-border">
                    <button
                        type="button"
                        className={`flex-1 cursor-pointer px-3 py-2.5 text-[13px] transition-colors ${
                            replyType === 'public_reply'
                                ? 'border-b-2 border-rh-green bg-white font-semibold text-gray-900 dark:bg-rh-surface dark:text-white'
                                : 'bg-gray-50 text-gray-500 hover:text-gray-700 dark:bg-rh-surface-2 dark:text-rh-muted dark:hover:text-gray-300'
                        }`}
                        onClick={() => setReplyType('public_reply')}
                    >
                        Public Reply
                    </button>
                    <button
                        type="button"
                        className={`flex-1 cursor-pointer px-3 py-2.5 text-[13px] transition-colors ${
                            replyType === 'internal_note'
                                ? 'border-b-2 border-rh-green bg-white font-semibold text-gray-900 dark:bg-rh-surface dark:text-white'
                                : 'bg-gray-50 text-gray-500 hover:text-gray-700 dark:bg-rh-surface-2 dark:text-rh-muted dark:hover:text-gray-300'
                        }`}
                        onClick={() => setReplyType('internal_note')}
                    >
                        Internal Note
                    </button>
                </div>
                <textarea
                    className="w-full resize-y border-none bg-white px-3 py-3 text-sm text-gray-900 focus:outline-none dark:bg-rh-surface dark:text-white"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={replyType === 'internal_note' ? 'Add an internal note...' : 'Write a reply...'}
                    rows={4}
                />
                <div className="flex justify-end bg-gray-50 px-3 py-2 dark:bg-rh-surface-2">
                    <button
                        type="submit"
                        className="cursor-pointer rounded bg-rh-green px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-rh-green-dim disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={submitting || !replyBody.trim()}
                    >
                        {submitting ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </form>

            <div>
                <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-rh-muted">
                        Attachments
                    </h3>
                    <label className="cursor-pointer rounded bg-gray-900 px-3.5 py-1.5 text-[13px] text-white transition-colors hover:bg-gray-800 dark:bg-rh-surface-2 dark:hover:bg-rh-border">
                        Upload
                        <input type="file" hidden onChange={handleFileChange} />
                    </label>
                </div>
                {attachments.length === 0 ? (
                    <p className="text-[13px] text-gray-400 dark:text-rh-muted">No attachments</p>
                ) : (
                    <ul className="m-0 list-none p-0">
                        {attachments.map((att) => (
                            <li
                                key={getSysId(att)}
                                className="flex justify-between border-b border-gray-100 py-2 text-sm dark:border-rh-border/50"
                            >
                                <a
                                    href={`/api/now/attachment/${getSysId(att)}/file`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline dark:text-rh-green"
                                >
                                    {getDisplayValue(att.file_name)}
                                </a>
                                <span className="text-xs text-gray-400 dark:text-rh-muted">
                                    {getDisplayValue(att.size_bytes)} bytes
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
