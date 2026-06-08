import { SIDEBAR_COLLAPSED_STORAGE_KEY } from '../constants/sidebar'

export function readSidebarCollapsed(): boolean {
    try {
        return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1'
    } catch {
        return false
    }
}

export function writeSidebarCollapsed(collapsed: boolean): void {
    try {
        localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0')
    } catch {
        // ignore storage errors
    }
}
