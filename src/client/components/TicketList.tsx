import React from 'react'
import { getDisplayValue, getSysId } from '../utils/snValue'
import { parseTags } from '../utils/ticketTags'
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

export default function TicketList({ tickets, selectedId, onSelect, loading, tagFilter, onTagFilterChange }) {
    if (loading) {
        return <div className="ticket-list-panel"><div className="list-loading">Loading tickets...</div></div>
    }

    return (
        <div className="ticket-list-panel">
            <div className="list-header">
                <h2>Tickets</h2>
                <span className="ticket-count">{tickets.length}</span>
            </div>

            <div className="list-tag-filter">
                <input
                    type="text"
                    placeholder="Filter by tag..."
                    value={tagFilter}
                    onChange={(e) => onTagFilterChange(e.target.value)}
                />
                {tagFilter && (
                    <button type="button" className="tag-filter-clear" onClick={() => onTagFilterChange('')}>
                        Clear
                    </button>
                )}
            </div>

            {tickets.length === 0 ? (
                <div className="list-empty">No tickets in this view</div>
            ) : (
                <ul className="ticket-rows">
                    {tickets.map((ticket) => {
                        const sysId = getSysId(ticket)
                        const stateValue = typeof ticket.state === 'object' ? ticket.state.value : ticket.state
                        const priorityValue = typeof ticket.priority === 'object' ? ticket.priority.value : ticket.priority
                        const tags = parseTags(ticket.tags)

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
                                {tags.length > 0 && (
                                    <div className="row-tags">
                                        {tags.map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                className="tag-chip"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onTagFilterChange(tag)
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
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
