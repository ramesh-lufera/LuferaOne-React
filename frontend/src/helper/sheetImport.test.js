/* global test, expect */
import { read, write, utils } from 'xlsx';
import { importContent } from './sheetImport';

test('CSV imports quoted fields, newlines and leading zeroes without hiding the first data column', () => {
  const book = read('Name,Code,Notes\r\n"Alice, Smith",0012,"Line 1\nLine 2"', { type: 'string', raw: true });
  const result = importContent(utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, raw: false, defval: '' }));
  expect(result.headers).toEqual(['Tasks', 'Name', 'Code', 'Notes']);
  expect(result.rows[0].map((cell) => cell.value)).toEqual(['', 'Alice, Smith', '0012', 'Line 1\nLine 2']);
  expect(result.rows[0][0].rowId).toBeTruthy();
});

test.each(['xlsx', 'biff8'])('imports a real %s workbook with multiple columns', (bookType) => {
  const book = utils.book_new();
  utils.book_append_sheet(book, utils.aoa_to_sheet([['Name', 'Amount', 'Status', 'Owner', 'Notes'], ['Budget', 123, 'Open', 'Alice', 'Ready']]), 'Budget');
  const loaded = read(write(book, { bookType, type: 'array' }), { type: 'array' });
  const result = importContent(utils.sheet_to_json(loaded.Sheets.Budget, { header: 1, raw: false, defval: '' }));
  expect(result.headers).toHaveLength(6);
  expect(result.rows[0][1].value).toBe('Budget');
  expect(result.rows[0][2].value).toBe('123');
});

test('imports files without a header row, pads columns, and rejects oversized content', () => {
  expect(importContent([['Alice']], false).rows[0][1].value).toBe('Alice');
  expect(importContent([['Name']], true).rows).toHaveLength(1);
  expect(() => importContent([])).toThrow('empty');
  expect(() => importContent([Array(51).fill('Column')])).toThrow('50 data columns');
  expect(() => importContent(Array.from({ length: 201 }, () => ['Value']), false)).toThrow('200 data rows');
  expect(() => importContent([['Column'], ['x'.repeat(2001)]])).toThrow('2,000');
});
