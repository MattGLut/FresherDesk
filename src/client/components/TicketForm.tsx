import React, { useState, useEffect } from 'react'
import { getDisplayValue, getValue } from '../utils/snValue'

const inputClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-rh-green focus:outline-none focus:ring-2 focus:ring-rh-green/20 dark:border-rh-border dark:bg-rh-surface-2 dark:text-white dark:focus:border-rh-green'

export default function TicketForm({ ticket = null, onSubmit, onCancel }) {
    const isEditing = !!ticket

    const [formData, setFormData] = useState({
        short_description: '',
        description: '',
        state: '1',
        priority: '3',
        requester_email: '',
        category: 'general',
    })

    useEffect(() => {
        if (ticket) {
            setFormData({
                short_description: getValue(ticket.short_description),
                description: getValue(ticket.description),
                state: getValue(ticket.state) || '1',
                priority: getValue(ticket.priority) || '3',
                requester_email: getValue(ticket.requester_email),
                category: getValue(ticket.category) || 'general',
            })
        }
    }, [ticket])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-[600px] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-rh-surface">
                <div className="flex items-center justify-between bg-gray-900 px-5 py-4 dark:bg-rh-black">
                    <h2 className="m-0 text-lg font-semibold text-white">
                        {isEditing ? `Edit ${getDisplayValue(ticket.number)}` : 'Create New Ticket'}
                    </h2>
                    <button
                        type="button"
                        className="cursor-pointer border-none bg-transparent text-2xl leading-none text-gray-400 hover:text-white"
                        onClick={onCancel}
                    >
                        ×
                    </button>
                </div>
                <form className="p-5" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="short_description" className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                            Subject *
                        </label>
                        <input
                            type="text"
                            id="short_description"
                            name="short_description"
                            className={inputClass}
                            value={formData.short_description}
                            onChange={handleChange}
                            required
                            maxLength={160}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="requester_email" className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                            Requester Email
                        </label>
                        <input
                            type="email"
                            id="requester_email"
                            name="requester_email"
                            className={inputClass}
                            value={formData.requester_email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="description" className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            className={inputClass}
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                        />
                    </div>

                    <div className="mb-4 flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="state" className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                Status
                            </label>
                            <select id="state" name="state" className={inputClass} value={formData.state} onChange={handleChange}>
                                <option value="1">Open</option>
                                <option value="2">Pending</option>
                                <option value="6">Resolved</option>
                                <option value="7">Closed</option>
                            </select>
                        </div>

                        <div className="flex-1">
                            <label htmlFor="priority" className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                                Priority
                            </label>
                            <select id="priority" name="priority" className={inputClass} value={formData.priority} onChange={handleChange}>
                                <option value="1">Critical</option>
                                <option value="2">High</option>
                                <option value="3">Medium</option>
                                <option value="4">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="category" className="mb-1.5 block text-[13px] font-medium text-gray-700 dark:text-gray-300">
                            Category
                        </label>
                        <select id="category" name="category" className={inputClass} value={formData.category} onChange={handleChange}>
                            <option value="general">General</option>
                            <option value="billing">Billing</option>
                            <option value="technical">Technical</option>
                            <option value="account">Account</option>
                        </select>
                    </div>

                    <div className="mt-6 flex justify-end gap-2.5">
                        <button
                            type="button"
                            className="cursor-pointer rounded-md bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-rh-surface-2 dark:text-gray-200 dark:hover:bg-rh-border"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="cursor-pointer rounded-md bg-rh-green px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-rh-green-dim"
                        >
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
