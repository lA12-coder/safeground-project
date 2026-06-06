export async function extractTextFromFile(
  file: File
): Promise<{ text: string; fileName: string }> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.txt')) {
    return { text: await file.text(), fileName: file.name };
  }

  if (fileName.endsWith('.pdf')) {
    return extractFromPdf(file);
  }

  if (fileName.endsWith('.docx')) {
    return extractFromDocx(file);
  }

  throw new Error(`Unsupported file type: ${file.name}. Use .txt, .pdf, or .docx`);
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const arr of arrays) totalLength += arr.length;
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

async function extractFromPdf(file: File): Promise<{ text: string; fileName: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = concatUint8Arrays([new Uint8Array(arrayBuffer)]);

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: unknown) => (item as { str?: string }).str ?? '')
      .filter(Boolean)
      .join(' ');
    pages.push(text);
  }

  return { text: pages.join('\n\n'), fileName: file.name };
}

async function extractFromDocx(file: File): Promise<{ text: string; fileName: string }> {
  const arrayBuffer = await file.arrayBuffer();

  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });

  return { text: result.value, fileName: file.name };
}
