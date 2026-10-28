import Order from '../models/Order';
import axios from 'axios';

// Optional Twilio and Nodemailer integrations. If credentials are not provided
// this module will just log the receipt data to the server console.

type SendOptions = {
  toPhone?: string;
  toEmail?: string;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const PUBLIC_URL = process.env.PUBLIC_URL || process.env.CLIENT_URL || 'http://localhost:3000';

export const sendReceipt = async (order: any, opts: SendOptions = {}) => {
  const { toPhone, toEmail } = opts;

  const feedbackUrl = `${PUBLIC_URL}/feedback?orderId=${order._id}`;

  const shortMessage = `Thank you for your order (${String(order._id).slice(-6)}) at our restaurant. Total: ₹${order.totalAmount.toFixed(2)}. View receipt: ${PUBLIC_URL}/order/${order._id}  Give feedback: ${feedbackUrl}`;

  const emailSubject = `Your receipt - Order ${String(order._id).slice(-6)}`;
  const emailHtml = `
    <h2>Thank you for your order!</h2>
    <p>Order ID: <strong>${order._id}</strong></p>
    <p>Table: ${order.tableId}</p>
    <p>Total: <strong>₹${order.totalAmount.toFixed(2)}</strong></p>
    <h3>Items</h3>
    <ul>
      ${order.items.map((i: any) => `<li>${i.name} x${i.quantity} — ₹${(i.price * i.quantity).toFixed(2)}</li>`).join('')}
    </ul>
    <p><a href="${PUBLIC_URL}/order/${order._id}">View full receipt</a></p>
    <p>Please leave feedback: <a href="${feedbackUrl}">Give Feedback</a></p>
  `;

  // Try Twilio SMS first if configured
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM && toPhone) {
    try {
      // lazy-load to avoid failing if package not installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: shortMessage,
        from: process.env.TWILIO_FROM,
        to: toPhone,
      });
      console.log('Receipt SMS sent via Twilio to', toPhone);
    } catch (err) {
      console.error('Failed to send SMS via Twilio:', getErrorMessage(err));
    }
  } else if (toPhone) {
    console.log('SMS not configured — would send to', toPhone, 'message:', shortMessage);
  }

  // Try email via SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && toEmail) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `no-reply@${process.env.SMTP_HOST}`,
        to: toEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log('Receipt email sent to', toEmail);
    } catch (err) {
      console.error('Failed to send email receipt:', getErrorMessage(err));
    }
  } else if (toEmail) {
    console.log('Email not configured — would send to', toEmail, 'subject:', emailSubject);
  }

  // Optionally, push a simple webhook / SMS fallback using a generic provider
  if (!toPhone && process.env.FALLBACK_RECEIVE_SMS) {
    try {
      await axios.post(process.env.FALLBACK_RECEIVE_SMS, { orderId: order._id, message: shortMessage });
    } catch (err) {
      // Ignore
    }
  }
};

export default { sendReceipt };
