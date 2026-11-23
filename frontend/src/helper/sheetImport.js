export function importContent(matrix, useHeaders = true) {
  const values = matrix.map((row) => Array.from(row, (cell) => String(cell ?? '')));
  while (values.length && values[values.length - 1].every((cell) => !cell.trim())) values.pop();
  if (!values.length) throw new Error('The selected worksheet is empty.');
  const width = Math.max(...values.map((row) => row.length));
  if (width > 50) throw new Error('Import supports up to 50 data columns.');
  const heading = useHeaders ? values.shift() : [];
  if (values.length > 200) throw new Error('Import supports up to 200 data rows.');
  const columns = Math.max(3, width);
  const headers = ['Tasks', ...Array.from({ length: columns }, (_, index) => (heading[index] || '').trim() || `Column Field ${index + 1}`)];
  if (headers.some((header) => header.length > 255)) throw new Error('Column names must be 255 characters or fewer.');
  const rows = (values.length ? values : [[]]).map((row) => [
    { value: '', rowId: globalThis.crypto?.randomUUID?.() || `row-${Date.now()}-${Math.random().toString(36).slice(2)}` },
    ...Array.from({ length: columns }, (_, index) => ({ value: row[index] || '' })),
  ]);
  if (rows.some((row) => row.some((cell) => cell.value.length > 2000))) throw new Error('Cell values must be 2,000 characters or fewer.');
  return { headers, rows };
}
