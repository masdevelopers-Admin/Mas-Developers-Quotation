import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface POPItem {
    id: string
    description: string
    pricingType?: 'area' | 'quantity'
    length?: number
    width?: number
    area?: number
    pricePerSqft?: number
    quantity?: number
    unitPrice?: number
    totalPrice: number
}

export interface POPQuotation {
    quotationNumber: string
    clientName: string
    clientPhone?: string
    clientEmail?: string
    clientAddress?: string
    notes?: string
    totalAmount: number
    items: POPItem[]
    createdAt: string | Date
}

const getLogoDataUrl = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch logo')
        const blob = await response.blob()
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch (error) {
        console.error('Error loading logo:', error)
        return ''
    }
}

export const generatePOPQuotationPDF = async (quotation: POPQuotation) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Brand Colors
    const primaryColor = [10, 25, 47] as [number, number, number] // Navy #0a192f
    const accentColor = [230, 240, 255] as [number, number, number] // Light Blue
    const goldColor = [197, 164, 126] as [number, number, number] // Gold/Bronze
    const grayColor = [100, 116, 139] as [number, number, number] // Slate 500

    // Load Logo
    const logoUrl = await getLogoDataUrl('/mas-logo.png')

    // --- Watermark Function ---
    const addWatermark = () => {
        if (!logoUrl) return
        const totalPages = doc.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            doc.saveGraphicsState()
            try {
                // @ts-ignore
                const gState = new doc.GState({ opacity: 0.08 }) // Very light opacity
                // @ts-ignore
                doc.setGState(gState)
            } catch (e) {
                console.warn('GState not supported', e)
            }
            const imgWidth = 150
            const imgHeight = 75
            const x = (pageWidth - imgWidth) / 2
            const y = (pageHeight - imgHeight) / 2
            doc.addImage(logoUrl, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST')
            doc.restoreGraphicsState()
        }
    }

    // --- Header Section ---

    // Header Background (White for safety)
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, pageWidth, 45, 'F')

    // Logo (Left)
    if (logoUrl) {
        doc.addImage(logoUrl, 'PNG', 15, 12, 40, 20)
    } else {
        doc.setFontSize(24)
        doc.setTextColor(...primaryColor)
        doc.setFont('helvetica', 'bold')
        doc.text('MAS', 15, 25)
        doc.setFontSize(10)
        doc.text('DEVELOPERS', 15, 30)
    }

    // Header Title
    doc.setFontSize(32)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('POP QUOTATION', pageWidth - 15, 25, { align: 'right' })

    // Gold Accent Line
    doc.setDrawColor(...goldColor)
    doc.setLineWidth(1.5)
    doc.line(15, 42, pageWidth - 15, 42)

    // --- Info Section ---
    const yPos = 60

    // Left Column: FROM (Company)
    doc.setFontSize(10)
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'bold')
    doc.text('FROM:', 15, yPos) // Align with logo

    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text('MAS Developers', 15, yPos + 6)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...grayColor)
    doc.text('Bengaluru, Karnataka', 15, yPos + 11)
    doc.text('admin@masdevelopers.in', 15, yPos + 16)
    doc.text('+91 99002 02674', 15, yPos + 21)

    // Right Column: TO (Client)
    const rightColX = pageWidth / 2 + 10
    doc.setFontSize(10)
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'bold')
    doc.text('TO:', rightColX, yPos)

    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text(quotation.clientName, rightColX, yPos + 6)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...grayColor)

    let clientY = yPos + 11
    if (quotation.clientPhone) {
        doc.text(quotation.clientPhone, rightColX, clientY)
        clientY += 5
    }
    if (quotation.clientEmail) {
        doc.text(quotation.clientEmail, rightColX, clientY)
        clientY += 5
    }
    if (quotation.clientAddress) {
        const addressLines = doc.splitTextToSize(quotation.clientAddress, 80)
        doc.text(addressLines, rightColX, clientY)
    }

    // Quotation Details Box
    doc.setDrawColor(...goldColor)
    doc.setFillColor(250, 252, 255)
    doc.roundedRect(pageWidth - 75, yPos - 5, 60, 20, 1, 1, 'FD')

    const dateStr = quotation.createdAt instanceof Date
        ? quotation.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date(quotation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    const boxX = pageWidth - 70
    doc.setFontSize(9)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text(`DATE:`, boxX, yPos + 3)
    doc.setFont('helvetica', 'normal')
    doc.text(dateStr, boxX, yPos + 8)

    // --- Table Section ---
    const tableBody = quotation.items.map(item => {
        let details = '-'
        let rate = '-'
        let dimensions = '-'

        const type = item.pricingType || (item.length && item.width ? 'area' : 'quantity')

        if (type === 'area') {
            details = `Area Based`
            dimensions = `${item.length}ft x ${item.width}ft = ${item.area?.toFixed(2)} sqft`
            rate = `Rs. ${item.pricePerSqft?.toFixed(2)} /sqft`
        } else {
            details = `Quantity Based`
            const qty = item.quantity || 0
            const price = item.unitPrice || 0
            dimensions = `${qty} units`
            rate = `Rs. ${price.toFixed(2)} /unit`
        }

        return [
            item.description,
            details,
            dimensions,
            rate,
            `Rs. ${item.totalPrice.toFixed(2)}`
        ]
    })

    autoTable(doc, {
        startY: 105,
        head: [['Description', 'Type', 'Dimensions / Qty', 'Rate', 'Total']],
        body: tableBody,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 5,
            textColor: [50, 50, 50],
            valign: 'middle',
            lineWidth: 0.1,
            lineColor: [230, 230, 230],
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left',
            lineWidth: 0
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50, textColor: primaryColor },
            1: { cellWidth: 25 },
            2: { halign: 'right', cellWidth: 40 },
            3: { halign: 'right', cellWidth: 35 },
            4: { halign: 'right', fontStyle: 'bold', cellWidth: 30, textColor: primaryColor }
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        // Footer: Text at index 2, spanning 2 columns (2 and 3)
        foot: [[
            { content: 'Total Amount:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
            `Rs. ${quotation.totalAmount.toFixed(2)}`
        ]],
        footStyles: {
            fillColor: [255, 255, 255],
            textColor: primaryColor,
            fontStyle: 'bold',
            fontSize: 12,
            halign: 'right',
            cellPadding: 8,
            lineWidth: 0
        },
        didDrawPage: (data) => {
            // Footer
            const pageCount = doc.getNumberOfPages()
            const footerY = pageHeight - 15

            doc.setDrawColor(...goldColor)
            doc.setLineWidth(0.5)
            doc.line(15, footerY - 5, pageWidth - 15, footerY - 5)

            doc.setFontSize(8)
            doc.setTextColor(100)
            doc.text('MAS Developers - POP Quotation', 15, footerY)
            doc.text(`Page ${pageCount}`, pageWidth - 15, footerY, { align: 'right' })
        }
    })

    // --- Notes & Terms ---
    const finalY = (doc as any).lastAutoTable.finalY + 15

    doc.setFillColor(252, 252, 252)
    doc.setDrawColor(230, 230, 230)
    doc.roundedRect(15, finalY, pageWidth - 30, 45, 2, 2, 'FD')

    doc.setFontSize(10)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('TERMS & CONDITIONS', 22, finalY + 10)

    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.setFont('helvetica', 'normal')

    const defaultNote = "1. Quotation valid for 30 days from date of issue.\n2. 50% advance payment required to commence work.\n3. Verify all dimensions and specifications on site.\n4. Timelines are subject to site readiness and payment schedules."
    const notesText = quotation.notes || defaultNote

    const splitNotes = doc.splitTextToSize(notesText, pageWidth - 45)
    doc.text(splitNotes, 22, finalY + 18)

    // --- Signature ---
    const sigY = finalY + 70

    // Check pagination for signature
    if (sigY > pageHeight - 30) {
        doc.addPage()
    }

    // Recalculate signature Y if new page or not
    const currentY = doc.getNumberOfPages() > 1 && sigY > pageHeight - 30 ? 40 : sigY

    // Shifted signature block left slightly to prevent cutoff
    const sigBlockX = pageWidth - 60

    doc.setFontSize(11)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('For MAS Developers', pageWidth - 20, currentY, { align: 'right' })

    // Signature Line
    doc.setDrawColor(...grayColor)
    doc.setLineWidth(0.5)
    doc.line(pageWidth - 70, currentY + 25, pageWidth - 20, currentY + 25)

    doc.setFontSize(9)
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'normal')
    doc.text('Authorized Signature', pageWidth - 20, currentY + 32, { align: 'right' })

    addWatermark()

    const safeClientName = quotation.clientName ? quotation.clientName.replace(/[^a-z0-9]/gi, '_') : 'Client'
    const safeFilename = `MAS_Developers_${safeClientName}_POP_Quotation.pdf`
    doc.save(safeFilename)
}
