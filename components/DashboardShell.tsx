'use client'

import { useState, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import NavigationButtons from '@/components/NavigationButtons'
import Sidebar from '@/components/Sidebar'
import MobileSidebar from '@/components/MobileSidebar'

interface DashboardShellProps {
    children: ReactNode
    user: {
        name?: string | null
        username?: string | null
        email?: string | null
    }
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar (Overlay) */}
            <MobileSidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar (Desktop) */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200/50 shadow-sm relative">
                    <div className="px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">

                        {/* Mobile Logo (Visible only on small screens) */}
                        <div className="md:hidden flex items-center">
                            <Link href="/dashboard" className="flex items-center space-x-2">
                                <Image
                                    src="/mas-logo.png"
                                    alt="MAS Developers"
                                    width={100}
                                    height={40}
                                    className="object-contain"
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-4 ml-auto">
                            <NavigationButtons />

                            {/* Mobile Menu Button - Top Right */}
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(true)
                                }}
                                className="md:hidden p-2 text-white bg-navy-800 hover:bg-navy-700 rounded-lg shadow-md transition-colors"
                                aria-label="Open menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                            <div className="hidden sm:block text-right mr-2">
                                <p className="text-sm font-bold text-navy-900">
                                    {user.name || user.username}
                                </p>
                            </div>
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="h-full p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
