export type ExportCell = string | number | boolean | null | undefined;

export interface ExportColumn<T> {
  header: string;
  value: (row: T) => ExportCell;
}

export function downloadCsv<T>(filename: string, columns: ExportColumn<T>[], rows: T[]): void {
  const headerRow = columns.map((column) => escapeCsvCell(column.header)).join(',');
  const dataRows = rows.map((row) =>
    columns.map((column) => escapeCsvCell(column.value(row))).join(','),
  );

  downloadBlob(filename, ['\uFEFF', [headerRow, ...dataRows].join('\r\n')], 'text/csv;charset=utf-8');
}

export function downloadExcel<T>(
  filename: string,
  columns: ExportColumn<T>[],
  rows: T[],
  title: string,
): void {
  const headerCells = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join('');
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => `<td>${escapeHtml(formatCell(column.value(row)))}</td>`)
          .join('')}</tr>`,
    )
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(
    title,
  )}</title></head><body><h1>${escapeHtml(
    title,
  )}</h1><table border="1"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;

  downloadBlob(filename, [html], 'application/vnd.ms-excel;charset=utf-8');
}

export function downloadPdf(filename: string, title: string, lines: string[]): void {
  const wrappedLines = [title, '', ...lines].flatMap((line) => wrapText(toPdfSafeText(line), 96));
  const pages = chunk(wrappedLines.length > 0 ? wrappedLines : ['No records found.'], 44);
  const objects: string[] = [];
  const pageObjectNumbers = pages.map((_, index) => 3 + index * 2);
  const fontObjectNumber = 3 + pages.length * 2;

  objects[1] = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjectNumbers
    .map((objectNumber) => `${objectNumber} 0 R`)
    .join(' ')}] /Count ${pages.length} >>\nendobj\n`;

  pages.forEach((pageLines, index) => {
    const pageObjectNumber = pageObjectNumbers[index];
    const contentObjectNumber = pageObjectNumber + 1;
    const content = [
      'BT',
      '/F1 10 Tf',
      '48 744 Td',
      '14 TL',
      ...pageLines.map((line) => `(${escapePdfText(line)}) Tj T*`),
      'ET',
    ].join('\n');

    objects[pageObjectNumber] =
      `${pageObjectNumber} 0 obj\n` +
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>\n` +
      'endobj\n';
    objects[contentObjectNumber] =
      `${contentObjectNumber} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`;
  });

  objects[fontObjectNumber] =
    `${fontObjectNumber} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`;

  const pdf = buildPdf(objects);
  downloadBlob(filename, [pdf], 'application/pdf');
}

function downloadBlob(filename: string, parts: BlobPart[], type: string): void {
  const blob = new Blob(parts, { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: ExportCell): string {
  const text = formatCell(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatCell(value: ExportCell): string {
  return value === null || value === undefined ? '' : String(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toPdfSafeText(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, ' ');
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(value: string, maxLength: number): string[] {
  if (value.length <= maxLength) {
    return [value];
  }

  const lines: string[] = [];
  let remaining = value;

  while (remaining.length > maxLength) {
    const slice = remaining.slice(0, maxLength);
    const breakAt = slice.lastIndexOf(' ');
    const index = breakAt > 20 ? breakAt : maxLength;

    lines.push(remaining.slice(0, index).trimEnd());
    remaining = remaining.slice(index).trimStart();
  }

  if (remaining) {
    lines.push(remaining);
  }

  return lines;
}

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

function buildPdf(objects: string[]): string {
  let body = '%PDF-1.4\n';
  const offsets = [0];

  for (let index = 1; index < objects.length; index++) {
    offsets[index] = body.length;
    body += objects[index];
  }

  const xrefOffset = body.length;
  const xrefRows = offsets
    .map((offset, index) =>
      index === 0 ? '0000000000 65535 f ' : `${offset.toString().padStart(10, '0')} 00000 n `,
    )
    .join('\n');

  return `${body}xref\n0 ${objects.length}\n${xrefRows}\ntrailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
}
