'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface QuotationItem {
    id: string
    roomType: string
    customRoomType?: string
    length: number
    width: number
    area: number
    pricePerSqft: number
    totalPrice: number
    priceSource: 'PREDEFINED' | 'CUSTOM'
    description?: string
}

const ROOM_TYPES = [
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'wardrobe', label: 'Wardrobe' },
    { value: 'loft', label: 'Loft' },
    { value: 'tv_unit', label: 'TV Unit' },
    { value: 'bed', label: 'Bed' },
    { value: 'pooja_room', label: 'Pooja Room' },
    { value: 'crockery_unit', label: 'Crockery Unit' },
    { value: 'pantry', label: 'Pantry' },
    { value: 'magic_corner', label: 'Magic Corner' },
    { value: 'custom', label: 'Custom' },
]

export default function EditQuotationPage() {
    const router = useRouter()
    const params = useParams()
    const quotationId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    // Client Information
    const [clientName, setClientName] = useState('')
    const [clientPhone, setClientPhone] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [clientAddress, setClientAddress] = useState('')
    const [notes, setNotes] = useState('')

    // Quotation Items
    const [items, setItems] = useState<QuotationItem[]>([])

    // Current Item Being Added
    const [currentRoomType, setCurrentRoomType] = useState('')
    const [currentCustomRoomType, setCurrentCustomRoomType] = useState('')
    const [currentLength, setCurrentLength] = useState('')
    const [currentWidth, setCurrentWidth] = useState('')
    const [currentPricePerSqft, setCurrentPricePerSqft] = useState('')
    const [currentDescription, setCurrentDescription] = useState('')

    useEffect(() => {
        fetchQuotation()
    }, [quotationId])

    const fetchQuotation = async () => {
        try {
            const response = await fetch(`/api/quotations/${quotationId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch quotation')
            }
            const data = await response.json()

            // Populate form with existing data
            setClientName(data.clientName)
            setClientPhone(data.clientPhone || '')
            setClientEmail(data.clientEmail || '')
            setClientAddress(data.clientAddress || '')
            setNotes(data.notes || '')
            setItems(data.items.map((item: any) => ({
                ...item,
                id: item.id || Date.now().toString()
            })))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const addItem = () => {
        if (!currentRoomType || !currentLength || !currentWidth || !currentPricePerSqft) {
            setError('Please fill in all required fields for the item')
            return
        }

        const length = parseFloat(currentLength)
        const width = parseFloat(currentWidth)
        const pricePerSqft = parseFloat(currentPricePerSqft)
        const area = length * width
        const totalPrice = area * pricePerSqft

        const newItem: QuotationItem = {
            id: Date.now().toString(),
            roomType: currentRoomType,
            customRoomType: currentRoomType === 'custom' ? currentCustomRoomType : undefined,
            length,
            width,
            area,
            pricePerSqft,
            totalPrice,
            priceSource: 'CUSTOM',
            description: currentDescription || undefined,
        }

        setItems([...items, newItem])

        // Reset form
        setCurrentRoomType('')
        setCurrentCustomRoomType('')
        setCurrentLength('')
        setCurrentWidth('')
        setCurrentPricePerSqft('')
        setCurrentDescription('')
        setError('')
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.totalPrice, 0)
    }

    const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'FINALIZED') => {
        e.preventDefault()
        setError('')

        if (!clientName) {
            setError('Client name is required')
            return
        }

        if (items.length === 0) {
            setError('Please add at least one item to the quotation')
            return
        }

        setSaving(true)

        try {
            const response = await fetch(`/api/quotations/${quotationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientName,
                    clientPhone: clientPhone || undefined,
                    clientEmail: clientEmail || undefined,
                    clientAddress: clientAddress || undefined,
                    notes: notes || undefined,
                    status,
                    items: items.map(({ id, ...item }) => item),
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update quotation')
            }

            // Redirect based on status
            if (status === 'DRAFT') {
                router.push('/dashboard/quotations/drafts')
            } else {
                router.push('/dashboard/quotations/finalized')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setSaving(false)
        }
    }

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
                    Edit Quotation
                </h1>
                <p className="text-gray-600">
                    Modify your draft quotation
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            <form className="space-y-8">
                {/* Client Information */}
                <div className="card">
                    <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
                        Client Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="input"
                                placeholder="Enter client name"
                                required
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
                                className="input"
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                className="input"
                                placeholder="Enter email address"
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
                                className="input"
                                placeholder="Enter address"
                            />
                        </div>
                    </div>
                </div>

                {/* Add Items */}
                <div className="card">
                    <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
                        Add Items
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={currentRoomType}
                                onChange={(e) => setCurrentRoomType(e.target.value)}
                                className="input"
                            >
                                <option value="">Select room type</option>
                                {ROOM_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {currentRoomType === 'custom' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Custom Room Type <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={currentCustomRoomType}
                                    onChange={(e) => setCurrentCustomRoomType(e.target.value)}
                                    className="input"
                                    placeholder="Enter custom room type"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Length (ft) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={currentLength}
                                onChange={(e) => setCurrentLength(e.target.value)}
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Width (ft) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={currentWidth}
                                onChange={(e) => setCurrentWidth(e.target.value)}
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price per Sqft (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={currentPricePerSqft}
                                onChange={(e) => setCurrentPricePerSqft(e.target.value)}
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <input
                                type="text"
                                value={currentDescription}
                                onChange={(e) => setCurrentDescription(e.target.value)}
                                className="input"
                                placeholder="Optional description"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addItem}
                        className="btn-primary"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Item
                    </button>
                </div>

                {/* Items List */}
                {items.length > 0 && (
                    <div className="card">
                        <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
                            Quotation Items
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Room Type</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Length (ft)</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Width (ft)</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Area (sqft)</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price/Sqft</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {item.roomType === 'custom' ? item.customRoomType :
                                                            ROOM_TYPES.find(t => t.value === item.roomType)?.label}
                                                    </div>
                                                    {item.description && (
                                                        <div className="text-sm text-gray-500">{item.description}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-900">{item.length.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-right text-gray-900">{item.width.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-right text-gray-900">{item.area.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-right text-gray-900">₹{item.pricePerSqft.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-right font-semibold text-gray-900">₹{item.totalPrice.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-gray-300">
                                        <td colSpan={5} className="py-4 px-4 text-right font-semibold text-gray-900">
                                            Total Amount:
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold text-xl text-navy-600">
                                            ₹{calculateTotal().toFixed(2)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

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
                <div className="flex flex-wrap gap-4">
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'DRAFT')}
                        disabled={saving}
                        className="btn-secondary"
                    >
                        {saving ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'FINALIZED')}
                        disabled={saving}
                        className="btn-primary"
                    >
                        {saving ? 'Finalizing...' : 'Finalize Quotation'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={saving}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
