import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function createDefaultUser() {
    const existingUser = await prisma.user.findUnique({
        where: { username: 'Admin' }
    })

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('admin', 10)
        await prisma.user.create({
            data: {
                username: 'Admin',
                password: hashedPassword,
                name: 'Administrator',
                email: 'admin@masdevelopers.in'
            }
        })
        console.log('Default user created: Admin/admin')
    }
}

export async function verifyCredentials(username: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { username }
    })

    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    return {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email
    }
}
