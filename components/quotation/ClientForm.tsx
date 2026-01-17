
import React from 'react'

interface ClientFormProps {
    clientName: string
    setClientName: (value: string) => void
    clientPhone: string
    setClientPhone: (value: string) => void
    clientEmail: string
    setClientEmail: (value: string) => void
    clientAddress: string
    setClientAddress: (value: string) => void
}

export const ClientForm: React.FC<ClientFormProps> = ({
    clientName, setClientName,
    clientPhone, setClientPhone,
    clientEmail, setClientEmail,
    clientAddress, setClientAddress
}) => {
    return (
        <div className="card">
            <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">
                Client Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="input"
                        placeholder="Enter client name"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="input"
                        placeholder="Enter phone number"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="input"
                        placeholder="Enter email address"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                    </label>
                    <input
                        type="text"
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="input"
                        placeholder="Enter address"
                    />
                </div>
            </div>
        </div>
    )
}
