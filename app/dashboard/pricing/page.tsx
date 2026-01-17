'use client'

import { useState, useEffect } from 'react'

interface PredefinedPricing {
    id: string
    type: string
    pricePerSqft: number
    description: string | null
    createdAt: string
    updatedAt: string
}

const ROOM_TYPES = [
    { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { value: 'wardrobe', label: 'Wardrobe', icon: '👔' },
    { value: 'loft', label: 'Loft', icon: '📦' },
    { value: 'tv_unit', label: 'TV Unit', icon: '📺' },
    { value: 'bed', label: 'Bed', icon: '🛏️' },
    { value: 'pooja_room', label: 'Pooja Room', icon: '🙏' },
    { value: 'crockery_unit', label: 'Crockery Unit', icon: '🍽️' },
    { value: 'pantry', label: 'Pantry', icon: '🥘' },
    { value: 'magic_corner', label: 'Magic Corner', icon: '✨' },
]

export default function PricingPage() {
    const [pricing, setPricing] = useState<PredefinedPricing[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingPricing, setEditingPricing] = useState<PredefinedPricing | null>(null)
    const [formData, setFormData] = useState({
        type: '',
        pricePerSqft: '',
        description: ''
    })

    useEffect(() => {
        fetchPricing()
    }, [])

    const fetchPricing = async () => {
        try {
            const response = await fetch('/api/pricing')
            if (response.ok) {
                const data = await response.json()
                setPricing(data)
            }
        } catch (error) {
            console.error('Error fetching pricing:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingPricing
                ? `/api/pricing/${editingPricing.id}`
                : '/api/pricing'

            const method = editingPricing ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                await fetchPricing()
                closeModal()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to save pricing')
            }
        } catch (error) {
            console.error('Error saving pricing:', error)
            alert('Failed to save pricing')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this pricing?')) {
            return
        }

        try {
            const response = await fetch(`/api/pricing/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await fetchPricing()
            } else {
                alert('Failed to delete pricing')
            }
        } catch (error) {
            console.error('Error deleting pricing:', error)
            alert('Failed to delete pricing')
        }
    }

    const openModal = (pricingItem?: PredefinedPricing, defaultType?: string) => {
        if (pricingItem) {
            setEditingPricing(pricingItem)
            setFormData({
                type: pricingItem.type,
                pricePerSqft: pricingItem.pricePerSqft.toString(),
                description: pricingItem.description || ''
            })
        } else {
            setEditingPricing(null)
            setFormData({
                type: defaultType || '',
                pricePerSqft: '',
                description: ''
            })
        }
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingPricing(null)
        setFormData({
            type: '',
            pricePerSqft: '',
            description: ''
        })
    }

    const getPricingForType = (type: string) => {
        return pricing.find(p => p.type === type)
    }

    const getRoomTypeLabel = (type: string) => {
        return ROOM_TYPES.find(rt => rt.value === type)?.label || type
    }

    const getRoomTypeIcon = (type: string) => {
        return ROOM_TYPES.find(rt => rt.value === type)?.icon || '✨'
    }

    const isPredefinedType = (type: string) => {
        return ROOM_TYPES.some(rt => rt.value === type)
    }

    // Filter out pricing items that are already shown in the predefined list
    const customPricingItems = pricing.filter(p => !isPredefinedType(p.type))

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    Predefined Pricing
                </h1>
                <p className="text-gray-600">
                    Set default prices per square foot for different interior types
                </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ROOM_TYPES.map((roomType) => {
                    const existingPricing = getPricingForType(roomType.value)

                    return (
                        <div
                            key={roomType.value}
                            className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${existingPricing ? 'border-2 border-green-200' : 'border-2 border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-3xl">{roomType.icon}</span>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {roomType.label}
                                    </h3>
                                </div>
                                {existingPricing && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        Set
                                    </span>
                                )}
                            </div>

                            {existingPricing ? (
                                <>
                                    <div className="mb-4">
                                        <div className="text-3xl font-bold text-navy-600 mb-1">
                                            ₹{existingPricing.pricePerSqft}
                                        </div>
                                        <div className="text-sm text-gray-500">per sqft</div>
                                        {existingPricing.description && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                {existingPricing.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => openModal(existingPricing)}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(existingPricing.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-400 text-sm mb-4">No pricing set</p>
                                    <button
                                        onClick={() => {
                                            openModal(undefined, roomType.value)
                                        }}
                                        className="w-full px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors text-sm"
                                    >
                                        Set Price
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Custom Pricing Items */}
                {customPricingItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-green-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl">✨</span>
                                <h3 className="text-xl font-semibold text-gray-900 capitalize">
                                    {item.type}
                                </h3>
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Custom
                            </span>
                        </div>

                        <div className="mb-4">
                            <div className="text-3xl font-bold text-navy-600 mb-1">
                                ₹{item.pricePerSqft}
                            </div>
                            <div className="text-sm text-gray-500">per sqft</div>
                            {item.description && (
                                <p className="text-sm text-gray-600 mt-2">
                                    {item.description}
                                </p>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => openModal(item)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Custom Room Card */}
                <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center hover:border-gray-400 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Add Custom Room</h3>
                    <p className="text-sm text-gray-500 mb-4">Define a price for a custom room type</p>
                    <button
                        onClick={() => openModal(undefined, '')}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        Add Custom
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingPricing ? 'Edit Pricing' : 'Set Pricing'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Type *
                                </label>
                                <div className="w-full">
                                    {isPredefinedType(formData.type) && formData.type !== '' ? (
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 flex items-center">
                                            <span className="mr-2 text-xl">{getRoomTypeIcon(formData.type)}</span>
                                            <span className="font-medium">{getRoomTypeLabel(formData.type)}</span>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            required
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                            placeholder="e.g. Guest Room"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price per Sqft (₹) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.pricePerSqft}
                                    onChange={(e) => setFormData({ ...formData, pricePerSqft: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Optional notes about this pricing"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors"
                                >
                                    {editingPricing ? 'Update' : 'Set'} Pricing
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
