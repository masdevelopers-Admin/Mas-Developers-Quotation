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

        const quotation = await prisma.quotation.findUnique({
            where: { id },
            include: {
                items: true,
                progress: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                extensions: {
                    include: {
                        items: true
                    }
                }
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
        console.error('Error fetching quotation:', error)
        return NextResponse.json(
            { error: 'Failed to fetch quotation' },
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

        // Check if quotation exists and belongs to user
        const quotation = await prisma.quotation.findUnique({
            where: { id }
        })

        if (!quotation) {
            return NextResponse.json(
                { error: 'Quotation not found' },
                { status: 404 }
            )
        }

        if (quotation.userId !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized to delete this quotation' },
                { status: 403 }
            )
        }

        // Delete quotation (cascade will handle items and progress)
        await prisma.quotation.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting quotation:', error)
        return NextResponse.json(
            { error: 'Failed to delete quotation' },
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

        // Check if quotation exists and belongs to user
        const quotation = await prisma.quotation.findUnique({
            where: { id }
        })

        if (!quotation) {
            return NextResponse.json(
                { error: 'Quotation not found' },
                { status: 404 }
            )
        }

        if (quotation.userId !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized to update this quotation' },
                { status: 403 }
            )
        }

        // Calculate total amount if items provided
        let totalAmount = quotation.totalAmount
        if (items) {
            totalAmount = items.reduce((sum: number, item: any) => {
                const area = item.length * item.width
                return sum + (area * item.pricePerSqft)
            }, 0)
        }

        // Update quotation
        const updatedQuotation = await prisma.quotation.update({
            where: { id },
            data: {
                ...(clientName && { clientName }),
                ...(clientPhone !== undefined && { clientPhone }),
                ...(clientEmail !== undefined && { clientEmail }),
                ...(clientAddress !== undefined && { clientAddress }),
                ...(notes !== undefined && { notes }),
                ...(status && {
                    status,
                    finalizedAt: status === 'FINALIZED' ? new Date() : null
                }),
                totalAmount,
                ...(items && {
                    items: {
                        deleteMany: {},
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
                })
            },
            include: {
                items: true
            }
        })

        return NextResponse.json(updatedQuotation)
    } catch (error) {
        console.error('Error updating quotation:', error)
        return NextResponse.json(
            { error: 'Failed to update quotation' },
            { status: 500 }
        )
    }
}
