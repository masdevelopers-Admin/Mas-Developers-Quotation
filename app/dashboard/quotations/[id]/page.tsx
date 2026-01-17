'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateQuotationPDF } from '@/utils/pdfGenerator'

interface QuotationItem {
    id: string
    roomType: string
    customRoomType?: string
    length: number
    width: number
    area: number
    pricePerSqft: number
    totalPrice: number
    description?: string
}

interface Quotation {
    id: string
    quotationNumber: string
    clientName: string
    clientPhone?: string
    clientEmail?: string
    clientAddress?: string
    notes?: string
    totalAmount: number
    status: string
    createdAt: string
    items: QuotationItem[]
}

export default function QuotationViewPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const [id, setId] = useState<string>('')
    const [quotation, setQuotation] = useState<Quotation | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        // Unwrap params
        params.then(p => {
            setId(p.id)
            fetchQuotation(p.id)
        })
    }, [params])

    const fetchQuotation = async (quotationId: string) => {
        try {
            const response = await fetch(`/api/quotations/${quotationId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch quotation')
            }
            const data = await response.json()
            setQuotation(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const downloadPDF = async () => {
        if (!quotation) return
        await generateQuotationPDF(quotation)
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>
    if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>
    if (!quotation) return <div className="p-8 text-center">Quotation not found</div>

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">

                    <h1 className="text-2xl font-bold text-gray-900">
                        {quotation.quotationNumber}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${quotation.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {quotation.status}
                    </span>
                </div>
                <div className="flex space-x-3">
                    {quotation.status === 'DRAFT' && (
                        <Link
                            href={`/dashboard/quotations/${quotation.id}/edit`}
                            className="btn-secondary"
                        >
                            Edit
                        </Link>
                    )}
                    <button
                        onClick={downloadPDF}
                        className="btn-primary flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Quotation Preview Card */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <div className="p-8 border-b border-gray-200 bg-gray-50 flex justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-navy-900">MAS Developers</h2>
                        <p className="text-sm text-gray-600">Interior Quotation System</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{new Date(quotation.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="p-8">
                    {/* Client Info */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Client Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium text-gray-900">{quotation.clientName}</p>
                            </div>
                            {quotation.clientPhone && (
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{quotation.clientPhone}</p>
                                </div>
                            )}
                            {quotation.clientAddress && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="font-medium text-gray-900">{quotation.clientAddress}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="text-left py-3 text-sm font-semibold text-gray-600">Room</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-600">Dimensions</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-600">Price/Sqft</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-600">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotation.items.map((item) => (
                                <tr key={item.id} className="border-b border-gray-50">
                                    <td className="py-4">
                                        <p className="font-medium text-gray-900 capitalize">
                                            {item.roomType === 'custom' ? item.customRoomType : item.roomType}
                                        </p>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </td>
                                    <td className="py-4 text-right text-gray-600">
                                        {item.length} x {item.width} ft<br />
                                        <span className="text-xs">({item.area} sqft)</span>
                                    </td>
                                    <td className="py-4 text-right text-gray-600">₹{item.pricePerSqft}</td>
                                    <td className="py-4 text-right font-medium text-gray-900">₹{item.totalPrice.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="py-4 text-right font-semibold text-gray-900">Total Amount</td>
                                <td className="py-4 text-right font-bold text-xl text-navy-600">₹{quotation.totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Notes */}
                    {quotation.notes && (
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">Notes</h3>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{quotation.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
