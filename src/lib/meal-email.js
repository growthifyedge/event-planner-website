import nodemailer from 'nodemailer';
import { site } from '@/data/site';
import { dailyBrand } from '@/data/daily-meals';

/**
 * Festigo Daily corporate-enquiry emails.
 *
 * Deliberately ISOLATED from src/lib/email.js (the Event Planner emails) so the
 * event templates and flow are never touched. It reuses the SAME SMTP
 * configuration (env vars) and the same nodemailer approach — i.e. the shared
 * email infrastructure — with Festigo Daily branding and copy.
 */

const FROM = process.env.EMAIL_FROM || `${dailyBrand.name} <${site.email}>`;

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
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

// Escape user-supplied values before embedding them in the HTML email.
function esc(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const fmtDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ''
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
};

// Festigo Daily branded wrapper — premium black-and-gold, Karachi footer.
const wrap = (title, inner) => `
  <div style="margin:0;padding:32px 0;background:#f7f2e9;font-family:Georgia,'Times New Roman',serif;color:#121013;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #efe7d6;border-radius:16px;overflow:hidden;">
      <div style="background:#121013;padding:28px 32px;text-align:center;">
        <div style="font-size:24px;letter-spacing:6px;color:#c8a24a;font-weight:600;text-transform:uppercase;">${esc(dailyBrand.name)}</div>
        <div style="font-size:10px;letter-spacing:4px;color:#e8d9be;text-transform:uppercase;margin-top:6px;">Office Lunches &amp; Balanced Meal Plans · Karachi</div>
      </div>
      <div style="padding:32px;">
        <h1 style="font-size:22px;margin:0 0 18px;color:#121013;">${title}</h1>
        ${inner}
      </div>
      <div style="background:#faf6ee;padding:18px 32px;text-align:center;font-size:11px;color:#726c73;font-family:Arial,sans-serif;">
        ${esc(dailyBrand.name)} · part of ${esc(dailyBrand.parent)} · Karachi
      </div>
    </div>
  </div>`;

const row = (label, value) => `
  <tr>
    <td style="padding:9px 0;border-bottom:1px solid #efe7d6;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#a9842f;width:150px;vertical-align:top;">${esc(label)}</td>
    <td style="padding:9px 0;border-bottom:1px solid #efe7d6;font-family:Arial,sans-serif;font-size:14px;color:#121013;">${value || '—'}</td>
  </tr>`;

/** Notify Festigo Daily that a new corporate enquiry arrived. */
export async function sendMealInquiryNotification(inquiry) {
  const to = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || site.email;
  if (!isConfigured() || !to) {
    console.info('[meal-email] SMTP not configured — skipping admin notification for', inquiry.email);
    return { skipped: true };
  }

  const services =
    Array.isArray(inquiry.serviceTypes) && inquiry.serviceTypes.length
      ? inquiry.serviceTypes.map(esc).join(', ')
      : '—';

  const details = `
    <table style="width:100%;border-collapse:collapse;">
      ${row('Company', esc(inquiry.companyName))}
      ${row('Contact Person', esc(inquiry.contactName))}
      ${row('Designation', esc(inquiry.designation))}
      ${row('Phone', esc(inquiry.phone))}
      ${row('WhatsApp', esc(inquiry.whatsapp))}
      ${row('Email', esc(inquiry.email))}
      ${row('Karachi Area', esc(inquiry.officeLocation))}
      ${row('Address', esc(inquiry.address))}
      ${row('Services', services)}
      ${row('Employees', inquiry.employeesCount != null ? esc(inquiry.employeesCount) : '—')}
      ${row('Meals / Day', inquiry.mealsCount != null ? esc(inquiry.mealsCount) : '—')}
      ${row('Service Days', inquiry.requiredDays != null ? esc(inquiry.requiredDays) : '—')}
      ${row('Preferred Start', fmtDate(inquiry.expectedStartDate))}
      ${row('Monthly Budget', inquiry.monthlyBudget != null ? 'PKR ' + Number(inquiry.monthlyBudget).toLocaleString('en-PK') : '—')}
      ${row('Dietary', esc(inquiry.dietaryPreferences))}
      ${row('Notes', (esc(inquiry.message) || '').replace(/\n/g, '<br/>'))}
    </table>`;

  const html = wrap(
    'New Corporate Meal Enquiry',
    `<p style="font-family:Arial,sans-serif;font-size:14px;color:#4a454b;margin:0 0 20px;">
       A new Festigo Daily corporate meal enquiry just came in. Follow up promptly to keep the lead warm.
     </p>${details}`
  );

  await getTransporter().sendMail({
    from: FROM,
    to,
    replyTo: inquiry.email,
    subject: `New corporate meal enquiry — ${inquiry.companyName || inquiry.contactName}`,
    html,
  });
  return { sent: true };
}

/** Confirm to the customer that their corporate enquiry was received. */
export async function sendMealInquiryConfirmation(inquiry) {
  if (!isConfigured()) {
    console.info('[meal-email] SMTP not configured — skipping customer confirmation for', inquiry.email);
    return { skipped: true };
  }

  const firstName = esc(String(inquiry.contactName || '').split(' ')[0] || 'there');

  const html = wrap(
    `Thank you, ${firstName}`,
    `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#4a454b;margin:0 0 16px;">
       Thank you for contacting <strong>${esc(dailyBrand.name)}</strong>. We’ve received your corporate meal
       enquiry${inquiry.companyName ? ` for <strong>${esc(inquiry.companyName)}</strong>` : ''}.
     </p>
     <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#4a454b;margin:0 0 24px;">
       Our corporate meal consultant will contact you shortly to discuss your office lunch requirements and
       arrange the right plan for your team here in Karachi.
     </p>
     <div style="text-align:center;">
       <span style="display:inline-block;height:1px;width:60px;background:#c8a24a;"></span>
     </div>
     <p style="font-family:Georgia,serif;font-size:15px;text-align:center;color:#121013;margin:20px 0 0;">
       Warm regards,<br/><em>The ${esc(dailyBrand.name)} Team</em>
     </p>`
  );

  await getTransporter().sendMail({
    from: FROM,
    to: inquiry.email,
    subject: `We received your enquiry — ${dailyBrand.name}`,
    html,
  });
  return { sent: true };
}
