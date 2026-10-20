/**
 * Turns a rendered document into an A4 PDF, entirely in the browser. Both libraries are loaded when the
 * first PDF is made, so neither is in the main bundle.
 *
 * The page is captured as a picture (so the web font and "₹" look exactly as on screen), then placed on
 * A4 portrait with margins. A document taller than one page is cut into page-high slices, one per page.
 */

/** A4 at 96 dpi. The capture target is rendered at this width on every device, so the PDF never varies. */
export const PDF_RENDER_WIDTH = 794;

const PAGE_MARGIN_MM = 10;
/** Twice the screen's pixels, so text stays sharp when the PDF is zoomed or printed. */
const PIXEL_RATIO = 2;

/** "SV/TI/2026-27/0001" → "SV-TI-2026-27-0001.pdf" */
function pdfFileName(number: string): string {
  return `${number.replace(/[\/]+/g, "-")}.pdf`;
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The captured page could not be read"));
    image.src = source;
  });
}

/**
 * The capture copies CSS onto HTML elements but not onto the shapes inside an SVG, whose colours come
 * from classes (`fill-brand-600`), so the property illustration came out as a black square. Writing the
 * computed colours onto the shapes as attributes fixes that. `node` is the off-screen copy, so nothing
 * on screen changes.
 */
function inlineSvgColours(node: HTMLElement) {
  for (const shape of node.querySelectorAll<SVGElement>("svg *")) {
    const style = getComputedStyle(shape);
    shape.setAttribute("fill", style.fill);
    shape.setAttribute("stroke", style.stroke);
    if (style.fillOpacity !== "1") shape.setAttribute("fill-opacity", style.fillOpacity);
  }
}

/** Captures `node` and saves it as `<number>.pdf`. Rejects if anything fails, so the caller can tell the user. */
export async function downloadDocumentPdf(node: HTMLElement, number: string): Promise<void> {
  const [{ toPng }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
  // The font must be ready before the page is drawn, or the picture falls back to a system font.
  await document.fonts.ready;
  inlineSvgColours(node);
  const dataUrl = await toPng(node, { pixelRatio: PIXEL_RATIO, backgroundColor: "white" });
  const image = await loadImage(dataUrl);

  // Compressed: without it jsPDF stores the picture as raw pixels, about 8 MB for one page.
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  const contentWidth = pdf.internal.pageSize.getWidth() - 2 * PAGE_MARGIN_MM;
  const contentHeight = pdf.internal.pageSize.getHeight() - 2 * PAGE_MARGIN_MM;
  const mmPerPixel = contentWidth / image.naturalWidth;
  const sliceHeight = Math.floor(contentHeight / mmPerPixel);

  if (image.naturalHeight <= sliceHeight) {
    pdf.addImage(
      dataUrl,
      "PNG",
      PAGE_MARGIN_MM,
      PAGE_MARGIN_MM,
      contentWidth,
      image.naturalHeight * mmPerPixel,
      undefined,
      "FAST",
    );
  } else {
    const canvas = window.document.createElement("canvas");
    canvas.width = image.naturalWidth;
    for (let top = 0, page = 0; top < image.naturalHeight; top += sliceHeight, page += 1) {
      const height = Math.min(sliceHeight, image.naturalHeight - top);
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("No canvas available");
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, height);
      context.drawImage(image, 0, top, image.naturalWidth, height, 0, 0, image.naturalWidth, height);
      if (page > 0) pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        PAGE_MARGIN_MM,
        PAGE_MARGIN_MM,
        contentWidth,
        height * mmPerPixel,
        undefined,
        "FAST",
      );
    }
  }
  pdf.save(pdfFileName(number));
}
