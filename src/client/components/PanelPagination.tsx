import React from 'react'
import { totalPages as calcTotalPages } from '../constants/pagination'
import './PanelPagination.css'

export default function PanelPagination({
    page,
    pageSize,
    totalItems,
    onPageChange,
    disabled = false,
}) {
    const totalPages = calcTotalPages(totalItems, pageSize)

    if (totalItems <= pageSize) {
        return null
    }

    return (
        <div className="panel-pagination">
            <button
                type="button"
                className="pagination-btn"
                disabled={page <= 1 || disabled}
                onClick={() => onPageChange(page - 1)}
            >
                ‹ Prev
            </button>
            <span className="pagination-info">
                {page} / {totalPages}
            </span>
            <button
                type="button"
                className="pagination-btn"
                disabled={page >= totalPages || disabled}
                onClick={() => onPageChange(page + 1)}
            >
                Next ›
            </button>
        </div>
    )
}
