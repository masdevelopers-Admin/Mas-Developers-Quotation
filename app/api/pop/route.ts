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
        const lastQuotation = await prisma.pOPQuotation.findFirst({
            where: {
                quotationNumber: {
                    startsWith: `POP-${year}-`
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        let quotationNumber
        if (lastQuotation) {
            const lastNumber = parseInt(lastQuotation.quotationNumber.split('-')[2])
            quotationNumber = `POP-${year}-${String(lastNumber + 1).padStart(4, '0')}`
        } else {
            quotationNumber = `POP-${year}-0001`
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum: number, item: any) => {
            return sum + item.totalPrice
        }, 0)

        // Create POP quotation with items
        const quotation = await prisma.pOPQuotation.create({
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
                        description: item.description,
                        length: item.length || null,
                        width: item.width || null,
                        area: item.area || null,
                        pricePerSqft: item.pricePerSqft || null,
                        quantity: item.quantity || null,
                        unitPrice: item.unitPrice || null,
                        totalPrice: item.totalPrice
                    }))
                }
            },
            include: {
                items: true
            }
        })

        return NextResponse.json(quotation, { status: 201 })
    } catch (error) {
        console.error('Error creating POP quotation:', error)
        return NextResponse.json(
            { error: 'Failed to create POP quotation' },
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

        const quotations = await prisma.pOPQuotation.findMany({
            where: {
                userId: user.id,
                ...(status && { status })
            },
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(quotations)
    } catch (error) {
        console.error('Error fetching POP quotations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch POP quotations' },
            { status: 500 }
        )
    }
}
