import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

import {
  bookingConfirmationTemplate,
  bookingStatusUpdateTemplate,
  adminBookingAlertTemplate,
  bookingModificationRequestTemplate,
  adminBookingModificationAlertTemplate,
  bookingModificationProcessedTemplate,
  type BookingTemplateData,
  type AdminBookingAlertData,
  type ModificationRequestTemplateData,
  type AdminModificationAlertData,
  type ModificationProcessedTemplateData,
} from "./emailTemplates";

// =============================================================================
// Transporter — cached singleton with connection pooling
// =============================================================================

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function getTransporter(): Promise<{ transporter: nodemailer.Transporter; isEthereal: boolean }> {
  const g = globalThis as any;
  if (g._svMailTransporter) {
    return { transporter: g._svMailTransporter, isEthereal: !!g._svMailIsEthereal };
  }

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  let transporter: nodemailer.Transporter;
  let isEthereal = false;

  if (host && user && pass) {
    console.log(`[Email] Initializing SMTP: ${host}:${port}`);
    transporter = nodemailer.createTransport({
      host, port, secure,
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  } else {
    console.log("[Email] SMTP not configured — using Ethereal fallback.");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    isEthereal = true;
    console.log(`[Email] Ethereal account: ${testAccount.user}`);
  }

  g._svMailTransporter = transporter;
  g._svMailIsEthereal = isEthereal;
  return { transporter, isEthereal };
}

// =============================================================================
// MailService — low-level send wrapper
// =============================================================================

export const MailService = {
  async send(options: SendEmailOptions) {
    const { transporter, isEthereal } = await getTransporter();
    const from =
      options.from ||
      process.env.SMTP_FROM_EMAIL ||
      `"StayVacation" <bookings@stayvacation.com>`;

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || "",
    });

    console.log(`[Email] Sent → ${options.to} | ID: ${info.messageId}`);

    let previewUrl: string | null = null;
    if (isEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(info) || null;
      console.log(`[Email] Preview: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  },
};

// =============================================================================
// Retry & async dispatch helpers
// =============================================================================

const MAX_RETRIES = 3;

async function sendWithRetry(
  fn: () => Promise<any>,
  label: string,
  attempt = 1
): Promise<void> {
  try {
    const result = await fn();
    const extra = result?.previewUrl ? ` | Preview: ${result.previewUrl}` : "";
    console.log(`[Email] [${label}] Delivered (attempt ${attempt}).${extra}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Email] [${label}] Attempt ${attempt}/${MAX_RETRIES} failed: ${msg}`);
    if (attempt < MAX_RETRIES) {
      const delay = Math.pow(2, attempt - 1) * 500;
      console.log(`[Email] [${label}] Retrying in ${delay} ms…`);
      await new Promise((r) => setTimeout(r, delay));
      return sendWithRetry(fn, label, attempt + 1);
    }
    console.error(`[Email] [${label}] All ${MAX_RETRIES} attempts exhausted.`);
  }
}

function dispatchAsync(fn: () => Promise<any>, label: string): void {
  setImmediate(() => {
    sendWithRetry(fn, label).catch((err) =>
      console.error(`[Email] Unexpected error in dispatchAsync [${label}]:`, err)
    );
  });
}

// =============================================================================
// Local HTML mockup writer (dev convenience)
// =============================================================================

function saveMockup(bookingId: string, html: string): void {
  try {
    const dir = path.join(process.cwd(), "scratch", "emails");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${bookingId}.html`);
    fs.writeFileSync(file, html, "utf-8");
    console.log(`[Email] Saved mockup: ${file}`);
  } catch (e) {
    console.error("[Email] Failed to save mockup:", e);
  }
}

// =============================================================================
// Public API — three high-level send functions + async variants
// =============================================================================

// Re-export types so consumers don't need to import from two places
export type {
  BookingTemplateData,
  AdminBookingAlertData,
  ModificationRequestTemplateData,
  AdminModificationAlertData,
  ModificationProcessedTemplateData,
};

// ---------------------------------------------------------------------------
// 1. Booking Confirmation  (new booking, payment successful)
// ---------------------------------------------------------------------------
export async function sendBookingConfirmation(data: BookingTemplateData) {
  const { subject, html, text } = bookingConfirmationTemplate(data);
  saveMockup(`${data.bookingId}-confirmation`, html);
  return MailService.send({ to: data.userEmail, subject, html, text });
}

export function sendBookingConfirmationAsync(data: BookingTemplateData): void {
  dispatchAsync(() => sendBookingConfirmation(data), `${data.bookingId}-confirmation`);
}

// ---------------------------------------------------------------------------
// 2. Booking Status Update  (pending / cancelled / completed)
// ---------------------------------------------------------------------------
export async function sendBookingStatusUpdate(data: BookingTemplateData) {
  const { subject, html, text } = bookingStatusUpdateTemplate(data);
  saveMockup(`${data.bookingId}-${data.bookingStatus}`, html);
  return MailService.send({ to: data.userEmail, subject, html, text });
}

export function sendBookingStatusUpdateAsync(data: BookingTemplateData): void {
  dispatchAsync(
    () => sendBookingStatusUpdate(data),
    `${data.bookingId}-${data.bookingStatus}`
  );
}

// ---------------------------------------------------------------------------
// 3. Admin Booking Alert  (new booking or status change notification to admin)
// ---------------------------------------------------------------------------
export async function sendAdminBookingAlert(data: AdminBookingAlertData) {
  const adminEmail =
    process.env.ADMIN_EMAIL ||
    process.env.SMTP_USER ||
    "admin@stayvacation.com";
  const { subject, html, text } = adminBookingAlertTemplate(data);
  saveMockup(`${data.bookingId}-admin-alert`, html);
  return MailService.send({ to: adminEmail, subject, html, text });
}

export function sendAdminBookingAlertAsync(data: AdminBookingAlertData): void {
  dispatchAsync(
    () => sendAdminBookingAlert(data),
    `${data.bookingId}-admin-alert`
  );
}

// ---------------------------------------------------------------------------
// Legacy shim — keeps existing callers working without code changes.
// Routes the call to the correct template based on bookingStatus.
// ---------------------------------------------------------------------------
export interface LegacyBookingEmailData {
  bookingId: string;
  packageName: string;
  travelDate: string;
  returnDate?: string;
  travellers: { adults: number; children: number };
  totalAmount: number;
  currency?: string;
  bookingStatus: string;
  userEmail: string;
  userName: string;
}

export async function sendBookingEmail(data: LegacyBookingEmailData) {
  const templateData: BookingTemplateData = { ...data, userPhone: undefined, notes: undefined };
  if (data.bookingStatus.toLowerCase() === "confirmed") {
    return sendBookingConfirmation(templateData);
  }
  return sendBookingStatusUpdate(templateData);
}

export function sendEmailAsync(
  data: LegacyBookingEmailData,
  label = data.bookingId
): void {
  dispatchAsync(() => sendBookingEmail(data), label);
}

// ---------------------------------------------------------------------------
// 4. Booking Modification Requested (Notify User)
// ---------------------------------------------------------------------------
export async function sendBookingModificationRequest(data: ModificationRequestTemplateData) {
  const { subject, html, text } = bookingModificationRequestTemplate(data);
  saveMockup(`${data.bookingId}-modification-requested`, html);
  return MailService.send({ to: data.userEmail, subject, html, text });
}

export function sendBookingModificationRequestAsync(data: ModificationRequestTemplateData): void {
  dispatchAsync(() => sendBookingModificationRequest(data), `${data.bookingId}-mod-requested`);
}

// ---------------------------------------------------------------------------
// 5. Booking Modification Alert (Notify Admin)
// ---------------------------------------------------------------------------
export async function sendAdminBookingModificationAlert(data: AdminModificationAlertData) {
  const adminEmail =
    process.env.ADMIN_EMAIL ||
    process.env.SMTP_USER ||
    "admin@stayvacation.com";
  const { subject, html, text } = adminBookingModificationAlertTemplate(data);
  saveMockup(`${data.bookingId}-admin-modification-alert`, html);
  return MailService.send({ to: adminEmail, subject, html, text });
}

export function sendAdminBookingModificationAlertAsync(data: AdminModificationAlertData): void {
  dispatchAsync(() => sendAdminBookingModificationAlert(data), `${data.bookingId}-admin-mod-alert`);
}

// ---------------------------------------------------------------------------
// 6. Booking Modification Processed (Notify User on Approve/Reject)
// ---------------------------------------------------------------------------
export async function sendBookingModificationProcessed(data: ModificationProcessedTemplateData) {
  const { subject, html, text } = bookingModificationProcessedTemplate(data);
  saveMockup(`${data.bookingId}-modification-processed-${data.status}`, html);
  return MailService.send({ to: data.userEmail, subject, html, text });
}

export function sendBookingModificationProcessedAsync(data: ModificationProcessedTemplateData): void {
  dispatchAsync(() => sendBookingModificationProcessed(data), `${data.bookingId}-mod-processed-${data.status}`);
}
