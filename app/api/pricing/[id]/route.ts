import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

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

        const body = await request.json()
        const { type, pricePerSqft, description } = body

        if (!type || !pricePerSqft) {
            return NextResponse.json(
                { error: 'Type and price per sqft are required' },
                { status: 400 }
            )
        }

        if (pricePerSqft <= 0) {
            return NextResponse.json(
                { error: 'Price must be greater than 0' },
                { status: 400 }
            )
        }

        const existingPricing = await prisma.predefinedPricing.findFirst({
            where: {
                id,
                userId: user.id
            }
        })

        if (!existingPricing) {
            return NextResponse.json(
                { error: 'Pricing not found' },
                { status: 404 }
            )
        }

        const pricing = await prisma.predefinedPricing.update({
            where: {
                id
            },
            data: {
                type,
                pricePerSqft: parseFloat(pricePerSqft),
                description
            }
        })

        return NextResponse.json(pricing)
    } catch (error) {
        console.error('Error updating pricing:', error)
        return NextResponse.json(
            { error: 'Failed to update pricing' },
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

        const existingPricing = await prisma.predefinedPricing.findFirst({
            where: {
                id,
                userId: user.id
            }
        })

        if (!existingPricing) {
            return NextResponse.json(
                { error: 'Pricing not found' },
                { status: 404 }
            )
        }

        await prisma.predefinedPricing.delete({
            where: {
                id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting pricing:', error)
        return NextResponse.json(
            { error: 'Failed to delete pricing' },
            { status: 500 }
        )
    }
}
