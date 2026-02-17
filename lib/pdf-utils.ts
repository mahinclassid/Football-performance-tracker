import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function downloadReportAsPDF(elementId: string, fileName: string) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Report element not found');
    }

    // Create canvas from the HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    // Calculate dimensions
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'A4');
    let position = 0;

    // Add images to PDF (handle multiple pages if needed)
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
