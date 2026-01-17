'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createQuotation(data: any) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.username) {
        return { error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
        where: { username: session.user.username as string }
    })

    if (!user) {
        return { error: 'User not found' }
    }

    const {
        clientName,
        clientPhone,
        clientEmail,
        clientAddress,
        notes,
        status,
        items
    } = data

    if (!clientName) {
        return { error: 'Client name is required' }
    }

    if (!items || items.length === 0) {
        return { error: 'At least one item is required' }
    }

    // Generate quotation number
    const year = new Date().getFullYear()
    const lastQuotation = await prisma.quotation.findFirst({
        where: {
            quotationNumber: {
                startsWith: `QT-${year}-`
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    let quotationNumber
    if (lastQuotation) {
        const lastNumber = parseInt(lastQuotation.quotationNumber.split('-')[2])
        quotationNumber = `QT-${year}-${String(lastNumber + 1).padStart(4, '0')}`
    } else {
        quotationNumber = `QT-${year}-0001`
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
        const area = item.length * item.width
        return sum + (area * item.pricePerSqft)
    }, 0)

    try {
        const quotation = await prisma.quotation.create({
            data: {
                quotationNumber,
                clientName,
                clientPhone,
                clientEmail,
                clientAddress,
                notes,
                status: status || 'DRAFT',
                totalAmount,
                finalizedAt: status === 'FINALIZED' ? new Date() : null,
                userId: user.id,
                items: {
                    create: items.map((item: any) => ({
                        roomType: item.roomType,
                        customRoomType: item.customRoomType,
                        length: item.length,
                        width: item.width,
                        area: item.length * item.width,
                        pricePerSqft: item.pricePerSqft,
                        totalPrice: (item.length * item.width) * item.pricePerSqft,
                        priceSource: item.priceSource || 'CUSTOM',
                        description: item.description
                    }))
                }
            },
            include: {
                items: true
            }
        })

        // If finalized, create initial progress entry
        if (status === 'FINALIZED') {
            await prisma.quotationProgress.create({
                data: {
                    quotationId: quotation.id,
                    status: 'NOT_STARTED',
                    percentage: 0,
                    updatedBy: user.name || user.username
                }
            })
        }

        revalidatePath('/dashboard')
        revalidatePath('/dashboard/quotations')

        return { success: true, quotation }
    } catch (error) {
        console.error('Error creating quotation:', error)
        return { error: 'Failed to create quotation' }
    }
}
