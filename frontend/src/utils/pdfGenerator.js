import jsPDF from 'jspdf';

const COLORS = {
  primary: '#F59E0B',
  dark: '#1a1a1a',
  critical: '#DC2626',
  high: '#F97316',
  medium: '#FBBF24',
  low: '#3B82F6',
  info: '#6B7280',
};

const SEVERITY_COLORS = {
  critical: COLORS.critical,
  high: COLORS.high,
  medium: COLORS.medium,
  low: COLORS.low,
  info: COLORS.info,
};

export const generateProfessionalPDF = (scan) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  const addHeader = () => {
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setFontSize(20);
    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.text('CyberSecure', margin, 15);
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.setFont('helvetica', 'normal');
    doc.text('Security Scan Report', margin, 25);
  };

  const addFooter = (pageNum) => {
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Page ${pageNum} | ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  addHeader();
  doc.setFillColor(245, 158, 11);
  doc.rect(margin, 50, contentWidth, 80, 'F');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('SECURITY SCAN', pageWidth / 2, 75, { align: 'center' });
  doc.text('REPORT', pageWidth / 2, 90, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(scan.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }), pageWidth / 2, 110, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin, 150, contentWidth, 60, 3, 3, 'FD');
  doc.setFontSize(14);
  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin + 10, 165);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  const summaryLines = [
    `Target: ${scan.target}`,
    `Status: ${scan.status}`,
    `Total Vulnerabilities: ${scan.vulnerabilities?.length || 0}`,
    `Scan ID: #${scan.id}`
  ];
  
  summaryLines.forEach((line, i) => {
    doc.text(line, margin + 10, 180 + (i * 8));
  });

  addFooter(1);

  doc.addPage();
  addHeader();

  let yPos = 50;
  doc.setFontSize(16);
  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.text('Vulnerability Overview', margin, yPos);
  yPos += 15;

  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  scan.vulnerabilities?.forEach(v => {
    const sev = (v.severity || 'info').toLowerCase();
    if (severityCounts.hasOwnProperty(sev)) severityCounts[sev]++;
  });

  const severityData = [
    ['Critical', severityCounts.critical, SEVERITY_COLORS.critical],
    ['High', severityCounts.high, SEVERITY_COLORS.high],
    ['Medium', severityCounts.medium, SEVERITY_COLORS.medium],
    ['Low', severityCounts.low, SEVERITY_COLORS.low],
    ['Info', severityCounts.info, SEVERITY_COLORS.info],
  ];

  severityData.forEach(([label, count, color]) => {
    const rgb = color.match(/\w\w/g).map(x => parseInt(x, 16));
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.roundedRect(margin, yPos, 8, 8, 1, 1, 'F');
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin + 15, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(`${count} issue${count !== 1 ? 's' : ''}`, pageWidth - margin - 30, yPos + 6, { align: 'right' });
    yPos += 15;
  });

  yPos += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Assessment', margin, yPos);
  yPos += 10;

  const totalCriticalHigh = severityCounts.critical + severityCounts.high;
  let riskLevel = 'Low', riskColor = COLORS.low;
  if (totalCriticalHigh >= 5) { riskLevel = 'Critical'; riskColor = COLORS.critical; }
  else if (totalCriticalHigh >= 2) { riskLevel = 'High'; riskColor = COLORS.high; }
  else if (severityCounts.medium >= 3) { riskLevel = 'Medium'; riskColor = COLORS.medium; }

  const rgb = riskColor.match(/\w\w/g).map(x => parseInt(x, 16));
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`Overall Risk Level: ${riskLevel}`, pageWidth / 2, yPos + 16, { align: 'center' });

  addFooter(2);

  if (scan.vulnerabilities && scan.vulnerabilities.length > 0) {
    doc.addPage();
    addHeader();
    yPos = 50;
    doc.setFontSize(16);
    doc.setTextColor(26, 26, 26);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Findings', margin, yPos);
    yPos += 15;

    scan.vulnerabilities.forEach((vuln, index) => {
      if (yPos > pageHeight - 60) {
        addFooter(doc.internal.getNumberOfPages());
        doc.addPage();
        addHeader();
        yPos = 50;
      }

      const severity = (vuln.severity || 'info').toLowerCase();
      const severityColor = SEVERITY_COLORS[severity] || COLORS.info;
      const rgb = severityColor.match(/\w\w/g).map(x => parseInt(x, 16));

      const cardStartY = yPos;

      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.roundedRect(margin + 5, yPos + 5, 40, 8, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(severity.toUpperCase(), margin + 25, yPos + 10, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`#${index + 1}`, pageWidth - margin - 5, yPos + 10, { align: 'right' });

      yPos += 18;

      doc.setFontSize(12);
      doc.setTextColor(26, 26, 26);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(vuln.title || 'Untitled Vulnerability', contentWidth - 20);
      doc.text(titleLines, margin + 10, yPos);
      yPos += titleLines.length * 6 + 5;

      if (vuln.description) {
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(vuln.description, contentWidth - 20);
        doc.text(descLines.slice(0, 3), margin + 10, yPos);
        yPos += Math.min(descLines.length, 3) * 5 + 5;
      }

      const details = [];
      if (vuln.affected_url) details.push(['URL', vuln.affected_url]);
      if (vuln.param) details.push(['Parameter', vuln.param]);
      if (vuln.cwe_id) details.push(['CWE', `CWE-${vuln.cwe_id}`]);
      if (vuln.scanner_type) details.push(['Scanner', vuln.scanner_type]);
      if (vuln.ai_type) details.push(['AI Classification', `${vuln.ai_type} (${Math.round((vuln.ai_confidence || 0) * 100)}%)`]);

      if (details.length > 0) {
        doc.setFontSize(8);
        details.forEach(([label, value]) => {
          if (yPos > pageHeight - 60) {
            addFooter(doc.internal.getNumberOfPages());
            doc.addPage();
            addHeader();
            yPos = 50;
          }

          doc.setTextColor(107, 114, 128);
          doc.setFont('helvetica', 'bold');
          doc.text(`${label}:`, margin + 10, yPos);
          doc.setFont('helvetica', 'normal');
          const valueLines = doc.splitTextToSize(value, contentWidth - 50);
          doc.text(valueLines, margin + 40, yPos);
          yPos += Math.max(valueLines.length * 4, 5);
        });
      }

      if (vuln.solution) {
        yPos += 3;
        doc.setFontSize(9);
        doc.setTextColor(22, 163, 74);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommended Fix:', margin + 10, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        const solutionLines = doc.splitTextToSize(vuln.solution, contentWidth - 20);
        doc.text(solutionLines.slice(0, 2), margin + 10, yPos);
        yPos += Math.min(solutionLines.length, 2) * 5;
      }

      yPos += 10;
      const cardHeight = yPos - cardStartY;
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, cardStartY, contentWidth, cardHeight, 2, 2, 'S');

      yPos += 5;
    });

    addFooter(doc.internal.getNumberOfPages());
  } else {
    doc.addPage();
    addHeader();
    doc.setFontSize(14);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text('No vulnerabilities detected.', pageWidth / 2, 100, { align: 'center' });
    addFooter(3);
  }

  return doc;
};
