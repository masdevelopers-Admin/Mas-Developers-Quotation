'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface POPQuotation {
    id: string
    quotationNumber: string
    clientName: string
    clientPhone: string | null
    clientEmail: string | null
    totalAmount: number
    status: string
    createdAt: string
    finalizedAt: string | null
    items: any[]
}

export default function POPFinalizedPage() {
    const router = useRouter()
    const [quotations, setQuotations] = useState<POPQuotation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchQuotations()
    }, [])

    const fetchQuotations = async () => {
        try {
            const response = await fetch('/api/pop?status=FINALIZED')
            if (response.ok) {
                const data = await response.json()
                setQuotations(data)
            }
        } catch (error) {
            console.error('Error fetching quotations:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredQuotations = quotations.filter(q =>
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    Finalized POP Quotations
                </h1>
                <p className="text-gray-600">
                    View finalized POP quotations
                </p>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by quotation number or client name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
            </div>

            {filteredQuotations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No finalized quotations found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredQuotations.map((quotation) => (
                        <div key={quotation.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {quotation.quotationNumber}
                                        </h3>
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                            Finalized
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-1">
                                        <strong>Client:</strong> {quotation.clientName}
                                    </p>
                                    {quotation.clientPhone && (
                                        <p className="text-gray-600 mb-1">
                                            <strong>Phone:</strong> {quotation.clientPhone}
                                        </p>
                                    )}
                                    <p className="text-gray-600 mb-2">
                                        <strong>Items:</strong> {quotation.items.length}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Finalized: {quotation.finalizedAt ? new Date(quotation.finalizedAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-navy-600 mb-4">
                                        ₹{quotation.totalAmount.toFixed(2)}
                                    </div>
                                    <button
                                        onClick={() => router.push(`/dashboard/pop/${quotation.id}`)}
                                        className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors text-sm"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
