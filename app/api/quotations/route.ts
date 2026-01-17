import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.username) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { username: session.user.username }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const {
            clientName,
            clientPhone,
            clientEmail,
            clientAddress,
            notes,
            status,
            items
        } = body

        // Validate required fields
        if (!clientName) {
            return NextResponse.json(
                { error: 'Client name is required' },
                { status: 400 }
            )
        }

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: 'At least one item is required' },
                { status: 400 }
            )
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

        // Create quotation with items
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

        return NextResponse.json(quotation, { status: 201 })
    } catch (error) {
        console.error('Error creating quotation:', error)
        return NextResponse.json(
            { error: 'Failed to create quotation' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.username) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { username: session.user.username }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        const quotations = await prisma.quotation.findMany({
            where: {
                userId: user.id,
                ...(status && { status })
            },
            include: {
                items: true,
                progress: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(quotations)
    } catch (error) {
        console.error('Error fetching quotations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch quotations' },
            { status: 500 }
        )
    }
}
