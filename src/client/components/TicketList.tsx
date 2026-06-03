import React from 'react'
import { getDisplayValue, getSysId } from '../utils/snValue'

function statusClasses(stateValue: string): string {
    switch (stateValue) {
        case '1':
            return 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400'
        case '2':
            return 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400'
        case '6':
            return 'bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400'
        case '7':
            return 'bg-gray-500/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400'
        default:
            return 'bg-gray-500/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400'
    }
}

function priorityClasses(priorityValue: string): string {
    switch (priorityValue) {
        case '1':
            return 'text-red-500 dark:text-red-400'
        case '2':
            return 'text-orange-500 dark:text-orange-400'
        case '3':
            return 'text-purple-500 dark:text-purple-400'
        case '4':
            return 'text-green-600 dark:text-rh-green'
        default:
            return 'text-gray-500 dark:text-rh-muted'
    }
}

export default function TicketList({ tickets, selectedId, onSelect, loading }) {
    if (loading) {
        return (
            <div className="flex h-full w-[340px] min-w-[340px] flex-col border-r border-gray-200 bg-gray-50 dark:border-rh-border dark:bg-rh-black">
                <div className="p-10 text-center text-sm text-gray-500 dark:text-rh-muted">Loading tickets...</div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-[340px] min-w-[340px] flex-col overflow-hidden border-r border-gray-200 bg-gray-50 dark:border-rh-border dark:bg-rh-black">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 dark:border-rh-border dark:bg-rh-surface">
                <h2 className="m-0 text-base font-semibold text-gray-900 dark:text-white">Tickets</h2>
                <span className="rounded-full bg-rh-green/10 px-2.5 py-0.5 text-xs font-semibold text-rh-green">
                    {tickets.length}
                </span>
            </div>

            {tickets.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-500 dark:text-rh-muted">No tickets in this view</div>
            ) : (
                <ul className="m-0 flex-1 list-none overflow-y-auto p-0">
                    {tickets.map((ticket) => {
                        const sysId = getSysId(ticket)
                        const stateValue = typeof ticket.state === 'object' ? ticket.state.value : ticket.state
                        const priorityValue =
                            typeof ticket.priority === 'object' ? ticket.priority.value : ticket.priority
                        const isSelected = selectedId === sysId

                        return (
                            <li
                                key={sysId}
                                className={`cursor-pointer border-b border-gray-100 px-4 py-3.5 transition-colors dark:border-rh-border/50 ${
                                    isSelected
                                        ? 'border-l-[3px] border-l-rh-green bg-rh-green/5 dark:bg-rh-green/10'
                                        : 'border-l-[3px] border-l-transparent bg-white hover:bg-gray-50 dark:bg-rh-surface dark:hover:bg-rh-surface-2'
                                }`}
                                onClick={() => onSelect(ticket)}
                            >
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                                        {getDisplayValue(ticket.number)}
                                    </span>
                                    <span
                                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses(String(stateValue))}`}
                                    >
                                        {getDisplayValue(ticket.state)}
                                    </span>
                                </div>
                                <p className="mb-2 truncate text-sm text-gray-800 dark:text-gray-200">
                                    {getDisplayValue(ticket.short_description)}
                                </p>
                                <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-rh-muted">
                                    <span>
                                        {getDisplayValue(ticket.requester_email) || getDisplayValue(ticket.opened_by)}
                                    </span>
                                    <span className={`font-medium ${priorityClasses(String(priorityValue))}`}>
                                        {getDisplayValue(ticket.priority)}
                                    </span>
                                </div>
                                <div className="text-[11px] text-gray-400 dark:text-rh-muted/80">
                                    {getDisplayValue(ticket.sys_updated_on)}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
