'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function HomeButton() {
    const pathname = usePathname()

    // Don't show on main dashboard
    if (pathname === '/dashboard') {
        return null
    }

    return (
        <Link
            href="/dashboard"
            className="mr-4 px-4 py-2 text-sm font-medium text-navy-600 bg-navy-50 hover:bg-navy-100 rounded-lg transition-colors flex items-center"
        >
            Home
        </Link>
    )
}
