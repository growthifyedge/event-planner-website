import nodemailer from 'nodemailer';
import { formatDate } from './utils';
import { site } from '@/data/site';

const FROM = process.env.EMAIL_FROM || `${site.name} <${site.email}>`;

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE) === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

const wrap = (title, inner) => `
  <div style="margin:0;padding:32px 0;background:#f7f2e9;font-family:Georgia,'Times New Roman',serif;color:#121013;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #efe7d6;border-radius:16px;overflow:hidden;">
      <div style="background:#121013;padding:28px 32px;text-align:center;">
        <div style="font-size:24px;letter-spacing:6px;color:#c8a24a;font-weight:600;text-transform:uppercase;">${site.name}</div>
        <div style="font-size:10px;letter-spacing:4px;color:#e8d9be;text-transform:uppercase;margin-top:6px;">Events &amp; Experiences</div>
      </div>
      <div style="padding:32px;">
        <h1 style="font-size:22px;margin:0 0 18px;color:#121013;">${title}</h1>
        ${inner}
      </div>
      <div style="background:#faf6ee;padding:18px 32px;text-align:center;font-size:11px;color:#726c73;font-family:Arial,sans-serif;">
        ${site.legalName} · ${site.address.line1}, ${site.address.line2}
      </div>
    </div>
  </div>`;

const row = (label, value) => `
  <tr>
    <td style="padding:9px 0;border-bottom:1px solid #efe7d6;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#a9842f;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:9px 0;border-bottom:1px solid #efe7d6;font-family:Arial,sans-serif;font-size:14px;color:#121013;">${value || '—'}</td>
  </tr>`;

/** Notify the studio that a new inquiry arrived. */
export async function sendInquiryNotification(inquiry) {
  // Studio alert recipient: prefer explicit env vars, else default to the
  // site contact inbox (festigoeventplanner@gmail.com) — never an old address.
  const to = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || site.email;
  if (!isConfigured() || !to) {
    console.info('[email] SMTP not configured — skipping admin notification for', inquiry.email);
    return { skipped: true };
  }

  const details = `
    <table style="width:100%;border-collapse:collapse;">
      ${row('Name', inquiry.name)}
      ${row('Email', inquiry.email)}
      ${row('Phone', inquiry.phone)}
      ${row('Event Type', inquiry.eventType)}
      ${row('Event Date', inquiry.eventDate ? formatDate(inquiry.eventDate) : '—')}
      ${row('Guests', inquiry.guestCount != null ? String(inquiry.guestCount) : '—')}
      ${row('Budget', inquiry.budget)}
      ${row('Message', (inquiry.message || '').replace(/\n/g, '<br/>'))}
    </table>`;

  const html = wrap('New Event Inquiry', `
    <p style="font-family:Arial,sans-serif;font-size:14px;color:#4a454b;margin:0 0 20px;">
      A new inquiry just came in through the website. Reply within 24 hours to keep response times sharp.
    </p>
    ${details}`);

  await getTransporter().sendMail({
    from: FROM,
    to,
    replyTo: inquiry.email,
    subject: `New ${inquiry.eventType} inquiry — ${inquiry.name}`,
    html,
  });
  return { sent: true };
}

/** Send the client a polished confirmation that we received their request. */
export async function sendClientConfirmation(inquiry) {
  if (!isConfigured()) {
    console.info('[email] SMTP not configured — skipping client confirmation for', inquiry.email);
    return { skipped: true };
  }

  const html = wrap('Thank you, ' + inquiry.name.split(' ')[0], `
    <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#4a454b;margin:0 0 16px;">
      We are delighted you are considering ${site.name} for your
      <strong>${inquiry.eventType.toLowerCase()}</strong>. Your inquiry has been received
      and a member of our studio will personally reach out within one business day to
      begin shaping your vision.
    </p>
    <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#4a454b;margin:0 0 24px;">
      In the meantime, feel free to explore our portfolio and gather any inspiration you'd
      love to share with us.
    </p>
    <div style="text-align:center;">
      <span style="display:inline-block;height:1px;width:60px;background:#c8a24a;"></span>
    </div>
    <p style="font-family:Georgia,serif;font-size:15px;text-align:center;color:#121013;margin:20px 0 0;">
      With warm regards,<br/><em>The ${site.name} Studio</em>
    </p>`);

  await getTransporter().sendMail({
    from: FROM,
    to: inquiry.email,
    subject: `We received your inquiry — ${site.name}`,
    html,
  });
  return { sent: true };
}
