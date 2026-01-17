import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Ensure autoTable is assigned to jsPDF
// (jsPDF as any).API.autoTable = autoTable;

export interface QuotationItem {
    id: string
    roomType: string
    customRoomType?: string
    length: number
    width: number
    area: number
    pricePerSqft: number
    totalPrice: number
    description?: string
}

export interface Quotation {
    quotationNumber: string
    clientName: string
    clientPhone?: string
    clientEmail?: string
    clientAddress?: string
    notes?: string
    totalAmount: number
    items: QuotationItem[]
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

export const generateQuotationPDF = async (quotation: Quotation) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Brand Colors
    const primaryColor = [10, 25, 47] as [number, number, number] // Navy #0a192f
    const accentColor = [230, 240, 255] as [number, number, number] // Light Blue
    const goldColor = [197, 164, 126] as [number, number, number] // Gold/Bronze accent
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

    // Background Header
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 45, 'F')

    // Logo (Left)
    if (logoUrl) {
        // White logo box or just place it? 
        // Let's place it directly if it looks good on dark, otherwise add a white backing
        // Assuming the logo might be dark, let's put it in a white container or use a white version if available.
        // For now, let's add a subtle white glow/box behind it if needed, but 'mas-logo.png' might be the main one.
        // Safer to keep the top bar purely decorative and put logo below, OR put logo in a white box.
        // Let's try placing it on top of the dark header. If it's black text, it won't show.
        // Let's assume standard logo. 

        // Actually, let's make the header white and use the primary color for accents to be safe with the logo.
        // REVERTED Header Background to White for safety, using Primary Color for text.
        doc.setFillColor(255, 255, 255)
        doc.rect(0, 0, pageWidth, 45, 'F')
        doc.addImage(logoUrl, 'PNG', 15, 12, 40, 20)
    } else {
        doc.setFontSize(24)
        doc.setTextColor(...primaryColor)
        doc.setFont('helvetica', 'bold')
        doc.text('MAS', 15, 25)
        doc.setFontSize(10)
        doc.text('DEVELOPERS', 15, 30)
    }

    // Company Info (Right)
    doc.setFontSize(32)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('QUOTATION', pageWidth - 15, 25, { align: 'right' })

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
    doc.text('FROM:', 15, yPos)

    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text('MAS Developers', 15, yPos + 6)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...grayColor)
    doc.text('Bengaluru, Karnataka', 15, yPos + 11)
    doc.text('admin@masdevelopers.in', 15, yPos + 16)
    doc.text('+91 99002 02674', 15, yPos + 21) // Added contact per brochure usually having it

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
    // Adjusted position and size
    doc.roundedRect(pageWidth - 75, yPos - 5, 60, 20, 1, 1, 'FD')

    const dateStr = quotation.createdAt instanceof Date
        ? quotation.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date(quotation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    const boxX = pageWidth - 70
    doc.setFontSize(9)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold');
    doc.text(`DATE:`, boxX, yPos + 7)
    doc.setFont('helvetica', 'normal');
    // Reduced height box, centered text
    doc.text(dateStr, boxX + 12, yPos + 7)


    // --- Table Section ---
    const tableBody = quotation.items.map(item => [
        item.roomType === 'custom' ? item.customRoomType || 'Custom' : item.roomType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        item.description || '-',
        `${item.length} x ${item.width}`,
        item.area.toFixed(2),
        `Rs. ${item.pricePerSqft.toFixed(2)}`,
        `Rs. ${item.totalPrice.toFixed(2)}`
    ])

    autoTable(doc, {
        startY: 105,
        head: [['Item / Room', 'Description', 'Dimensions\n(ft)', 'Area\n(sqft)', 'Price\n/Sqft', 'Total']],
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
            0: { fontStyle: 'bold', cellWidth: 35, textColor: primaryColor },
            1: { cellWidth: 45 },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'right', cellWidth: 20 },
            4: { halign: 'right', cellWidth: 25 },
            5: { halign: 'right', fontStyle: 'bold', cellWidth: 35, textColor: primaryColor }
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        // Updated Footer: Use colSpan for 'Total Amount' to prevent wrapping
        foot: [[
            { content: 'Total Amount:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
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

            // Footer Line
            doc.setDrawColor(...goldColor)
            doc.setLineWidth(0.5)
            doc.line(15, footerY - 5, pageWidth - 15, footerY - 5)

            // Footer Text
            doc.setFontSize(8)
            doc.setTextColor(100)
            doc.text('MAS Developers - Expert Interior Solutions', 15, footerY)
            doc.text(`Page ${pageCount}`, pageWidth - 15, footerY, { align: 'right' })
        }
    })

    // --- Notes & Terms ---
    const finalY = (doc as any).lastAutoTable.finalY + 15

    // Notes Background
    doc.setFillColor(252, 252, 252)
    doc.setDrawColor(230, 230, 230)
    doc.roundedRect(15, finalY, pageWidth - 30, 45, 2, 2, 'FD')

    // Notes Title
    doc.setFontSize(10)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('TERMS & CONDITIONS', 22, finalY + 10)

    // Notes Content
    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.setFont('helvetica', 'normal')

    const defaultNote = "1. Quotation valid for 30 days from date of issue.\n2. 50% advance payment required to commence work.\n3. Verify all dimensions and specifications on site.\n4. Timelines are subject to site readines and payment schedules."
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

    // Apply Watermark to all pages
    addWatermark()

    // Save with sanitized filename
    const safeClientName = quotation.clientName ? quotation.clientName.replace(/[^a-z0-9]/gi, '_') : 'Client'
    const safeFilename = `MAS_Developers_${safeClientName}_Quotation.pdf`
    doc.save(safeFilename)
}

