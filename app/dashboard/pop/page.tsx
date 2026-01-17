import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import DashboardCard from '@/components/DashboardCard'
import { redirect } from 'next/navigation'

export default async function PopPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">
                    POP Works
                </h1>
                <p className="text-gray-600">
                    Manage Plaster of Paris (POP) quotations and estimates
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="New POP Quotation"
                    description="Create a new POP work estimate."
                    href="/dashboard/pop/new"
                    variant="highlight"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    }
                />
                <DashboardCard
                    title="Draft POPs"
                    description="Continue working on saved POP drafts."
                    href="/dashboard/pop/drafts"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    }
                />
                <DashboardCard
                    title="Finalized POPs"
                    description="View approved POP work orders."
                    href="/dashboard/pop/finalized"
                    icon={
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>
        </div>
    )
}
