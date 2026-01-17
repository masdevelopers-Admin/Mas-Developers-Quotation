
import React, { useState } from 'react'
import { ROOM_TYPES, QuotationItem } from '@/hooks/useQuotation'

interface ItemFormProps {
    onAdd: (item: QuotationItem) => void
    predefinedPricing: { type: string; pricePerSqft: number }[]
}

export const ItemForm: React.FC<ItemFormProps> = ({ onAdd, predefinedPricing }) => {
    const [currentRoomType, setCurrentRoomType] = useState('')
    const [currentCustomRoomType, setCurrentCustomRoomType] = useState('')
    const [currentLength, setCurrentLength] = useState('')
    const [currentWidth, setCurrentWidth] = useState('')
    const [currentPricePerSqft, setCurrentPricePerSqft] = useState('')
    const [currentDescription, setCurrentDescription] = useState('')
    const [error, setError] = useState('')

    const handleAdd = () => {
        if (!currentRoomType || !currentLength || !currentWidth || !currentPricePerSqft) {
            setError('Please fill in all required fields')
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

        onAdd(newItem)

        // Reset
        setCurrentRoomType('')
        setCurrentCustomRoomType('')
        setCurrentLength('')
        setCurrentWidth('')
        setCurrentPricePerSqft('')
        setCurrentDescription('')
        setError('')
    }

    return (
        <div className="card">
            <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">
                Add Items
            </h2>
            {error && (
                <div className="mb-4 text-sm text-red-600">
                    {error}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={currentRoomType}
                        onChange={(e) => {
                            const type = e.target.value
                            setCurrentRoomType(type)
                            const pricing = predefinedPricing.find(p => p.type === type)
                            if (pricing) {
                                setCurrentPricePerSqft(pricing.pricePerSqft.toString())
                            } else {
                                setCurrentPricePerSqft('')
                            }
                        }}
                        className="input"
                    >
                        <option value="">Select room type</option>
                        {ROOM_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.icon} {type.label}
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
                onClick={handleAdd}
                className="btn btn-secondary flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
            </button>
        </div>
    )
}
