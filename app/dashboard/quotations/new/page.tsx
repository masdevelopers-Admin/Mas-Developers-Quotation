'use client'

import { useQuotation } from '@/hooks/useQuotation'
import { ClientForm } from '@/components/quotation/ClientForm'
import { ItemForm } from '@/components/quotation/ItemForm'
import { ItemsTable } from '@/components/quotation/ItemsTable'
import { useRouter } from 'next/navigation'
import { generateQuotationPDF } from '@/utils/pdfGenerator'

export default function NewQuotationPage() {
    const router = useRouter()
    const {
        loading,
        error,
        successMessage,
        setSuccessMessage,
        savedQuotation,
        clientName, setClientName,
        clientPhone, setClientPhone,
        clientEmail, setClientEmail,
        clientAddress, setClientAddress,
        notes, setNotes,
        items,
        predefinedPricing,
        addItem,
        removeItem,
        calculateTotal,
        saveQuotation
    } = useQuotation()

    const saveSuccessMessage = () => {
        if (!successMessage) return null
        return (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex justify-between items-center animate-fade-in">
                <span>{successMessage}</span>
                <button onClick={() => setSuccessMessage('')} className="text-green-700 hover:text-green-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        )
    }

    return (
        <div className="animate-fade-in max-w-7xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    New Interior Quotation
                </h1>
                <p className="text-gray-600">
                    Create a new quotation for your interior project
                </p>
            </div>

            {saveSuccessMessage()}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fade-in">
                    {error}
                </div>
            )}

            <form className="space-y-8">
                <ClientForm
                    clientName={clientName}
                    setClientName={setClientName}
                    clientPhone={clientPhone}
                    setClientPhone={setClientPhone}
                    clientEmail={clientEmail}
                    setClientEmail={setClientEmail}
                    clientAddress={clientAddress}
                    setClientAddress={setClientAddress}
                />

                <ItemForm
                    onAdd={addItem}
                    predefinedPricing={predefinedPricing}
                />

                <ItemsTable
                    items={items}
                    onRemove={removeItem}
                    totalAmount={calculateTotal()}
                />

                {/* Notes */}
                <div className="card">
                    <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
                        Additional Notes
                    </h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="input min-h-[120px]"
                        placeholder="Enter any additional notes or special instructions..."
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 sticky bottom-6 bg-gradient-to-r from-white to-gray-50 p-5 shadow-2xl rounded-2xl border-2 border-gray-100 z-10 transition-all">
                    <button
                        type="button"
                        onClick={() => saveQuotation('DRAFT')}
                        disabled={loading}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {loading ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button
                        type="button"
                        onClick={() => saveQuotation('FINALIZED')}
                        disabled={loading}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {loading ? 'Finalizing...' : 'Finalize Quotation'}
                    </button>
                    {savedQuotation && (
                        <button
                            type="button"
                            onClick={() => generateQuotationPDF(savedQuotation)}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={loading}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
