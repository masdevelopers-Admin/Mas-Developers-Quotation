import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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

        const quotation = await prisma.pOPQuotation.findFirst({
            where: {
                id,
                userId: user.id
            },
            include: {
                items: true
            }
        })

        if (!quotation) {
            return NextResponse.json(
                { error: 'Quotation not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(quotation)
    } catch (error) {
        console.error('Error fetching POP quotation:', error)
        return NextResponse.json(
            { error: 'Failed to fetch POP quotation' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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

        const quotation = await prisma.pOPQuotation.findFirst({
            where: {
                id,
                userId: user.id
            }
        })

        if (!quotation) {
            return NextResponse.json(
                { error: 'Quotation not found' },
                { status: 404 }
            )
        }

        if (quotation.status === 'FINALIZED') {
            return NextResponse.json(
                { error: 'Cannot edit finalized quotation' },
                { status: 400 }
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

        // Calculate total amount
        const totalAmount = items.reduce((sum: number, item: any) => {
            return sum + item.totalPrice
        }, 0)

        // Delete existing items and create new ones
        await prisma.pOPItem.deleteMany({
            where: {
                popQuotationId: id
            }
        })

        const updatedQuotation = await prisma.pOPQuotation.update({
            where: {
                id
            },
            data: {
                clientName,
                clientPhone,
                clientEmail,
                clientAddress,
                notes,
                status: status || quotation.status,
                totalAmount,
                finalizedAt: status === 'FINALIZED' ? new Date() : quotation.finalizedAt,
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

        return NextResponse.json(updatedQuotation)
    } catch (error) {
        console.error('Error updating POP quotation:', error)
        return NextResponse.json(
            { error: 'Failed to update POP quotation' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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

        const quotation = await prisma.pOPQuotation.findFirst({
            where: {
                id,
                userId: user.id
            }
        })

        if (!quotation) {
            return NextResponse.json(
                { error: 'Quotation not found' },
                { status: 404 }
            )
        }

        if (quotation.status === 'FINALIZED') {
            return NextResponse.json(
                { error: 'Cannot delete finalized quotation' },
                { status: 400 }
            )
        }

        await prisma.pOPQuotation.delete({
            where: {
                id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting POP quotation:', error)
        return NextResponse.json(
            { error: 'Failed to delete POP quotation' },
            { status: 500 }
        )
    }
}
