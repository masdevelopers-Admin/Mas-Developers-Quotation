'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Material {
    id: string
    name: string
    description: string | null
    price: number
    unit: string
    createdAt: string
    updatedAt: string
}

export default function MaterialsPage() {
    const router = useRouter()
    const [materials, setMaterials] = useState<Material[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        unit: 'sqft'
    })

    useEffect(() => {
        fetchMaterials()
    }, [])

    const fetchMaterials = async () => {
        try {
            const response = await fetch('/api/materials')
            if (response.ok) {
                const data = await response.json()
                setMaterials(data)
            }
        } catch (error) {
            console.error('Error fetching materials:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingMaterial
                ? `/api/materials/${editingMaterial.id}`
                : '/api/materials'

            const method = editingMaterial ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                await fetchMaterials()
                closeModal()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to save material')
            }
        } catch (error) {
            console.error('Error saving material:', error)
            alert('Failed to save material')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this material?')) {
            return
        }

        try {
            const response = await fetch(`/api/materials/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await fetchMaterials()
            } else {
                alert('Failed to delete material')
            }
        } catch (error) {
            console.error('Error deleting material:', error)
            alert('Failed to delete material')
        }
    }

    const openModal = (material?: Material) => {
        if (material) {
            setEditingMaterial(material)
            setFormData({
                name: material.name,
                description: material.description || '',
                price: material.price.toString(),
                unit: material.unit
            })
        } else {
            setEditingMaterial(null)
            setFormData({
                name: '',
                description: '',
                price: '',
                unit: 'sqft'
            })
        }
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingMaterial(null)
        setFormData({
            name: '',
            description: '',
            price: '',
            unit: 'sqft'
        })
    }

    const filteredMaterials = materials.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Material Library
                    </h1>
                    <p className="text-gray-600">
                        Manage materials and their prices
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-navy-600 text-white px-6 py-3 rounded-lg hover:bg-navy-700 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Material</span>
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
            </div>

            {/* Materials Grid */}
            {filteredMaterials.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-4">No materials found</p>
                    <button
                        onClick={() => openModal()}
                        className="text-navy-600 hover:text-navy-700 font-medium"
                    >
                        Add your first material
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material) => (
                        <div key={material.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">{material.name}</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openModal(material)}
                                        className="text-blue-600 hover:text-blue-700"
                                        title="Edit"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(material.id)}
                                        className="text-red-600 hover:text-red-700"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {material.description && (
                                <p className="text-gray-600 text-sm mb-4">{material.description}</p>
                            )}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <span className="text-2xl font-bold text-navy-600">₹{material.price}</span>
                                <span className="text-gray-500 text-sm">per {material.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingMaterial ? 'Edit Material' : 'Add Material'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Material Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                    placeholder="e.g., Teak Wood"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Optional description"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit *
                                </label>
                                <select
                                    required
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                                >
                                    <option value="sqft">Square Feet (sqft)</option>
                                    <option value="piece">Piece</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="liter">Liter</option>
                                    <option value="meter">Meter</option>
                                    <option value="box">Box</option>
                                </select>
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
                                    {editingMaterial ? 'Update' : 'Add'} Material
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
