import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import TicketList from '../components/TicketList'
import TicketForm from '../components/TicketForm'
import { useWorkspace } from '../context/WorkspaceContext'
import { TICKET_LIST_PAGE_SIZE } from '../constants/tickets'
import { getSysId } from '../utils/snValue'

function parsePage(value: string | null): number {
    const parsed = parseInt(value || '1', 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export default function TicketIndexPage() {
    const { ticketService, reportError, showToast } = useWorkspace()
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams()

    const activeView = searchParams.get('view') || 'all'
    const tagFilter = searchParams.get('tag') || ''
    const shouldOpenCreate = searchParams.get('create') === '1'
    const page = parsePage(searchParams.get('page'))

    const [debouncedTagFilter, setDebouncedTagFilter] = useState(tagFilter)
    const [tickets, setTickets] = useState([])
    const [totalTickets, setTotalTickets] = useState(0)
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
            const offset = (page - 1) * TICKET_LIST_PAGE_SIZE
            const { tickets: data, total } = await ticketService.listPage(filter, TICKET_LIST_PAGE_SIZE, offset)

            if (total > 0 && offset >= total && page > 1) {
                const lastPage = Math.ceil(total / TICKET_LIST_PAGE_SIZE)
                const next = new URLSearchParams(searchParams)
                if (lastPage <= 1) {
                    next.delete('page')
                } else {
                    next.set('page', String(lastPage))
                }
                setSearchParams(next, { replace: true })
                return
            }

            setTickets(data)
            setTotalTickets(total)
            hasLoadedList.current = true
        } catch (err) {
            reportError('Failed to load tickets', err)
        } finally {
            setListLoading(false)
            setListRefreshing(false)
        }
    }, [ticketService, activeView, debouncedTagFilter, page, reportError, searchParams, setSearchParams])

    useEffect(() => {
        void refreshTickets()
    }, [location.key, refreshTickets])

    const updateTagFilter = (value: string) => {
        const next = new URLSearchParams(searchParams)
        if (value.trim()) {
            next.set('tag', value.trim())
        } else {
            next.delete('tag')
        }
        next.delete('page')
        setSearchParams(next, { replace: true })
    }

    const setPage = (nextPage: number) => {
        const next = new URLSearchParams(searchParams)
        if (nextPage <= 1) {
            next.delete('page')
        } else {
            next.set('page', String(nextPage))
        }
        setSearchParams(next, { replace: true })
    }

    const totalPages = Math.max(1, Math.ceil(totalTickets / TICKET_LIST_PAGE_SIZE))

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
            showToast('Ticket created')
            if (created) {
                navigate(`/tickets/${getSysId(created)}`)
            }
        } catch (err) {
            reportError('Failed to create ticket', err)
        }
    }

    const openCreateForm = () => {
        setShowForm(true)
        const next = new URLSearchParams(searchParams)
        next.set('create', '1')
        setSearchParams(next, { replace: true })
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
                page={page}
                totalPages={totalPages}
                totalTickets={totalTickets}
                onPageChange={setPage}
                onCreateClick={openCreateForm}
            />
            {showForm && <TicketForm onSubmit={handleFormSubmit} onCancel={closeCreateForm} />}
        </>
    )
}
