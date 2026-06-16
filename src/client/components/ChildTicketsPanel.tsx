import React, { useState, useEffect, useCallback } from 'react'
import {
    getDisplayValue,
    getValue,
    getSysId,
    getChoiceDisplay,
    STATE_DISPLAY_LABELS,
    PRIORITY_DISPLAY_LABELS,
    priorityCssClass,
} from '../utils/snValue'
import { TicketService } from '../services/TicketService'
import { ticketStatusClass } from '../utils/ticketStatus'
import { CHILD_TICKET_PAGE_SIZE, pageOffset } from '../constants/pagination'
import PanelPagination from './PanelPagination'
import './ChildTicketsPanel.css'

export default function ChildTicketsPanel({ parentTicket, onNavigateTicket, onCreateChild }) {
    const [children, setChildren] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const parentSysId = getSysId(parentTicket)
    const parentRef = getValue(parentTicket.parent)

    const loadChildren = useCallback(async (targetPage: number) => {
        setLoading(true)
        try {
            const ticketService = new TicketService()
            const result = await ticketService.listChildrenPage(
                parentSysId,
                CHILD_TICKET_PAGE_SIZE,
                pageOffset(targetPage, CHILD_TICKET_PAGE_SIZE)
            )
            setChildren(result.items)
            setTotal(result.total)
            setPage(targetPage)
        } catch {
            setChildren([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [parentSysId])

    useEffect(() => {
        setPage(1)
        void loadChildren(1)
    }, [loadChildren])

    const handlePageChange = (nextPage: number) => {
        void loadChildren(nextPage)
    }

    return (
        <div className="child-tickets-panel">
            {parentRef && (
                <div className="parent-ticket-link">
                    <span className="parent-label">Parent ticket</span>
                    <button type="button" className="parent-link-btn" onClick={() => onNavigateTicket(parentRef)}>
                        {getDisplayValue(parentTicket.parent) || parentRef}
                    </button>
                </div>
            )}

            <div className="child-tickets-header">
                <h3>Child Tickets</h3>
                <button type="button" className="create-child-btn" onClick={onCreateChild}>
                    Create Child
                </button>
            </div>

            <PanelPagination
                page={page}
                pageSize={CHILD_TICKET_PAGE_SIZE}
                totalItems={total}
                onPageChange={handlePageChange}
                disabled={loading}
            />

            {loading ? (
                <p className="child-tickets-loading">Loading child tickets...</p>
            ) : children.length === 0 ? (
                <p className="child-tickets-empty">No child tickets</p>
            ) : (
                <>
                    <ul className="child-ticket-rows">
                        {children.map((child) => {
                            const stateValue = getValue(child.state)
                            const priorityValue = getValue(child.priority)

                            return (
                                <li key={getSysId(child)} className="child-ticket-row">
                                    <button type="button" className="child-ticket-btn" onClick={() => onNavigateTicket(getSysId(child))}>
                                        <div className="child-row-top">
                                            <span className="child-number">{getDisplayValue(child.number)}</span>
                                            <span className={`status-chip ${ticketStatusClass(stateValue)}`}>
                                                {getChoiceDisplay(child.state, STATE_DISPLAY_LABELS)}
                                            </span>
                                        </div>
                                        <p className="child-subject">{getDisplayValue(child.short_description)}</p>
                                        <div className="child-row-meta">
                                            <span className={`priority-chip ${priorityCssClass(priorityValue)}`}>
                                                {getChoiceDisplay(child.priority, PRIORITY_DISPLAY_LABELS)}
                                            </span>
                                            <span className="child-updated">{getDisplayValue(child.sys_updated_on)}</span>
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </>
            )}
        </div>
    )
}
