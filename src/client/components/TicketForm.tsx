import React, { useState, useEffect } from 'react'
import { getDisplayValue, getValue, PRIORITY_DISPLAY_LABELS, PRIORITY_VALUES, STATE_DISPLAY_LABELS } from '../utils/snValue'
import { getAllowedStatusOptions, normalizeTicketStateValue } from '../../shared/ticketStateTransitions'
import { parseTags, serializeTags, formatTagsInput, parseTagsInput } from '../utils/ticketTags'
import './TicketForm.css'

export default function TicketForm({ ticket = null, parentTicket = null, onSubmit, onCancel }) {
    const isEditing = !!ticket
    const isChildCreate = !!parentTicket && !isEditing

    const [formData, setFormData] = useState({
        short_description: '',
        description: '',
        state: '1',
        priority: '3',
        requester_email: '',
        category: 'general',
        tagsInput: '',
    })

    useEffect(() => {
        if (ticket) {
            setFormData({
                short_description: getValue(ticket.short_description),
                description: getValue(ticket.description),
                state: normalizeTicketStateValue(getValue(ticket.state)),
                priority: getValue(ticket.priority) || '3',
                requester_email: getValue(ticket.requester_email),
                category: getValue(ticket.category) || 'general',
                tagsInput: formatTagsInput(parseTags(ticket.tags)),
            })
        } else if (parentTicket) {
            setFormData((prev) => ({
                ...prev,
                requester_email: getValue(parentTicket.requester_email),
            }))
        }
    }, [ticket, parentTicket])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const { tagsInput, ...rest } = formData
        onSubmit({
            ...rest,
            tags: serializeTags(parseTagsInput(tagsInput)),
        })
    }

    const statusOptions = getAllowedStatusOptions(formData.state)

    return (
        <div className="form-overlay">
            <div className="form-container">
                <div className="form-header">
                    <h2>
                        {isEditing
                            ? `Edit ${getDisplayValue(ticket.number)}`
                            : isChildCreate
                              ? `Create Child of ${getDisplayValue(parentTicket.number)}`
                              : 'Create New Ticket'}
                    </h2>
                    <button type="button" className="close-button" onClick={onCancel}>
                        ×
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="short_description">Subject *</label>
                        <input
                            type="text"
                            id="short_description"
                            name="short_description"
                            value={formData.short_description}
                            onChange={handleChange}
                            required
                            maxLength={160}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="requester_email">Requester Email</label>
                        <input
                            type="email"
                            id="requester_email"
                            name="requester_email"
                            value={formData.requester_email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="state">Status</label>
                            <select id="state" name="state" value={formData.state} onChange={handleChange}>
                                {statusOptions.map((value) => (
                                    <option key={value} value={value}>
                                        {STATE_DISPLAY_LABELS[value] ?? value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="priority">Priority</label>
                            <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                                {PRIORITY_VALUES.map((value) => (
                                    <option key={value} value={value}>
                                        {PRIORITY_DISPLAY_LABELS[value]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange}>
                            <option value="general">General</option>
                            <option value="billing">Billing</option>
                            <option value="technical">Technical</option>
                            <option value="account">Account</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tagsInput">Tags</label>
                        <input
                            type="text"
                            id="tagsInput"
                            name="tagsInput"
                            value={formData.tagsInput}
                            onChange={handleChange}
                            placeholder="Comma-separated, e.g. billing, urgent"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
