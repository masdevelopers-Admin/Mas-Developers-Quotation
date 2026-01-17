
// This hook will manage the state for the quotation form
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateQuotationPDF, Quotation } from '@/utils/pdfGenerator'
import { createQuotation } from '@/actions/quotations'

export interface QuotationItem {
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

export const ROOM_TYPES = [
    { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { value: 'wardrobe', label: 'Wardrobe', icon: '👔' },
    { value: 'loft', label: 'Loft', icon: '📦' },
    { value: 'tv_unit', label: 'TV Unit', icon: '📺' },
    { value: 'bed', label: 'Bed', icon: '🛏️' },
    { value: 'pooja_room', label: 'Pooja Room', icon: '🙏' },
    { value: 'crockery_unit', label: 'Crockery Unit', icon: '🍽️' },
    { value: 'pantry', label: 'Pantry', icon: '🥘' },
    { value: 'magic_corner', label: 'Magic Corner', icon: '✨' },
    { value: 'custom', label: 'Custom', icon: '✨' },
]

export const useQuotation = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [savedQuotation, setSavedQuotation] = useState<Quotation | null>(null)

    // Client Information
    const [clientName, setClientName] = useState('')
    const [clientPhone, setClientPhone] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [clientAddress, setClientAddress] = useState('')
    const [notes, setNotes] = useState('')

    // Quotation Items
    const [items, setItems] = useState<QuotationItem[]>([])

    // Pricing Data
    const [predefinedPricing, setPredefinedPricing] = useState<{ type: string; pricePerSqft: number }[]>([])

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const response = await fetch('/api/pricing')
                if (response.ok) {
                    const data = await response.json()
                    setPredefinedPricing(data)
                }
            } catch (error) {
                console.error('Error fetching pricing:', error)
            }
        }
        fetchPricing()
    }, [])

    const addItem = (item: QuotationItem) => {
        setItems([...items, item])
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.totalPrice, 0)
    }

    const saveQuotation = async (status: 'DRAFT' | 'FINALIZED') => {
        setError('')

        if (!clientName) {
            setError('Client name is required')
            return
        }

        if (items.length === 0) {
            setError('Please add at least one item to the quotation')
            return
        }

        setLoading(true)

        try {
            // Using Server Action instead of API route
            const result = await createQuotation({
                clientName,
                clientPhone: clientPhone || undefined,
                clientEmail: clientEmail || undefined,
                clientAddress: clientAddress || undefined,
                notes: notes || undefined,
                status,
                items: items.map(({ id, ...item }) => item),
            })

            if (result.error || !result.quotation) {
                throw new Error(result.error || 'Failed to create quotation')
            }

            const rawData = result.quotation
            // Transform Prisma result (nulls) to Quotation type (undefined/optionals)
            const data: Quotation = {
                ...rawData,
                clientPhone: rawData.clientPhone || undefined,
                clientEmail: rawData.clientEmail || undefined,
                clientAddress: rawData.clientAddress || undefined,
                notes: rawData.notes || undefined,
                items: rawData.items.map((item: any) => ({
                    ...item,
                    customRoomType: item.customRoomType || undefined,
                    description: item.description || undefined
                }))
            }

            if (status === 'DRAFT') {
                setSavedQuotation(data)
                setSuccessMessage('Draft saved successfully!')
                setLoading(false)
                setTimeout(() => setSuccessMessage(''), 3000)
            } else {
                router.push('/dashboard/quotations/finalized')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setLoading(false)
        }
    }

    return {
        // State
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

        // Actions
        addItem,
        removeItem,
        calculateTotal,
        saveQuotation
    }
}
