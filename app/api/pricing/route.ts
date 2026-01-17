import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

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

        const pricing = await prisma.predefinedPricing.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                type: 'asc'
            }
        })

        return NextResponse.json(pricing)
    } catch (error) {
        console.error('Error fetching pricing:', error)
        return NextResponse.json(
            { error: 'Failed to fetch pricing' },
            { status: 500 }
        )
    }
}

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

        // Check if pricing for this type already exists
        const existing = await prisma.predefinedPricing.findFirst({
            where: {
                userId: user.id,
                type
            }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Pricing for this type already exists. Please update instead.' },
                { status: 400 }
            )
        }

        const pricing = await prisma.predefinedPricing.create({
            data: {
                type,
                pricePerSqft: parseFloat(pricePerSqft),
                description,
                userId: user.id
            }
        })

        return NextResponse.json(pricing, { status: 201 })
    } catch (error) {
        console.error('Error creating pricing:', error)
        return NextResponse.json(
            { error: 'Failed to create pricing' },
            { status: 500 }
        )
    }
}
