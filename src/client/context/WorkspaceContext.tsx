import React, { createContext, useContext, useMemo, useState, useCallback, useRef } from 'react'
import { TicketService } from '../services/TicketService'
import { CommentService } from '../services/CommentService'
import { AttachmentService } from '../services/AttachmentService'
import type { ToastItem } from '../components/ToastContainer'

const TOAST_DURATION_MS = 4000

interface WorkspaceContextValue {
    ticketService: TicketService
    commentService: CommentService
    attachmentService: AttachmentService
    error: string | null
    setError: (message: string | null) => void
    reportError: (prefix: string, err: unknown) => void
    toasts: ToastItem[]
    dismissToast: (id: number) => void
    showToast: (message: string, type?: 'success' | 'error') => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const ticketService = useMemo(() => new TicketService(), [])
    const commentService = useMemo(() => new CommentService(), [])
    const attachmentService = useMemo(() => new AttachmentService(), [])
    const [error, setError] = useState<string | null>(null)
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const nextToastId = useRef(1)
    const toastTimers = useRef<Map<number, number>>(new Map())

    const dismissToast = useCallback((id: number) => {
        const timer = toastTimers.current.get(id)
        if (timer != null) {
            window.clearTimeout(timer)
            toastTimers.current.delete(id)
        }
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const showToast = useCallback(
        (message: string, type: 'success' | 'error' = 'success') => {
            const id = nextToastId.current++
            setToasts((prev) => [...prev, { id, message, type }])
            const timer = window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
            toastTimers.current.set(id, timer)
        },
        [dismissToast]
    )

    const reportError = useCallback((prefix: string, err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(`${prefix}: ${message}`)
    }, [])

    const value = useMemo(
        () => ({
            ticketService,
            commentService,
            attachmentService,
            error,
            setError,
            reportError,
            toasts,
            dismissToast,
            showToast,
        }),
        [ticketService, commentService, attachmentService, error, reportError, toasts, dismissToast, showToast]
    )

    return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext)
    if (!context) {
        throw new Error('useWorkspace must be used within WorkspaceProvider')
    }
    return context
}
