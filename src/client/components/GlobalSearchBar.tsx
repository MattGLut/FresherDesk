import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './GlobalSearchBar.css'

export default function GlobalSearchBar() {
    const location = useLocation()
    const navigate = useNavigate()
    const inputRef = useRef<HTMLInputElement>(null)
    const urlQuery = new URLSearchParams(location.search).get('q') || ''
    const [value, setValue] = useState(urlQuery)

    useEffect(() => {
        setValue(urlQuery)
    }, [urlQuery])

    const applySearch = useCallback(
        (nextValue: string) => {
            const params = new URLSearchParams(location.search)
            const trimmed = nextValue.trim()

            if (trimmed) {
                params.set('q', trimmed)
            } else {
                params.delete('q')
            }
            params.delete('page')

            const search = params.toString()
            const target = { pathname: '/', search: search ? `?${search}` : '' }

            if (location.pathname === '/') {
                navigate(target, { replace: true })
            } else {
                navigate(target)
            }
        },
        [location.pathname, location.search, navigate]
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value
        setValue(next)
        applySearch(next)
    }

    const handleClear = () => {
        setValue('')
        applySearch('')
        inputRef.current?.focus()
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== '/') {
                return
            }
            const target = e.target as HTMLElement | null
            if (
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.tagName === 'SELECT' ||
                    target.isContentEditable)
            ) {
                return
            }
            e.preventDefault()
            inputRef.current?.focus()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div className="global-search">
            <label className="global-search-label" htmlFor="global-ticket-search">
                Search tickets
            </label>
            <div className="global-search-input-wrap">
                <span className="global-search-icon" aria-hidden="true">
                    ⌕
                </span>
                <input
                    ref={inputRef}
                    id="global-ticket-search"
                    type="search"
                    className="global-search-input"
                    placeholder="Search by number, subject, or requester..."
                    value={value}
                    onChange={handleChange}
                    autoComplete="off"
                    spellCheck={false}
                />
                {value && (
                    <button type="button" className="global-search-clear" onClick={handleClear} aria-label="Clear search">
                        ×
                    </button>
                )}
            </div>
            <span className="global-search-hint" aria-hidden="true">
                Press <kbd>/</kbd> to focus
            </span>
        </div>
    )
}
