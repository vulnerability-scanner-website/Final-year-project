import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateBankStatementPDF = (transactions, summary, dateRange) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Header
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.text('CyberSecure', margin, 25);
  
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('BANK STATEMENT REPORT', margin, 38);
  
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth - margin, 25, { align: 'right' });

  // Period
  let yPos = 65;
  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Period:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  
  const startDate = dateRange.start 
    ? new Date(dateRange.start).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'All time';
  const endDate = dateRange.end 
    ? new Date(dateRange.end).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Present';
  
  doc.text(`${startDate} - ${endDate}`, margin + 35, yPos);

  // Summary Section
  yPos += 15;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 60, 3, 3, 'F');
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', margin + 5, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  const summaryData = [
    ['Total Revenue:', `ETB ${(summary.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Total Transactions:', `${summary.totalTransactions || 0}`],
    ['Successful Payments:', `${summary.successfulPayments || 0}`],
    ['Pending Payments:', `${summary.pendingPayments || 0}`],
    ['Failed Payments:', `${summary.failedPayments || 0}`],
  ];

  summaryData.forEach((item, index) => {
    const yOffset = yPos + (index * 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(item[0], margin + 5, yOffset);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text(item[1], margin + 60, yOffset);
  });

  // Transactions Table
  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details', margin, yPos);

  yPos += 5;

  const tableData = transactions.map(t => [
    new Date(t.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    t.chapa_tx_ref?.substring(0, 25) || 'N/A',
    t.user_email || 'N/A',
    t.plan_name || 'N/A',
    `ETB ${(t.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    (t.payment_status || 'pending').toUpperCase(),
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Date', 'Transaction ID', 'User Email', 'Plan', 'Amount', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [75, 85, 99],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 35, fontSize: 7 },
      2: { cellWidth: 40 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 18, halign: 'center' },
    },
    margin: { left: margin, right: margin },
    didDrawCell: (data) => {
      // Color-code status column
      if (data.column.index === 5 && data.section === 'body') {
        const status = data.cell.raw.toLowerCase();
        let color = [107, 114, 128]; // default gray
        
        if (status === 'paid') color = [34, 197, 94]; // green
        else if (status === 'pending') color = [251, 191, 36]; // yellow
        else if (status === 'failed') color = [239, 68, 68]; // red
        
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(
          data.cell.raw,
          data.cell.x + data.cell.width / 2,
          data.cell.y + data.cell.height / 2 + 2,
          { align: 'center' }
        );
      }
    },
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY || yPos + 50;
  
  if (finalY < pageHeight - 40) {
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'This is a computer-generated document. No signature is required.',
      pageWidth / 2,
      pageHeight - 25,
      { align: 'center' }
    );
    
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page 1 | CyberSecure Financial Report | ${new Date().getFullYear()}`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
  }

  return doc;
};
