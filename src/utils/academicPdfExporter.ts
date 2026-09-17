import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PdfExportOptions {
  filename: string;
  title?: string;
  onProgress?: (status: string) => void;
}

/**
 * Exports a DOM element or a list of page elements to a multi-page A4 PDF file.
 * If the element contains children with the class `.academic-pdf-page`, each child
 * is rendered as an independent A4 page, preventing text cutoffs across pages.
 */
export async function exportAcademicDocumentToPdf(
  containerElement: HTMLElement,
  options: PdfExportOptions
): Promise<void> {
  const { filename, onProgress } = options;

  onProgress?.("Preparando documento formal...");

  // Find page containers if structured as discrete pages
  const pageElements = containerElement.querySelectorAll<HTMLElement>(".academic-pdf-page");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pdfWidth = 210; // A4 width in mm
  const pdfHeight = 297; // A4 height in mm

  if (pageElements.length > 0) {
    // Process each discrete page container
    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];
      onProgress?.(`Generando página ${i + 1} de ${pageElements.length}...`);

      const canvas = await html2canvas(pageEl, {
        scale: 2, // 2x scale for sharp academic typography
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }

      // Add image filling the page margins
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    }
  } else {
    // Continuous element rendering with proportional vertical slicing
    onProgress?.("Procesando documento continuo...");
    const canvas = await html2canvas(containerElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 800,
    });

    const imgWidth = pdfWidth;
    const pageCanvasHeight = (canvas.width * pdfHeight) / pdfWidth;
    let heightLeft = canvas.height;
    let position = 0;

    let pageIndex = 0;
    while (heightLeft > 0) {
      if (pageIndex > 0) {
        pdf.addPage("a4", "portrait");
      }

      // Create a slice canvas for this specific page
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.min(pageCanvasHeight, heightLeft);

      const ctx = sliceCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          position,
          canvas.width,
          sliceCanvas.height,
          0,
          0,
          canvas.width,
          sliceCanvas.height
        );

        const sliceImgData = sliceCanvas.toDataURL("image/jpeg", 0.95);
        const sliceMmHeight = (sliceCanvas.height * pdfWidth) / canvas.width;
        pdf.addImage(sliceImgData, "JPEG", 0, 0, imgWidth, sliceMmHeight, undefined, "FAST");
      }

      position += pageCanvasHeight;
      heightLeft -= pageCanvasHeight;
      pageIndex++;
    }
  }

  onProgress?.("Descargando archivo PDF...");
  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  pdf.save(cleanFilename);
  onProgress?.("¡Completado!");
}

/**
 * Triggers standard browser print dialog for academic printables.
 */
export function printAcademicDocument(): void {
  window.print();
}
