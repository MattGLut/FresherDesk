import React from 'react'
import { getDisplayValue, getSysId, getChoiceDisplay, getRequesterDisplay, STATE_DISPLAY_LABELS, PRIORITY_DISPLAY_LABELS } from '../utils/snValue'
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

export default function TicketList({ tickets, onSelect, loading, refreshing, tagFilter, onTagFilterChange }) {
    if (loading && tickets.length === 0) {
        return <div className="ticket-list-panel"><div className="list-loading">Loading tickets...</div></div>
    }

    return (
        <div className={`ticket-list-panel${refreshing ? ' is-refreshing' : ''}`}>
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
                <>
                    <div className="ticket-row-header" aria-hidden="true">
                        <span>Number</span>
                        <span>Subject</span>
                        <span>Requester</span>
                        <span>Priority</span>
                        <span>Status</span>
                        <span>Updated</span>
                    </div>
                    <ul className="ticket-rows">
                        {tickets.map((ticket) => {
                            const sysId = getSysId(ticket)
                            const stateValue = typeof ticket.state === 'object' ? ticket.state.value : ticket.state
                            const priorityValue = typeof ticket.priority === 'object' ? ticket.priority.value : ticket.priority
                            const tags = parseTags(ticket.tags)

                            return (
                                <li
                                    key={sysId}
                                    className="ticket-row"
                                    onClick={() => onSelect(ticket)}
                                >
                                    <span className="ticket-number">{getDisplayValue(ticket.number)}</span>

                                    <div className="row-subject-cell">
                                        <span className="row-subject">{getDisplayValue(ticket.short_description)}</span>
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
                                    </div>

                                    <span className="row-requester">{getRequesterDisplay(ticket)}</span>

                                    <span className={`priority-chip ${priorityClass(String(priorityValue))}`}>
                                        {getChoiceDisplay(ticket.priority, PRIORITY_DISPLAY_LABELS)}
                                    </span>

                                    <span className={`status-chip ${statusClass(String(stateValue))}`}>
                                        {getChoiceDisplay(ticket.state, STATE_DISPLAY_LABELS)}
                                    </span>

                                    <span className="row-updated">{getDisplayValue(ticket.sys_updated_on)}</span>
                                </li>
                            )
                        })}
                    </ul>
                </>
            )}
        </div>
    )
}
