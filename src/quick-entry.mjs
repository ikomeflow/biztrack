import {amountText, CURRENCIES, toMinor} from '../dist/core-v2.mjs';

const codes = [...Object.keys(CURRENCIES), 'FCFA'].join('|');
const number = '(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?k?';
const cash = '(?:(?<before>' + codes + ') )?(?<number>' + number + ')(?: (?<after>' + codes + '))?';
const sold = new RegExp('^sold (?<item>.+?)(?: for | )' + cash + '$', 'i');
const payment = new RegExp('^(?<verb>paid|spent|received) ' + cash + ' (?:for|on) (?<item>.+)$', 'i');
const namedPayment = new RegExp("^(?<buyer>[\\p{L}][\\p{L}’'-]*(?: [\\p{L}][\\p{L}’'-]*){0,2}) paid " + cash + ' for (?<item>.+)$', 'iu');
const example = 'Use one sale or expense, like “Sold rice for 5,000” or “Paid 800 for fuel”.';

function expandAmount(raw) {
  const value = raw.replace(/,/g, '').toLowerCase();
  if (!value.endsWith('k')) return value;
  // Move the decimal point using the digits so money never passes through a float.
  const [whole, fraction = ''] = value.slice(0, -1).split('.');
  const units = whole + fraction.padEnd(3, '0').slice(0, 3);
  const remainder = fraction.slice(3).replace(/0+$/, '');
  return remainder ? units + '.' + remainder : units;
}

// Produce an editable draft only. The existing form handles explicit saving.
export function parseQuickEntry(input, currency) {
  const note = input.trim().replace(/\s+/g, ' ');
  if (!note || note.length > 160 || /[\n;]/.test(input)) throw Error(example);
  const requiresDetails = /\b(?:invoice|credit|owe[ds]?|unpaid|pending|due|each|per|yesterday|tomorrow|last|next|refund|not|never)\b|[€£$₦]|\d[/-]\d/i;
  if (requiresDetails.test(note)) throw Error('Use the regular form for dates, invoice payments or more detailed entries.');

  const fields = (sold.exec(note) || payment.exec(note) || namedPayment.exec(note))?.groups;
  if (!fields) throw Error(example);
  const {item, buyer, verb, before, after} = fields;
  // Allow a leading item quantity, but leave multiple prices or complex notes to manual entry.
  const itemWords = item.replace(/^\d+\s+/, '');
  if (!/\p{L}/u.test(itemWords) || /\d|[;:+−=]|^[-.,]|[-.,]$|\b(?:paid|received|sold|spent|for|at|plus|minus|less|total|thousand|million)\b/i.test(itemWords)) throw Error(example);
  if (before && after) throw Error(example);
  const code = (before || after || currency).toUpperCase();
  if (code !== currency && !(code === 'FCFA' && currency === 'XAF')) {
    throw Error('Use the selected currency or change the currency above.');
  }
  const type = /^(?:paid|spent)$/i.test(verb || '') || /^(?:i|we)$/i.test(buyer || '') ? 'expense' : 'sale';
  const minor = toMinor(expandAmount(fields.number), currency);
  const description = buyer && type === 'sale' ? buyer + ' · ' + item : item;
  return {type, amount: amountText(minor, currency, false), description};
}
