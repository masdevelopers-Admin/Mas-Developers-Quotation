import Link from 'next/link'

interface DashboardCardProps {
    title: string
    description: string
    href: string
    icon: React.ReactNode
    variant?: 'default' | 'highlight'
}

export default function DashboardCard({ title, description, href, icon, variant = 'default' }: DashboardCardProps) {
    const isHighlight = variant === 'highlight'

    return (
        <Link href={href}>
            <div className={`
                group relative overflow-hidden rounded-2xl transition-all duration-300
                ${isHighlight
                    ? 'bg-gradient-to-br from-navy-600 to-navy-800 text-white shadow-elegant-lg hover:shadow-2xl hover:-translate-y-1'
                    : 'bg-white hover:bg-gray-50 border border-gray-100 shadow-sm hover:shadow-elegant hover:-translate-y-1'
                }
            `}>
                <div className="p-6 relative z-10">
                    <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                        ${isHighlight
                            ? 'bg-white/10 text-accent-gold'
                            : 'bg-navy-50 text-navy-600 group-hover:bg-navy-600 group-hover:text-white'
                        }
                    `}>
                        {icon}
                    </div>

                    <h3 className={`text-lg font-display font-bold mb-2 ${isHighlight ? 'text-white' : 'text-gray-900'}`}>
                        {title}
                    </h3>

                    <p className={`text-sm ${isHighlight ? 'text-gray-300' : 'text-gray-500'}`}>
                        {description}
                    </p>
                </div>

                {/* Decorative Elements */}
                {isHighlight && (
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/5 rounded-full blur-2xl transition-all group-hover:bg-white/10" />
                )}
            </div>
        </Link>
    )
}
