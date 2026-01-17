'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Quotation {
    id: string
    quotationNumber: string
    clientName: string
    clientPhone?: string
    totalAmount: number
    finalizedAt: string
    progress?: {
        status: string
        percentage: number
    }[]
}

export default function FinalizedPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchFinalized()
    }, [])

    const fetchFinalized = async () => {
        try {
            const response = await fetch('/api/quotations?status=FINALIZED')
            if (!response.ok) {
                throw new Error('Failed to fetch finalized quotations')
            }
            const data = await response.json()
            setQuotations(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            NOT_STARTED: 'bg-gray-100 text-gray-800',
            IN_PROGRESS: 'bg-blue-100 text-blue-800',
            COMPLETED: 'bg-green-100 text-green-800',
        }
        return styles[status as keyof typeof styles] || styles.NOT_STARTED
    }

    const getStatusLabel = (status: string) => {
        const labels = {
            NOT_STARTED: 'Not Started',
            IN_PROGRESS: 'In Progress',
            COMPLETED: 'Completed',
        }
        return labels[status as keyof typeof labels] || status
    }

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
                    <p className="mt-4 text-gray-600">Loading finalized quotations...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Finalized Quotations
                    </h1>
                    <p className="text-gray-600">
                        Track progress of your finalized quotations
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Finalized Quotations</h3>
                    <p className="text-gray-600 mb-6">You haven&apos;t finalized any quotations yet.</p>
                    <Link href="/dashboard/quotations/new" className="btn btn-primary flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Your First Quotation
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {quotations.map((quotation) => {
                        const latestProgress = quotation.progress?.[0]
                        return (
                            <div key={quotation.id} className="card p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-display font-semibold text-gray-900">
                                                {quotation.clientName}
                                            </h3>
                                            {latestProgress && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(latestProgress.status)}`}>
                                                    {getStatusLabel(latestProgress.status)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span className="font-mono font-semibold text-navy-600">
                                                {quotation.quotationNumber}
                                            </span>
                                            {quotation.clientPhone && (
                                                <span>📞 {quotation.clientPhone}</span>
                                            )}
                                            <span>
                                                Finalized: {new Date(quotation.finalizedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                                            <div className="text-2xl font-bold text-navy-600">
                                                ₹{quotation.totalAmount.toFixed(2)}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/dashboard/quotations/${quotation.id}`}
                                            className="btn btn-primary flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                                {latestProgress && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Progress</span>
                                            <span className="text-sm font-semibold text-navy-600">
                                                {latestProgress.percentage}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-navy-600 to-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${latestProgress.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
