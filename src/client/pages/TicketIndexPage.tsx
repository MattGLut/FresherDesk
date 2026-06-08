import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TicketList from '../components/TicketList'
import TicketForm from '../components/TicketForm'
import { useWorkspace } from '../context/WorkspaceContext'
import { getSysId } from '../utils/snValue'

export default function TicketIndexPage() {
    const { ticketService, reportError } = useWorkspace()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const activeView = searchParams.get('view') || 'all'
    const tagFilter = searchParams.get('tag') || ''
    const shouldOpenCreate = searchParams.get('create') === '1'

    const [debouncedTagFilter, setDebouncedTagFilter] = useState(tagFilter)
    const [tickets, setTickets] = useState([])
    const [listLoading, setListLoading] = useState(true)
    const [listRefreshing, setListRefreshing] = useState(false)
    const [showForm, setShowForm] = useState(shouldOpenCreate)
    const hasLoadedList = useRef(false)

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedTagFilter(tagFilter), 300)
        return () => window.clearTimeout(timer)
    }, [tagFilter])

    useEffect(() => {
        if (shouldOpenCreate) {
            setShowForm(true)
        }
    }, [shouldOpenCreate])

    const refreshTickets = useCallback(async () => {
        const showFullLoading = !hasLoadedList.current
        try {
            if (showFullLoading) {
                setListLoading(true)
            } else {
                setListRefreshing(true)
            }
            const filter = {
                ...(activeView === 'all' ? {} : { view: activeView }),
                ...(debouncedTagFilter.trim() ? { tag: debouncedTagFilter.trim() } : {}),
            }
            const data = await ticketService.list(filter)
            setTickets(data)
            hasLoadedList.current = true
        } catch (err) {
            reportError('Failed to load tickets', err)
        } finally {
            setListLoading(false)
            setListRefreshing(false)
        }
    }, [ticketService, activeView, debouncedTagFilter, reportError])

    useEffect(() => {
        void refreshTickets()
    }, [refreshTickets])

    const updateTagFilter = (value: string) => {
        const next = new URLSearchParams(searchParams)
        if (value.trim()) {
            next.set('tag', value.trim())
        } else {
            next.delete('tag')
        }
        setSearchParams(next, { replace: true })
    }

    const handleSelectTicket = (ticket: { sys_id: unknown }) => {
        navigate(`/tickets/${getSysId(ticket)}`)
    }

    const closeCreateForm = () => {
        setShowForm(false)
        if (searchParams.get('create')) {
            const next = new URLSearchParams(searchParams)
            next.delete('create')
            setSearchParams(next, { replace: true })
        }
    }

    const handleFormSubmit = async (formData: Record<string, string>) => {
        try {
            const created = await ticketService.create(formData)
            closeCreateForm()
            if (created) {
                navigate(`/tickets/${getSysId(created)}`)
            }
        } catch (err) {
            reportError('Failed to create ticket', err)
        }
    }

    return (
        <>
            <TicketList
                tickets={tickets}
                onSelect={handleSelectTicket}
                loading={listLoading}
                refreshing={listRefreshing}
                tagFilter={tagFilter}
                onTagFilterChange={updateTagFilter}
            />
            {showForm && <TicketForm onSubmit={handleFormSubmit} onCancel={closeCreateForm} />}
        </>
    )
}
