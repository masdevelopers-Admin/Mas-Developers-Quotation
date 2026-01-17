'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generatePOPQuotationPDF } from '@/utils/popPdfGenerator'

interface POPQuotation {
    id: string
    quotationNumber: string
    clientName: string
    clientPhone: string | null
    clientEmail: string | null
    totalAmount: number
    status: string
    createdAt: string
    items: any[]
}

export default function POPDraftsPage() {
    const router = useRouter()
    const [quotations, setQuotations] = useState<POPQuotation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchQuotations()
    }, [])

    const fetchQuotations = async () => {
        try {
            const response = await fetch('/api/pop?status=DRAFT')
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quotation?')) {
            return
        }

        try {
            const response = await fetch(`/api/pop/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await fetchQuotations()
            } else {
                alert('Failed to delete quotation')
            }
        } catch (error) {
            console.error('Error deleting quotation:', error)
            alert('Failed to delete quotation')
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
                    Draft POP Quotations
                </h1>
                <p className="text-gray-600">
                    View and manage draft POP quotations
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
                    <p className="text-gray-500 text-lg mb-4">No draft quotations found</p>
                    <button
                        onClick={() => router.push('/dashboard/pop/new')}
                        className="text-navy-600 hover:text-navy-700 font-medium"
                    >
                        Create your first POP quotation
                    </button>
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
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                            Draft
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
                                        Created: {new Date(quotation.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-navy-600 mb-4">
                                        ₹{quotation.totalAmount.toFixed(2)}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => generatePOPQuotationPDF(quotation as any)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            PDF
                                        </button>
                                        <button
                                            onClick={() => router.push(`/dashboard/pop/${quotation.id}/edit`)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(quotation.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
