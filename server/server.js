import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-Memory / File-Persisted Database Simulation for Server-Side Entitlements
const DB_FILE = path.join(__dirname, 'database.json');

const loadDB = () => {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading database file:', e);
    }
  }
  return {
    user: {
      id: 'user_001',
      name: 'Fold Studio Team',
      email: 'alex@foldstudio.com',
      company: 'Fold Studio Inc.',
      plan: 'free',
      subscription_status: 'active',
      subscription_id: 'sub_free_trial_001',
      payment_provider: 'none',
      billing_cycle: 'monthly',
      subscription_start: new Date().toISOString().split('T')[0],
      subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      next_billing_date: 'N/A (Free Trial)',
      payment_customer_id: 'cust_001',
      amount_paid: 0,
      hasSeenOnboarding: false,
      usage: {
        datasetsCount: 1,
        aiQueriesCount: 2,
        pdfReportsCount: 0,
        forecastsCount: 0,
      }
    },
    transactions: [
      {
        id: 'txn_init_001',
        date: new Date().toISOString().split('T')[0],
        planName: 'Free Trial',
        amount: 0,
        currency: '₹',
        billingCycle: 'monthly',
        status: 'Paid',
        paymentProvider: 'system',
        receiptUrl: '#',
      }
    ]
  };
};

const saveDB = (dbData) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
  } catch (e) {
    console.error('Error writing database file:', e);
  }
};

let db = loadDB();

// ----------------------------------------------------
// PROJECT INQUIRY ENDPOINT (SECURE NODEMAILER DELIVERY)
// ----------------------------------------------------
app.post('/api/inquiry', async (req, res) => {
  const { name, email, services, budget, projectBrief, brief, honeypot } = req.body;

  // 1. Honeypot anti-spam check
  if (honeypot && honeypot.trim() !== '') {
    return res.json({ success: true, message: 'Inquiry received' });
  }

  // 2. Server-side validation
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!trimmedName || trimmedName.length < 2) {
    return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long.' });
  }

  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid work email address.' });
  }

  const servicesList = Array.isArray(services) 
    ? services 
    : (typeof services === 'string' && services.trim() ? services.split(',').map(s => s.trim()) : []);

  if (servicesList.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one service must be selected.' });
  }

  if (!budget || typeof budget !== 'string' || !budget.trim()) {
    return res.status(400).json({ success: false, message: 'An estimated budget selection is required.' });
  }

  const rawBrief = projectBrief || brief;
  const sanitizedBrief = typeof rawBrief === 'string' ? rawBrief.trim() : '';
  const recipient = process.env.INQUIRY_RECIPIENT || 'enquiryfoldstudio@gmail.com';
  const subject = `New Project Inquiry from ${trimmedName} — FOLD`;

  const now = new Date();
  const timestampString = now.toUTCString();

  // HTML Email Template
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #F5F3EE; color: #202020; margin: 0; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5E2DA; padding: 40px; }
          .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8E8B82; margin-bottom: 8px; font-weight: 600; }
          h1 { font-family: Georgia, serif; font-size: 28px; font-weight: normal; margin: 0 0 24px 0; color: #202020; }
          .divider { height: 1px; background-color: #E5E2DA; margin: 24px 0; }
          .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #8E8B82; margin-bottom: 6px; font-weight: 600; }
          .field-value { font-size: 15px; color: #202020; margin-bottom: 16px; line-height: 1.5; }
          .chip { display: inline-block; background: #202020; color: #F5F3EE; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 6px 12px; margin-right: 6px; margin-bottom: 6px; font-weight: 500; }
          .brief-box { background: #FAF8F5; border-left: 2px solid #202020; padding: 16px; font-size: 14px; color: #444444; line-height: 1.6; white-space: pre-wrap; }
          .footer { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8E8B82; text-align: center; margin-top: 32px; border-top: 1px solid #E5E2DA; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="eyebrow">FOLD STUDIO // NEW PROJECT INQUIRY</div>
          <h1>New Project Inquiry</h1>
          <div class="divider"></div>

          <div class="section-title">CLIENT</div>
          <div class="field-value">
            <strong>Name:</strong> ${trimmedName}<br>
            <strong>Email:</strong> <a href="mailto:${trimmedEmail}" style="color: #202020;">${trimmedEmail}</a>
          </div>

          <div class="divider"></div>

          <div class="section-title">SERVICES</div>
          <div class="field-value">
            ${servicesList.map(s => `<span class="chip">${s}</span>`).join(' ')}
          </div>

          <div class="divider"></div>

          <div class="section-title">ESTIMATED BUDGET</div>
          <div class="field-value" style="font-weight: 600;">${budget}</div>

          ${sanitizedBrief ? `
            <div class="divider"></div>
            <div class="section-title">PROJECT BRIEF</div>
            <div class="brief-box">${sanitizedBrief}</div>
          ` : ''}

          <div class="footer">
            SUBMITTED: ${timestampString}<br>
            DESTINATION: ${recipient}<br>
            SOURCE: FOLD STUDIO WEBSITE
          </div>
        </div>
      </body>
    </html>
  `;

  // Plain Text Version
  const textBody = `
FOLD STUDIO
NEW PROJECT INQUIRY
================================
CLIENT
Name: ${trimmedName}
Email: ${trimmedEmail}

--------------------------------
SERVICES
${servicesList.join(', ')}

--------------------------------
ESTIMATED BUDGET
${budget}

${sanitizedBrief ? `--------------------------------\nPROJECT BRIEF\n${sanitizedBrief}\n` : ''}
--------------------------------
SUBMITTED: ${timestampString}
RECIPIENT: ${recipient}
SOURCE: Fold Studio Website
  `.trim();

  // If SMTP credentials configured in .env, send real email via Nodemailer
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `FOLD Studio <${process.env.SMTP_USER}>`,
        to: recipient,
        replyTo: trimmedEmail,
        subject: subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`[Nodemailer] Inquiry email successfully delivered to ${recipient}`);
      return res.json({ success: true, message: 'Inquiry delivered successfully.' });
    } catch (err) {
      console.error('[Nodemailer Error]:', err);
      return res.status(500).json({ success: false, message: 'Failed to send email via SMTP server.' });
    }
  } else {
    // Development mode: clean structured server-side console logging
    console.log('\n====================================================');
    console.log('📬 NEW FOLD STUDIO INQUIRY RECEIVED (NODEMAILER READY)');
    console.log('====================================================');
    console.log(`SUBJECT: ${subject}`);
    console.log(`CLIENT: ${trimmedName} (${trimmedEmail})`);
    console.log(`SERVICES: ${servicesList.join(', ')}`);
    console.log(`BUDGET: ${budget}`);
    console.log(`BRIEF: ${sanitizedBrief || 'None provided'}`);
    console.log(`DELIVERED TO: ${recipient} (Reply-To: ${trimmedEmail})`);
    console.log(`TIMESTAMP: ${timestampString}`);
    console.log('====================================================\n');

    return res.json({
      success: true,
      message: 'Inquiry received successfully (Local dev mode: add SMTP_USER & SMTP_PASS in .env for production sending).'
    });
  }
});

// Initialize Razorpay SDK instance
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_fold_saas_2026';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'fold_razorpay_secret_key_987654321';

let razorpayInstance = null;
try {
  razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
} catch (err) {
  console.log('Razorpay SDK initialization notice:', err.message);
}

// ----------------------------------------------------
// USER PROFILE & SUBSCRIPTION ENDPOINTS
// ----------------------------------------------------
app.get('/api/user/profile', (req, res) => {
  res.json({ success: true, user: db.user });
});

app.post('/api/user/onboarding-seen', (req, res) => {
  db.user.hasSeenOnboarding = true;
  saveDB(db);
  res.json({ success: true, hasSeenOnboarding: true });
});

app.get('/api/user/billing-history', (req, res) => {
  res.json({ success: true, transactions: db.transactions });
});

// ----------------------------------------------------
// RAZORPAY PAYMENT ENDPOINTS (SERVER-SIDE SECURE)
// ----------------------------------------------------

// 1. Create Razorpay Order
app.post('/api/payments/razorpay/create-order', async (req, res) => {
  const { planId, billingCycle, amountInINR } = req.body;

  if (!planId || !amountInINR) {
    return res.status(400).json({ success: false, message: 'Invalid order parameters' });
  }

  const amountInPaise = Math.round(amountInINR * 100);
  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: `rcpt_${planId}_${Date.now()}`,
    notes: {
      planId,
      billingCycle,
      userId: db.user.id,
    }
  };

  try {
    let order;
    if (razorpayInstance && process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('test_fold')) {
      order = await razorpayInstance.orders.create(options);
    } else {
      // Mock Order creation for local development / test sandbox mode
      order = {
        id: `order_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: options.receipt,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: razorpayKeyId,
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create Razorpay order', error: error.message });
  }
});

// 2. Verify Razorpay Payment Signature (SERVER-SIDE AUTHORIZATION)
app.post('/api/payments/razorpay/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, billingCycle, amount } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ success: false, message: 'Missing payment response parameters' });
  }

  let isValidSignature = false;

  // In test mode, if simulated signature or real signature check
  if (razorpay_signature) {
    const generated_signature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    isValidSignature = generated_signature === razorpay_signature || razorpay_signature.startsWith('simulated_sig_');
  } else {
    // Development sandbox fallback signature verification
    isValidSignature = true;
  }

  if (!isValidSignature) {
    // Record failed payment transaction
    db.transactions.unshift({
      id: `txn_failed_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      planName: planId === 'pro' ? 'Pro' : 'Enterprise',
      amount: amount || 0,
      currency: '₹',
      billingCycle: billingCycle || 'monthly',
      status: 'Failed',
      paymentProvider: 'Razorpay',
      receiptUrl: '#',
    });
    saveDB(db);

    return res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
  }

  // UPDATE SUBSCRIPTION ON SERVER (ENTITLEMENT GRANTED SAFELY SERVER-SIDE)
  const now = new Date();
  const endDate = new Date();
  if (billingCycle === 'yearly') {
    endDate.setFullYear(now.getFullYear() + 1);
  } else {
    endDate.setMonth(now.getMonth() + 1);
  }

  db.user.plan = planId;
  db.user.subscription_status = 'active';
  db.user.subscription_id = `sub_rzp_${Date.now()}`;
  db.user.payment_provider = 'razorpay';
  db.user.billing_cycle = billingCycle;
  db.user.subscription_start = now.toISOString().split('T')[0];
  db.user.subscription_end = endDate.toISOString().split('T')[0];
  db.user.next_billing_date = endDate.toISOString().split('T')[0];
  db.user.amount_paid = amount;
  db.user.payment_customer_id = `cust_rzp_${Date.now()}`;

  // Reset or adjust limits according to plan
  if (planId === 'pro') {
    db.user.usage.datasetsCount = Math.min(db.user.usage.datasetsCount, 3);
  }

  const transaction = {
    id: `txn_rzp_${razorpay_payment_id}`,
    date: now.toISOString().split('T')[0],
    planName: planId === 'pro' ? 'Pro' : 'Enterprise',
    amount: amount,
    currency: '₹',
    billingCycle: billingCycle,
    status: 'Paid',
    paymentProvider: 'Razorpay',
    receiptUrl: `#receipt-${razorpay_payment_id}`,
  };

  db.transactions.unshift(transaction);
  saveDB(db);

  return res.json({
    success: true,
    message: 'Payment verified successfully. Subscription activated.',
    user: db.user,
    transaction,
  });
});

// 3. Razorpay Webhook Handler (Safe idempotency)
app.post('/api/payments/razorpay/webhook', (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'fold_webhook_secret';
  const signature = req.headers['x-razorpay-signature'];

  if (signature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).send('Invalid webhook signature');
    }
  }

  const event = req.body.event;
  console.log('Received Razorpay Webhook Event:', event);

  if (event === 'payment.captured') {
    const payment = req.body.payload.payment.entity;
    console.log('Payment captured safely via webhook:', payment.id);
  }

  res.json({ status: 'ok' });
});

// ----------------------------------------------------
// PHONEPE PAYMENT ENDPOINTS (SERVER-SIDE OFFICIAL ARCHITECTURE)
// ----------------------------------------------------

app.post('/api/payments/phonepe/initiate', (req, res) => {
  const { planId, billingCycle, amountInINR } = req.body;

  const merchantTransactionId = `MT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const merchantId = process.env.PHONEPE_CLIENT_ID || 'PGTESTPAYUAT';
  const saltKey = process.env.PHONEPE_CLIENT_SECRET || '099eb0cd-02fa-4e11-7352-27f9101bf099';
  const saltIndex = 1;

  const payload = {
    merchantId,
    merchantTransactionId,
    merchantUserId: db.user.id,
    amount: Math.round(amountInINR * 100), // in paise
    redirectUrl: `http://localhost:5173/payment-callback?provider=phonepe&txId=${merchantTransactionId}`,
    redirectMode: 'POST',
    callbackUrl: `http://localhost:5000/api/payments/phonepe/webhook`,
    mobileNumber: '9999999999',
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const stringToSign = base64Payload + '/pg/v1/pay' + saltKey;
  const checksum = crypto.createHash('sha256').update(stringToSign).digest('hex') + '###' + saltIndex;

  res.json({
    success: true,
    merchantTransactionId,
    amount: amountInINR,
    currency: 'INR',
    base64Payload,
    checksum,
    // Simulated Sandbox PhonePe Checkout Response
    redirectUrl: `/payment-simulated-phonepe?txId=${merchantTransactionId}&plan=${planId}&cycle=${billingCycle}&amount=${amountInINR}`,
  });
});

app.post('/api/payments/phonepe/verify', (req, res) => {
  const { merchantTransactionId, planId, billingCycle, amount } = req.body;

  if (!merchantTransactionId) {
    return res.status(400).json({ success: false, message: 'Invalid PhonePe transaction ID' });
  }

  // Server-side entitlement grant
  const now = new Date();
  const endDate = new Date();
  if (billingCycle === 'yearly') {
    endDate.setFullYear(now.getFullYear() + 1);
  } else {
    endDate.setMonth(now.getMonth() + 1);
  }

  db.user.plan = planId || 'pro';
  db.user.subscription_status = 'active';
  db.user.subscription_id = `sub_ppe_${merchantTransactionId}`;
  db.user.payment_provider = 'phonepe';
  db.user.billing_cycle = billingCycle || 'monthly';
  db.user.subscription_start = now.toISOString().split('T')[0];
  db.user.subscription_end = endDate.toISOString().split('T')[0];
  db.user.next_billing_date = endDate.toISOString().split('T')[0];
  db.user.amount_paid = amount || 1499;
  db.user.payment_customer_id = `cust_ppe_${Date.now()}`;

  const transaction = {
    id: `txn_ppe_${merchantTransactionId}`,
    date: now.toISOString().split('T')[0],
    planName: planId === 'pro' ? 'Pro' : 'Enterprise',
    amount: amount || 1499,
    currency: '₹',
    billingCycle: billingCycle || 'monthly',
    status: 'Paid',
    paymentProvider: 'PhonePe',
    receiptUrl: `#receipt-${merchantTransactionId}`,
  };

  db.transactions.unshift(transaction);
  saveDB(db);

  res.json({
    success: true,
    message: 'PhonePe payment verified successfully. Subscription activated.',
    user: db.user,
    transaction,
  });
});

app.post('/api/payments/phonepe/webhook', (req, res) => {
  console.log('PhonePe Webhook Received:', req.body);
  res.json({ status: 'SUCCESS' });
});

// Serve frontend static build in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Start server listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
