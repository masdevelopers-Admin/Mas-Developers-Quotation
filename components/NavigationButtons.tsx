'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

export default function NavigationButtons() {
    const router = useRouter()
    const pathname = usePathname()

    // Track forward history availability
    const [forwardHistoryCount, setForwardHistoryCount] = useState(0)
    const isNavigatingRef = useRef<'BACK' | 'NEXT' | 'NONE'>('NONE')

    // Reset or update forward history count on navigation
    useEffect(() => {
        if (isNavigatingRef.current === 'BACK') {
            // If we went back, we inherently created a forward history slot
            setForwardHistoryCount(prev => prev + 1)
        } else if (isNavigatingRef.current === 'NEXT') {
            // If we went next, we consumed a forward history slot
            setForwardHistoryCount(prev => Math.max(0, prev - 1))
        } else {
            // New navigation (link click or browser native interaction) usually clears forward history
            // or we force it to 0 for safety to satisfy the "disabled by default" requirement
            setForwardHistoryCount(0)
        }

        // Reset navigation type
        isNavigatingRef.current = 'NONE'
    }, [pathname])

    // Disable navigation buttons if on the main dashboard
    const isHome = pathname === '/dashboard'

    if (isHome) {
        return null
    }

    const handleBack = () => {
        isNavigatingRef.current = 'BACK'
        router.back()
    }

    const handleNext = () => {
        if (forwardHistoryCount > 0) {
            isNavigatingRef.current = 'NEXT'
            router.forward()
        }
    }

    const isNextDisabled = isHome || forwardHistoryCount === 0

    return (
        <div className="flex space-x-2">
            <button
                onClick={handleBack}
                disabled={isHome}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isHome
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-navy-600 bg-navy-50 hover:bg-navy-100'
                    }`}
            >
                Previous
            </button>
            <button
                onClick={handleNext}
                disabled={isNextDisabled}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isNextDisabled
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-navy-600 bg-navy-50 hover:bg-navy-100'
                    }`}
            >
                Next
            </button>
        </div>
    )
}
