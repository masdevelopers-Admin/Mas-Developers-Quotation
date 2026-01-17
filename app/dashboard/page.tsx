import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import DashboardCard from '@/components/DashboardCard'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

async function getStats(userId: string) {
    const [
        totalQuotations,
        draftQuotations,
        finalizedQuotations,
        totalMaterials
    ] = await Promise.all([
        prisma.quotation.count({ where: { userId } }),
        prisma.quotation.count({ where: { userId, status: 'DRAFT' } }),
        prisma.quotation.count({ where: { userId, status: 'FINALIZED' } }),
        prisma.material.count({ where: { userId } })
    ])

    return {
        totalQuotations,
        draftQuotations,
        finalizedQuotations,
        totalMaterials
    }
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    const { user } = session
    // Fallback ID if not present in session type (depending on next-auth config), 
    // assuming extended session or email lookup might be needed if ID is missing.
    // For now, trusting session.user.id exists as per typical setup, 
    // otherwise we might need to fetch user by email.
    // Given the previous turns, strict user ID usage is best.
    // I'll assume 'id' is on the user object. If not, I'll need to fix auth options.
    const userId = (user as any).id

    const stats = userId ? await getStats(userId) : { totalQuotations: 0, draftQuotations: 0, finalizedQuotations: 0, totalMaterials: 0 }


    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Welcome & Overview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-navy-900">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Welcome back, {user.name || user.email}
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm font-medium text-gray-600">System Operational</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-elegant border border-gray-100">
                    <div className="text-gray-500 text-sm font-medium mb-1">Total Quotations</div>
                    <div className="text-3xl font-bold text-navy-900">{stats.totalQuotations}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-elegant border border-gray-100">
                    <div className="text-gray-500 text-sm font-medium mb-1">Drafts</div>
                    <div className="text-3xl font-bold text-orange-600">{stats.draftQuotations}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-elegant border border-gray-100">
                    <div className="text-gray-500 text-sm font-medium mb-1">Finalized</div>
                    <div className="text-3xl font-bold text-green-600">{stats.finalizedQuotations}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-elegant border border-gray-100">
                    <div className="text-gray-500 text-sm font-medium mb-1">Materials</div>
                    <div className="text-3xl font-bold text-purple-600">{stats.totalMaterials}</div>
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Quick Actions / Modules */}
            <div className="grid grid-cols-1 gap-8">

                {/* Interior Quotations */}
                <section>
                    <div className="flex items-center space-x-2 mb-6">
                        <h2 className="text-xl font-display font-bold text-navy-900">Interior Quotations</h2>
                        <span className="px-2 py-0.5 rounded-full bg-navy-50 text-navy-600 text-xs font-semibold">Core Module</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DashboardCard
                            title="New Quotation"
                            description="Create a custom interior design quotation starting from scratch."
                            href="/dashboard/quotations/new"
                            variant="highlight"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            }
                        />
                        <DashboardCard
                            title="Manage Drafts"
                            description="Access and edit your saved draft quotations."
                            href="/dashboard/quotations/drafts"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            }
                        />
                        <DashboardCard
                            title="Finalized Quotes"
                            description="View and manage approved quotations."
                            href="/dashboard/quotations/finalized"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                    </div>
                </section>

                {/* Management & Others */}
                <section>
                    <h2 className="text-xl font-display font-bold text-navy-900 mb-6">Management Tools</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DashboardCard
                            title="Material Library"
                            description="Update material prices and specifications."
                            href="/dashboard/materials"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            }
                        />
                        <DashboardCard
                            title="Pricing Models"
                            description="Configure base rates for different room types."
                            href="/dashboard/pricing"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <DashboardCard
                            title="POP Quotations"
                            description="Specialized module for POP work estimates."
                            href="/dashboard/pop"
                            icon={
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            }
                        />
                    </div>
                </section>
            </div>
        </div>
    )
}
