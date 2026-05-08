import { google, sheets_v4 } from 'googleapis';
import { IOrder } from '../models/Order';

const SHEET_RANGE = 'Orders!A:N';
let hasLoggedConfigWarning = false;

const getSheetsConfig = () => {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!spreadsheetId || !clientEmail || !privateKey) {
    if (!hasLoggedConfigWarning) {
      console.warn('Google Sheets sync disabled: missing GOOGLE_SHEETS_* environment variables.');
      hasLoggedConfigWarning = true;
    }
    return null;
  }

  return { spreadsheetId, clientEmail, privateKey };
};

const getSheetsClient = (): { sheets: sheets_v4.Sheets; spreadsheetId: string } | null => {
  const cfg = getSheetsConfig();
  if (!cfg) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: cfg.clientEmail,
    key: cfg.privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return {
    sheets: google.sheets({ version: 'v4', auth }),
    spreadsheetId: cfg.spreadsheetId,
  };
};

const formatItemsSummary = (order: IOrder): string => {
  return order.items.map((item) => `${item.name} x${item.quantity}`).join(', ');
};

const buildRow = (order: IOrder): string[] => {
  const createdAt = order.createdAt ? new Date(order.createdAt).toISOString() : '';
  const updatedAt = order.updatedAt ? new Date(order.updatedAt).toISOString() : '';
  const paidAt = order.paidAt ? new Date(order.paidAt).toISOString() : '';

  return [
    updatedAt,
    order._id.toString(),
    order.tableId,
    order.customerName || '',
    order.customerPhone || '',
    order.status,
    order.paymentStatus || 'Pending',
    order.paymentMethod || '',
    String(order.totalAmount),
    JSON.stringify(order.items || []),
    formatItemsSummary(order),
    createdAt,
    paidAt,
    order.paymentId || '',
  ];
};

const ensureHeaders = async (sheets: sheets_v4.Sheets, spreadsheetId: string) => {
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Orders!A1:N1',
  });

  const existing = headerRes.data.values?.[0];
  if (existing && existing.length > 0) {
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Orders!A1:N1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        'UpdatedAt',
        'OrderId',
        'TableId',
        'CustomerName',
        'CustomerPhone',
        'Status',
        'PaymentStatus',
        'PaymentMethod',
        'TotalAmount',
        'ItemsJson',
        'ItemsSummary',
        'CreatedAt',
        'PaidAt',
        'PaymentId',
      ]],
    },
  });
};

export const syncOrderToGoogleSheet = async (order: IOrder) => {
  const client = getSheetsClient();
  if (!client) {
    return;
  }

  const { sheets, spreadsheetId } = client;

  try {
    await ensureHeaders(sheets, spreadsheetId);

    const valuesRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: SHEET_RANGE,
    });

    const rows = valuesRes.data.values || [];
    const orderId = order._id.toString();

    // Row 1 is headers, so actual data starts from row index 2.
    const existingIndex = rows.findIndex((row, index) => index > 0 && row[1] === orderId);
    const rowPayload = [buildRow(order)];

    if (existingIndex >= 0) {
      const rowNumber = existingIndex + 1;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Orders!A${rowNumber}:N${rowNumber}`,
        valueInputOption: 'RAW',
        requestBody: { values: rowPayload },
      });
      return;
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Orders!A:N',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: rowPayload },
    });
  } catch (error) {
    console.error('Failed to sync order to Google Sheets:', error);
  }
};
