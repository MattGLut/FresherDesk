import React from 'react'
import { getDisplayValue, getSysId } from '../utils/snValue'
import './TicketList.css'

function statusClass(stateValue: string): string {
    switch (stateValue) {
        case '1':
            return 'status-open'
        case '2':
            return 'status-pending'
        case '6':
            return 'status-resolved'
        case '7':
            return 'status-closed'
        default:
            return ''
    }
}

function priorityClass(priorityValue: string): string {
    switch (priorityValue) {
        case '1':
            return 'priority-critical'
        case '2':
            return 'priority-high'
        case '3':
            return 'priority-medium'
        case '4':
            return 'priority-low'
        default:
            return ''
    }
}

export default function TicketList({ tickets, selectedId, onSelect, loading }) {
    if (loading) {
        return <div className="ticket-list-panel"><div className="list-loading">Loading tickets...</div></div>
    }

    return (
        <div className="ticket-list-panel">
            <div className="list-header">
                <h2>Tickets</h2>
                <span className="ticket-count">{tickets.length}</span>
            </div>

            {tickets.length === 0 ? (
                <div className="list-empty">No tickets in this view</div>
            ) : (
                <ul className="ticket-rows">
                    {tickets.map((ticket) => {
                        const sysId = getSysId(ticket)
                        const stateValue = typeof ticket.state === 'object' ? ticket.state.value : ticket.state
                        const priorityValue = typeof ticket.priority === 'object' ? ticket.priority.value : ticket.priority

                        return (
                            <li
                                key={sysId}
                                className={`ticket-row ${selectedId === sysId ? 'selected' : ''}`}
                                onClick={() => onSelect(ticket)}
                            >
                                <div className="row-top">
                                    <span className="ticket-number">{getDisplayValue(ticket.number)}</span>
                                    <span className={`status-chip ${statusClass(String(stateValue))}`}>
                                        {getDisplayValue(ticket.state)}
                                    </span>
                                </div>
                                <p className="row-subject">{getDisplayValue(ticket.short_description)}</p>
                                <div className="row-meta">
                                    <span>{getDisplayValue(ticket.requester_email) || getDisplayValue(ticket.opened_by)}</span>
                                    <span className={`priority-chip ${priorityClass(String(priorityValue))}`}>
                                        {getDisplayValue(ticket.priority)}
                                    </span>
                                </div>
                                <div className="row-updated">{getDisplayValue(ticket.sys_updated_on)}</div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
