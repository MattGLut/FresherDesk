import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { TicketService } from '../services/TicketService'
import { CommentService } from '../services/CommentService'
import { AttachmentService } from '../services/AttachmentService'

interface WorkspaceContextValue {
    ticketService: TicketService
    commentService: CommentService
    attachmentService: AttachmentService
    error: string | null
    setError: (message: string | null) => void
    reportError: (prefix: string, err: unknown) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const ticketService = useMemo(() => new TicketService(), [])
    const commentService = useMemo(() => new CommentService(), [])
    const attachmentService = useMemo(() => new AttachmentService(), [])
    const [error, setError] = useState<string | null>(null)

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
        }),
        [ticketService, commentService, attachmentService, error, reportError]
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
