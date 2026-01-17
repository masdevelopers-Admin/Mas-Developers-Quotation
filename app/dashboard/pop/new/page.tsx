'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generatePOPQuotationPDF, POPQuotation } from '@/utils/popPdfGenerator'

interface POPItem {
    id: string
    description: string
    pricingType: 'area' | 'quantity'
    length?: number
    width?: number
    area?: number
    pricePerSqft?: number
    quantity?: number
    unitPrice?: number
    totalPrice: number
}

export default function NewPOPQuotationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [savedQuotation, setSavedQuotation] = useState<POPQuotation | null>(null)

    // Client information
    const [clientName, setClientName] = useState('')
    const [clientPhone, setClientPhone] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [clientAddress, setClientAddress] = useState('')
    const [notes, setNotes] = useState('')

    // Items
    const [items, setItems] = useState<POPItem[]>([])

    const addItem = () => {
        const newItem: POPItem = {
            id: Date.now().toString(),
            description: '',
            pricingType: 'area',
            length: 0,
            width: 0,
            area: 0,
            pricePerSqft: 0,
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0
        }
        setItems([...items, newItem])
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const updateItem = (id: string, field: string, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value }

                // Recalculate based on pricing type
                if (updated.pricingType === 'area') {
                    const length = parseFloat(updated.length?.toString() || '0')
                    const width = parseFloat(updated.width?.toString() || '0')
                    const pricePerSqft = parseFloat(updated.pricePerSqft?.toString() || '0')
                    updated.area = length * width
                    updated.totalPrice = updated.area * pricePerSqft
                } else {
                    const quantity = parseInt(updated.quantity?.toString() || '0')
                    const unitPrice = parseFloat(updated.unitPrice?.toString() || '0')
                    updated.totalPrice = quantity * unitPrice
                }

                return updated
            }
            return item
        }))
    }

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.totalPrice, 0)
    }

    const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'FINALIZED') => {
        e.preventDefault()
        setLoading(true)
        setSuccessMessage('')
        setSavedQuotation(null)

        try {
            const response = await fetch('/api/pop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clientName,
                    clientPhone,
                    clientEmail,
                    clientAddress,
                    notes,
                    status,
                    items: items.map(item => ({
                        description: item.description,
                        length: item.pricingType === 'area' ? item.length : null,
                        width: item.pricingType === 'area' ? item.width : null,
                        area: item.pricingType === 'area' ? item.area : null,
                        pricePerSqft: item.pricingType === 'area' ? item.pricePerSqft : null,
                        quantity: item.pricingType === 'quantity' ? item.quantity : null,
                        unitPrice: item.pricingType === 'quantity' ? item.unitPrice : null,
                        totalPrice: item.totalPrice
                    }))
                })
            })

            if (response.ok) {
                const data = await response.json()

                if (status === 'DRAFT') {
                    setSavedQuotation(data)
                    setSuccessMessage(`Draft POP Quotation ${data.quotationNumber} saved successfully!`)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                    alert(`POP Quotation ${data.quotationNumber} created successfully!`)
                    router.push('/dashboard')
                }
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to create quotation')
            }
        } catch (error) {
            console.error('Error creating quotation:', error)
            alert('Failed to create quotation')
        } finally {
            setLoading(false)
        }
    }

    const SuccessBanner = () => {
        if (!successMessage || !savedQuotation) return null
        return (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-green-700 font-medium">{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} className="text-green-700 hover:text-green-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => generatePOPQuotationPDF(savedQuotation)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm text-sm font-medium"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/pop/drafts')}
                        className="text-green-700 hover:text-green-900 font-medium text-sm flex items-center"
                    >
                        Go to Drafts &rarr;
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    New POP Quotation
                </h1>
                <p className="text-gray-600">
                    Create a new Plaster of Paris quotation
                </p>
            </div>

            <SuccessBanner />

            <form className="space-y-8">
                {/* Client Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Client Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <input
                                type="text"
                                value={clientAddress}
                                onChange={(e) => setClientAddress(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Items</h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Item</span>
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No items added. Click &quot;Add Item&quot; to get started.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={item.description}
                                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                                placeholder="e.g., False ceiling work"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pricing Type
                                            </label>
                                            <select
                                                value={item.pricingType}
                                                onChange={(e) => updateItem(item.id, 'pricingType', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                            >
                                                <option value="area">Area Based (L × W × Price/sqft)</option>
                                                <option value="quantity">Quantity Based (Qty × Unit Price)</option>
                                            </select>
                                        </div>

                                        {item.pricingType === 'area' ? (
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Length (ft)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.length || ''}
                                                        onChange={(e) => updateItem(item.id, 'length', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Width (ft)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.width || ''}
                                                        onChange={(e) => updateItem(item.id, 'width', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Price/sqft (₹)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.pricePerSqft || ''}
                                                        onChange={(e) => updateItem(item.id, 'pricePerSqft', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Quantity
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity || ''}
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Unit Price (₹)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unitPrice || ''}
                                                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Item Total:</span>
                                                <span className="text-lg font-bold text-navy-600">₹{item.totalPrice.toFixed(2)}</span>
                                            </div>
                                            {item.pricingType === 'area' && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Area: {item.area?.toFixed(2)} sqft
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        rows={4}
                        placeholder="Any additional notes or terms..."
                    />
                </div>

                {/* Total */}
                <div className="bg-navy-50 rounded-lg p-6">
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-3xl font-bold text-navy-600">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 sticky bottom-6 bg-white p-4 shadow-lg rounded-xl border border-gray-100 z-10 transition-all">
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'DRAFT')}
                        className="btn-secondary"
                        disabled={loading || items.length === 0}
                    >
                        {loading ? 'Saving...' : 'Save as Draft'}
                    </button>
                    {savedQuotation && (
                        <button
                            type="button"
                            onClick={() => generatePOPQuotationPDF(savedQuotation)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-md font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'FINALIZED')}
                        className="btn-primary"
                        disabled={loading || items.length === 0}
                    >
                        {loading ? 'Finalizing...' : 'Finalize Quotation'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
