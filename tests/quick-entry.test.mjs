import test from 'node:test';
import assert from 'node:assert/strict';
import {parseQuickEntry} from '../src/quick-entry.mjs';

test('cash notes preserve direction, exact amount and item quantities', () => {
  for (const [note, currency, type, amount, description] of [
    ['Sold a bag of garri 200', 'XAF', 'sale', '200', 'a bag of garri'],
    ['Sold 2 bags of rice for 90k', 'XAF', 'sale', '90000', '2 bags of rice'],
    ['Musa paid 150,000 for the consultation', 'XAF', 'sale', '150000', 'Musa · the consultation'],
    ['I paid 8k for fuel', 'XAF', 'expense', '8000', 'fuel'],
    ['Spent FCFA 750 on delivery', 'XAF', 'expense', '750', 'delivery'],
    ['Received 1.23456k USD for services', 'USD', 'sale', '1234.56', 'services'],
  ]) assert.deepEqual(parseQuickEntry(note, currency), {type, amount, description});
});

test('ambiguous, unpaid or invalid amounts do not become drafts', () => {
  for (const note of ['Paid for fuel', 'Sold rice for USD 20', 'Sold rice for -200',
    'Sold rice for 1,20', 'Sold rice for 1.50', 'Sold rice for 0', 'Sold rice for 500 each',
    'Sold rice on credit for 1500', 'Sold rice for 500 yesterday', 'Sold rice 500 and oil 200',
    'Sold rice 2 at 500', 'Received 1000 for invoice INV-1']) {
    assert.throws(() => parseQuickEntry(note, 'XAF'), Error, note);
  }
});
