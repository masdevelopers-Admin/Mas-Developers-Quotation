'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Quotation {
    id: string
    quotationNumber: string
    clientName: string
    clientPhone?: string
    totalAmount: number
    createdAt: string
    items: any[]
}

export default function DraftsPage() {
    const router = useRouter()
    const [quotations, setQuotations] = useState<Quotation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchDrafts()
    }, [])

    const fetchDrafts = async () => {
        try {
            const response = await fetch('/api/quotations?status=DRAFT')
            if (!response.ok) {
                throw new Error('Failed to fetch drafts')
            }
            const data = await response.json()
            setQuotations(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this draft quotation?')) {
            return
        }

        try {
            const response = await fetch(`/api/quotations/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete quotation')
            }

            // Refresh the list
            fetchDrafts()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete quotation')
        }
    }

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
                    <p className="mt-4 text-gray-600">Loading drafts...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Draft Quotations
                    </h1>
                    <p className="text-gray-600">
                        Manage and edit your draft quotations
                    </p>
                </div>
                <Link href="/dashboard/quotations/new" className="btn btn-primary flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Quotation
                </Link>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {quotations.length === 0 ? (
                <div className="card text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Draft Quotations</h3>
                    <p className="text-gray-600 mb-6">You haven&apos;t created any draft quotations yet.</p>
                    <Link href="/dashboard/quotations/new" className="btn btn-primary flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Your First Quotation
                    </Link>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Quotation #</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Client Name</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Phone</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Total Amount</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Created</th>
                                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotations.map((quotation) => (
                                    <tr key={quotation.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <span className="font-mono text-sm font-semibold text-navy-600">
                                                {quotation.quotationNumber}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-900">{quotation.clientName}</td>
                                        <td className="py-4 px-6 text-gray-600">{quotation.clientPhone || '-'}</td>
                                        <td className="py-4 px-6 text-right font-semibold text-gray-900">
                                            ₹{quotation.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {new Date(quotation.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/dashboard/quotations/${quotation.id}/edit`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={`/dashboard/quotations/${quotation.id}`}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="View"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(quotation.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
