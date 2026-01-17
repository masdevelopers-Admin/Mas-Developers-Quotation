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

        const material = await prisma.material.findFirst({
            where: {
                id,
                userId: user.id
            }
        })

        if (!material) {
            return NextResponse.json(
                { error: 'Material not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(material)
    } catch (error) {
        console.error('Error fetching material:', error)
        return NextResponse.json(
            { error: 'Failed to fetch material' },
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

        const body = await request.json()
        const { name, description, price, unit } = body

        // Validate required fields
        if (!name || !price || !unit) {
            return NextResponse.json(
                { error: 'Name, price, and unit are required' },
                { status: 400 }
            )
        }

        if (price <= 0) {
            return NextResponse.json(
                { error: 'Price must be greater than 0' },
                { status: 400 }
            )
        }

        // Check if material exists and belongs to user
        const existingMaterial = await prisma.material.findFirst({
            where: {
                id,
                userId: user.id
            }
        })

        if (!existingMaterial) {
            return NextResponse.json(
                { error: 'Material not found' },
                { status: 404 }
            )
        }

        const material = await prisma.material.update({
            where: {
                id
            },
            data: {
                name,
                description,
                price: parseFloat(price),
                unit
            }
        })

        return NextResponse.json(material)
    } catch (error) {
        console.error('Error updating material:', error)
        return NextResponse.json(
            { error: 'Failed to update material' },
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

        // Check if material exists and belongs to user
        const existingMaterial = await prisma.material.findFirst({
            where: {
                id,
                userId: user.id
            }
        })

        if (!existingMaterial) {
            return NextResponse.json(
                { error: 'Material not found' },
                { status: 404 }
            )
        }

        await prisma.material.delete({
            where: {
                id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting material:', error)
        return NextResponse.json(
            { error: 'Failed to delete material' },
            { status: 500 }
        )
    }
}
