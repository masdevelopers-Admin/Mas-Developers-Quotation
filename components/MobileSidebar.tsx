'use client'

import { useRouter, usePathname } from 'next/navigation'

interface MobileSidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
    const router = useRouter()
    const pathname = usePathname()

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Quotations', href: '/dashboard/quotations' },
        { name: 'POP Works', href: '/dashboard/pop' },
        { name: 'Materials', href: '/dashboard/materials' },
        { name: 'Pricing', href: '/dashboard/pricing' },
    ]

    const handleNavigation = (href: string) => {
        onClose()
        router.push(href)
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={onClose}
            />

            {/* Dropdown Menu */}
            <div className="absolute top-16 right-4 z-50 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                <nav className="py-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <button
                                key={item.href}
                                onClick={() => handleNavigation(item.href)}
                                className={`w-full text-left px-4 py-3 transition-colors ${isActive
                                        ? 'bg-navy-900 text-white font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {item.name}
                            </button>
                        )
                    })}
                </nav>
            </div>
        </>
    )
}
