
import React from 'react'
import { QuotationItem, ROOM_TYPES } from '@/hooks/useQuotation'

interface ItemsTableProps {
    items: QuotationItem[]
    onRemove: (id: string) => void
    totalAmount: number
}

export const ItemsTable: React.FC<ItemsTableProps> = ({ items, onRemove, totalAmount }) => {
    if (items.length === 0) return null

    return (
        <div className="card">
            <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
                Quotation Items
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Room Type</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Length (ft)</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Width (ft)</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Area (sqft)</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price/Sqft</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <div>
                                        <div className="font-medium text-gray-900 flex items-center">
                                            <span className="mr-2 text-lg">
                                                {item.roomType === 'custom' ? '✨' :
                                                    ROOM_TYPES.find(t => t.value === item.roomType)?.icon}
                                            </span>
                                            {item.roomType === 'custom' ? item.customRoomType :
                                                ROOM_TYPES.find(t => t.value === item.roomType)?.label}
                                        </div>
                                        {item.description && (
                                            <div className="text-sm text-gray-500">{item.description}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right text-gray-900">{item.length.toFixed(2)}</td>
                                <td className="py-3 px-4 text-right text-gray-900">{item.width.toFixed(2)}</td>
                                <td className="py-3 px-4 text-right text-gray-900">{item.area.toFixed(2)}</td>
                                <td className="py-3 px-4 text-right text-gray-900">₹{item.pricePerSqft.toFixed(2)}</td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900">₹{item.totalPrice.toFixed(2)}</td>
                                <td className="py-3 px-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => onRemove(item.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-gray-300">
                            <td colSpan={5} className="py-4 px-4 text-right font-semibold text-gray-900">
                                Total Amount:
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-xl text-navy-600">
                                ₹{totalAmount.toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
