import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';
import QRCode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';
import * as Baileys from '@whiskeysockets/baileys';

const makeWASocket = Baileys.default || Baileys.makeWASocket;
const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = Baileys;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const SESSION_DIR = path.join(__dirname, 'session');

// Express App Setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global State
let sock = null;
let isConnected = false;
let latestQrRaw = null;
let latestQrDataUrl = null;
let connectedUser = null;
let connectionLogs = [];

function log(msg) {
  const ts = new Date().toLocaleTimeString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  connectionLogs.unshift(line);
  if (connectionLogs.length > 50) connectionLogs.pop();
}

/**
 * Normalizes phone numbers for WhatsApp JID
 * e.g., 0756693358 -> 94756693358@s.whatsapp.net
 * e.g., +94 75 669 3358 -> 94756693358@s.whatsapp.net
 */
function normalizeToJid(phoneStr) {
  if (!phoneStr) return null;
  let digits = String(phoneStr).replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '94' + digits.slice(1);
  } else if (!digits.startsWith('94') && digits.length === 9) {
    digits = '94' + digits;
  }
  return `${digits}@s.whatsapp.net`;
}

/**
 * Connect to WhatsApp using Baileys
 */
async function connectToWhatsApp() {
  try {
    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion().catch(() => ({
      version: [2, 3000, 1015901307],
      isLatest: true,
    }));

    log(`Initializing Baileys v${version.join('.')} (latest: ${isLatest})...`);

    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      auth: state,
      printQRInTerminal: false,
      browser: ['DWstore.lk Server', 'Chrome', '124.0.0.0'],
      syncFullHistory: false,
      generateHighQualityLinkPreview: true,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        latestQrRaw = qr;
        try {
          latestQrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 7 });
        } catch (e) {
          log(`Failed to generate QR data URL: ${e.message}`);
        }

        console.log('\n=============================================================');
        console.log('📲 SCAN THIS QR CODE WITH YOUR WHATSAPP BUSINESS PHONE:');
        console.log('   WhatsApp -> Settings -> Linked Devices -> Link a Device');
        console.log('   Or open in browser: http://localhost:' + PORT);
        console.log('=============================================================');
        qrcodeTerminal.generate(qr, { small: true });
        console.log('=============================================================\n');
      }

      if (connection === 'open') {
        isConnected = true;
        latestQrRaw = null;
        latestQrDataUrl = null;
        connectedUser = sock.user;
        const cleanUserPhone = connectedUser?.id?.split(':')[0] || 'Unknown';
        log(`WhatsApp Connected Successfully! Account: +${cleanUserPhone}`);
      }

      if (connection === 'close') {
        isConnected = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        log(`Connection closed (status: ${statusCode}). Reconnect: ${shouldReconnect}`);

        if (statusCode === DisconnectReason.loggedOut) {
          log('Logged out of WhatsApp. Cleaning up session credentials...');
          try {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
          } catch (e) {}
          setTimeout(connectToWhatsApp, 2000);
        } else {
          log('Reconnecting in 5 seconds...');
          setTimeout(connectToWhatsApp, 5000);
        }
      }
    });

    sock.ev.on('messages.upsert', async () => {
      // Passive handler - gateway only sends outgoing order notifications
    });
  } catch (err) {
    log(`Fatal initialization error: ${err.message}`);
    setTimeout(connectToWhatsApp, 8000);
  }
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

/**
 * Status endpoint (JSON)
 */
app.get('/status', (req, res) => {
  const userPhone = connectedUser?.id ? connectedUser.id.split(':')[0] : null;
  res.json({
    status: isConnected ? 'connected' : latestQrRaw ? 'waiting_for_qr' : 'disconnected',
    isConnected,
    phone: userPhone,
    hasQr: !!latestQrDataUrl,
    qr: latestQrDataUrl,
    timestamp: new Date().toISOString(),
  });
});

/**
 * QR Code endpoint (Raw or HTML)
 */
app.get('/qr', (req, res) => {
  if (isConnected) {
    return res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h2>WhatsApp is Already Connected!</h2>
        <p>Linked Account: +${connectedUser?.id?.split(':')[0] || ''}</p>
        <a href="/">Go to Dashboard</a>
      </div>
    `);
  }
  if (!latestQrDataUrl) {
    return res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h2>Waiting for QR code...</h2>
        <p>Please wait 3-5 seconds and refresh this page.</p>
        <script>setTimeout(() => location.reload(), 3000);</script>
      </div>
    `);
  }
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 40px;">
      <h2>Scan with WhatsApp</h2>
      <img src="${latestQrDataUrl}" style="border: 2px solid #ccc; border-radius: 8px; width: 300px; height: 300px;" />
      <p>Settings &gt; Linked Devices &gt; Link a Device</p>
      <script>
        setInterval(async () => {
          const r = await fetch('/status');
          const d = await r.json();
          if (d.isConnected) window.location.href = '/';
        }, 2500);
      </script>
    </div>
  `);
});

/**
 * Send Message Endpoint (Called by Storefront POST /api/orders)
 * Body: { phone, number, message, text }
 */
app.post('/send', async (req, res) => {
  const phone = req.body.phone || req.body.number || req.body.to;
  const message = req.body.message || req.body.text;

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: phone/number and message/text are required.',
    });
  }

  if (!isConnected || !sock) {
    return res.status(503).json({
      success: false,
      error: 'WhatsApp gateway is not connected. Please scan the QR code first at http://localhost:' + PORT,
    });
  }

  const jid = normalizeToJid(phone);
  if (!jid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid phone number format.',
    });
  }

  try {
    log(`Sending WhatsApp message to ${jid}...`);
    const sent = await sock.sendMessage(jid, { text: String(message) });

    log(`Message sent successfully to ${jid} (ID: ${sent.key.id})`);
    return res.json({
      success: true,
      messageId: sent.key.id,
      to: jid.replace('@s.whatsapp.net', ''),
      timestamp: sent.messageTimestamp,
    });
  } catch (err) {
    log(`Failed to send WhatsApp message to ${jid}: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * Logout Endpoint (Clear session)
 */
app.post('/logout', async (req, res) => {
  try {
    if (sock) {
      await sock.logout().catch(() => {});
    }
    fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    isConnected = false;
    latestQrRaw = null;
    latestQrDataUrl = null;
    connectedUser = null;
    log('Manual logout completed. Restarting Baileys...');
    setTimeout(connectToWhatsApp, 1500);
    res.json({ success: true, message: 'Logged out successfully. Please refresh to scan new QR.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * Web Dashboard UI (GET /)
 */
app.get('/', (req, res) => {
  const userPhone = connectedUser?.id ? connectedUser.id.split(':')[0] : null;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DWstore.lk - WhatsApp Gateway</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .card { background: #1e293b; border-radius: 16px; border: 1px solid #334155; width: 100%; max-width: 680px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
    .logo-badge { display: flex; align-items: center; gap: 12px; }
    .brand { font-size: 20px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px; }
    .subtitle { font-size: 13px; color: #94a3b8; }
    .badge { padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
    .badge-connected { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
    .badge-qr { background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); }
    .badge-disconnected { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot-green { background: #4ade80; box-shadow: 0 0 8px #4ade80; }
    .dot-yellow { background: #facc15; box-shadow: 0 0 8px #facc15; }
    .dot-red { background: #f87171; }
    
    .qr-container { text-align: center; padding: 24px 0; background: #0f172a; border-radius: 12px; margin-bottom: 24px; border: 1px dashed #475569; }
    .qr-image { width: 260px; height: 260px; border-radius: 8px; background: white; padding: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); }
    .steps { margin-top: 16px; font-size: 13px; color: #cbd5e1; line-height: 1.6; }
    
    .connected-box { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .connected-phone { font-size: 22px; font-weight: 700; color: #4ade80; margin: 8px 0; letter-spacing: 0.5px; }
    
    .test-box { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .test-title { font-size: 14px; font-weight: 700; color: #e2e8f0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px; font-weight: 600; }
    .input { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: white; font-size: 14px; outline: none; }
    .input:focus { border-color: #38bdf8; }
    .btn { background: #2563eb; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: 0.2s; }
    .btn:hover { background: #1d4ed8; }
    .btn-danger { background: #dc2626; }
    .btn-danger:hover { background: #b91c1c; }
    
    .logs-box { background: #020617; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11px; color: #64748b; max-height: 120px; overflow-y: auto; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-badge">
        <div>
          <div class="brand">DWstore.lk</div>
          <div class="subtitle">Self-Hosted WhatsApp Business Gateway</div>
        </div>
      </div>
      <div>
        ${
          isConnected
            ? `<div class="badge badge-connected"><span class="dot dot-green"></span> CONNECTED</div>`
            : latestQrDataUrl
            ? `<div class="badge badge-qr"><span class="dot dot-yellow"></span> WAITING FOR SCAN</div>`
            : `<div class="badge badge-disconnected"><span class="dot dot-red"></span> INITIALIZING</div>`
        }
      </div>
    </div>

    ${
      isConnected
        ? `
        <div class="connected-box">
          <div style="font-size: 13px; color: #86efac; font-weight: 600;">ACTIVE WHATSAPP CONNECTION</div>
          <div class="connected-phone">+${userPhone || '94 75 669 3358'}</div>
          <p style="font-size: 13px; color: #94a3b8; margin-bottom: 16px;">
            Order notifications will be sent automatically from this WhatsApp account.
          </p>
          <button class="btn btn-danger" onclick="logoutWhatsApp()" style="font-size: 12px; padding: 6px 14px;">Disconnect / Switch Account</button>
        </div>
        `
        : latestQrDataUrl
        ? `
        <div class="qr-container">
          <img src="${latestQrDataUrl}" class="qr-image" alt="WhatsApp QR Code" />
          <div class="steps">
            <strong>Scan to Connect WhatsApp Business:</strong><br>
            1. Open WhatsApp on phone (<b>+94 75 669 3358</b>)<br>
            2. Tap <b>Settings &gt; Linked Devices &gt; Link a Device</b><br>
            3. Point your camera at this QR code.
          </div>
        </div>
        `
        : `
        <div class="qr-container">
          <p style="color: #94a3b8; font-size: 14px;">Generating secure WhatsApp QR session... Please wait.</p>
        </div>
        `
    }

    <!-- Live Test Message Form -->
    <div class="test-box">
      <div class="test-title">
        <span>✉️ Test WhatsApp Notification</span>
      </div>
      <div class="form-group">
        <label>Recipient WhatsApp Number (e.g. 0756693358 or +94756693358)</label>
        <input id="testPhone" class="input" placeholder="0756693358" value="${userPhone || '0756693358'}" />
      </div>
      <div class="form-group">
        <label>Test Message</label>
        <input id="testMsg" class="input" value="Hello! This is a test message from DWstore.lk WhatsApp Gateway." />
      </div>
      <button class="btn" onclick="sendTestMessage()" ${!isConnected ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
        Send Test WhatsApp
      </button>
      <span id="testResult" style="margin-left: 12px; font-size: 13px;"></span>
    </div>

    <!-- Recent Logs -->
    <div class="logs-box" id="logs">
      ${connectionLogs.map((l) => `<div>${l}</div>`).join('')}
    </div>
  </div>

  <script>
    // Auto-refresh when state changes (e.g. user scans QR)
    let currentConnected = ${isConnected};
    setInterval(async () => {
      try {
        const res = await fetch('/status');
        const data = await res.json();
        if (data.isConnected !== currentConnected) {
          window.location.reload();
        }
      } catch (e) {}
    }, 2000);

    async function sendTestMessage() {
      const phone = document.getElementById('testPhone').value;
      const message = document.getElementById('testMsg').value;
      const resSpan = document.getElementById('testResult');
      resSpan.innerHTML = '<span style="color:#38bdf8;">Sending...</span>';

      try {
        const res = await fetch('/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, message })
        });
        const data = await res.json();
        if (data.success) {
          resSpan.innerHTML = '<span style="color:#4ade80;">✓ Message Sent! (ID: ' + data.messageId + ')</span>';
        } else {
          resSpan.innerHTML = '<span style="color:#f87171;">✕ Error: ' + (data.error || 'Failed') + '</span>';
        }
      } catch (e) {
        resSpan.innerHTML = '<span style="color:#f87171;">✕ Network Error: ' + e.message + '</span>';
      }
    }

    async function logoutWhatsApp() {
      if (!confirm('Are you sure you want to disconnect this WhatsApp account?')) return;
      try {
        await fetch('/logout', { method: 'POST' });
        window.location.reload();
      } catch (e) {
        alert('Logout error: ' + e.message);
      }
    }
  </script>
</body>
</html>
  `;

  res.send(html);
});

// Start Server & Connect
app.listen(PORT, () => {
  log(`DWstore.lk WhatsApp Gateway running on http://localhost:${PORT}`);
  connectToWhatsApp();
});
