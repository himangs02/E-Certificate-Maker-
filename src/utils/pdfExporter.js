import { jsPDF } from "jspdf";

/**
 * Downloads the canvas as a high-quality PNG or JPG image.
 */
export function downloadCanvasImage(canvas, filename = "certificate.png", format = "image/png", quality = 0.95) {
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL(format, quality);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports the canvas directly into a crisp A4 PDF document.
 * 
 * @param {HTMLCanvasElement} canvas - The source canvas
 * @param {string} filename - Filename for PDF output
 */
export function exportCanvasToPDF(canvas, filename = "certificate.pdf") {
  if (!canvas) return;

  const imgData = canvas.toDataURL("image/jpeg", 1.0);
  
  // A4 dimensions in mm (Portrait: 210 x 297 mm)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Add the canvas snapshot at full page
  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
  pdf.save(filename);
}
