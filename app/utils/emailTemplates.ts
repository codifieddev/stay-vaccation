// =============================================================================
// StayVacation Email Templates
// =============================================================================
// Three reusable, self-contained HTML template functions.
// Each returns { subject, html, text } ready to pass straight into MailService.
//
// Templates:
//   bookingConfirmationTemplate  — sent to user on new confirmed booking
//   bookingStatusUpdateTemplate  — sent to user on any status change
//   adminBookingAlertTemplate    — sent to admin when a booking is created/updated
// =============================================================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const YEAR = new Date().getFullYear();

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export interface BookingTemplateData {
  bookingId: string;
  packageName: string;
  travelDate: string;
  returnDate?: string;
  travellers: { adults: number; children: number };
  totalAmount: number;
  currency?: string;
  bookingStatus: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  notes?: string;
}

function formatCurrency(amount: number, currency = "INR"): string {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : `${currency} `;
  return `${symbol}${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTravellers(t: { adults: number; children: number }): string {
  const total = t.adults + t.children;
  const parts = [`${t.adults} Adult${t.adults !== 1 ? "s" : ""}`];
  if (t.children > 0) parts.push(`${t.children} Child${t.children !== 1 ? "ren" : ""}`);
  return `${total} (${parts.join(", ")})`;
}

interface StatusTheme {
  badge: string;
  badgeBg: string;
  badgeColor: string;
  accentColor: string;
  bannerBg: string;
  bannerText: string;
  icon: string;
}

function getStatusTheme(status: string): StatusTheme {
  switch (status.toLowerCase()) {
    case "confirmed":
      return {
        badge: "CONFIRMED",
        badgeBg: "#d1fae5",
        badgeColor: "#065f46",
        accentColor: "#10b981",
        bannerBg: "#ecfdf5",
        bannerText: "#065f46",
        icon: "✓",
      };
    case "pending":
      return {
        badge: "PENDING",
        badgeBg: "#fef3c7",
        badgeColor: "#92400e",
        accentColor: "#f59e0b",
        bannerBg: "#fffbeb",
        bannerText: "#92400e",
        icon: "⏳",
      };
    case "cancelled":
      return {
        badge: "CANCELLED",
        badgeBg: "#fee2e2",
        badgeColor: "#991b1b",
        accentColor: "#ef4444",
        bannerBg: "#fef2f2",
        bannerText: "#991b1b",
        icon: "✕",
      };
    case "completed":
      return {
        badge: "COMPLETED",
        badgeBg: "#dbeafe",
        badgeColor: "#1e40af",
        accentColor: "#3b82f6",
        bannerBg: "#eff6ff",
        bannerText: "#1e40af",
        icon: "★",
      };
    default:
      return {
        badge: status.toUpperCase(),
        badgeBg: "#f3f4f6",
        badgeColor: "#374151",
        accentColor: "#ff6b00",
        bannerBg: "#f9fafb",
        bannerText: "#374151",
        icon: "•",
      };
  }
}

// ---------------------------------------------------------------------------
// Shared base CSS (inlined for maximum email client compatibility)
// ---------------------------------------------------------------------------
const BASE_CSS = `
  body{margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1e293b;}
  table{border-collapse:collapse;}
  img{border:0;display:block;}
  a{color:#ff6b00;text-decoration:none;}
  .wrapper{width:100%;background:#f1f5f9;padding:40px 0;}
  .container{max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;}
  .header{background:linear-gradient(135deg,#0a1628 0%,#061217 60%,#0f1f1f 100%);padding:32px 30px;text-align:center;border-bottom:3px solid #ff6b00;}
  .logo-text{font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;text-decoration:none;}
  .logo-accent{color:#ff9500;}
  .header-tagline{font-size:12px;color:#94a3b8;margin-top:6px;letter-spacing:1.5px;text-transform:uppercase;}
  .status-banner{padding:20px 30px;text-align:center;}
  .status-icon{font-size:36px;margin-bottom:8px;display:block;}
  .status-title{font-size:22px;font-weight:800;margin:0 0 4px;}
  .status-subtitle{font-size:14px;opacity:0.8;margin:0;}
  .content{padding:32px 30px;}
  .greeting{font-size:18px;font-weight:700;color:#111827;margin:0 0 10px;}
  .intro{font-size:15px;color:#475569;line-height:1.7;margin:0 0 28px;}
  .card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;overflow:hidden;}
  .card-title{font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 18px;padding-bottom:12px;border-bottom:1px solid #e2e8f0;}
  .detail-row{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 0;border-bottom:1px solid #f1f5f9;}
  .detail-row:last-child{border-bottom:none;}
  .detail-label{font-size:13px;color:#64748b;font-weight:500;}
  .detail-value{font-size:13px;color:#0f172a;font-weight:600;text-align:right;max-width:60%;}
  .detail-table{width:100%;border-collapse:collapse;}
  .detail-table td{padding:9px 0;font-size:13px;vertical-align:top;border-bottom:1px solid #f1f5f9;}
  .detail-table tr:last-child td{border-bottom:none;}
  .dl{color:#64748b;font-weight:500;width:42%;}
  .dv{color:#0f172a;font-weight:600;text-align:right;}
  .badge{display:inline-block;padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;}
  .total-row td{border-top:2px solid #e2e8f0 !important;padding-top:16px !important;font-size:15px;}
  .total-label{font-weight:700;color:#0f172a;}
  .total-value{font-size:22px;font-weight:900;color:#ff6b00;text-align:right;}
  .id-chip{font-family:monospace;font-size:15px;background:#f1f5f9;padding:2px 8px;border-radius:4px;color:#0f172a;}
  .cta-wrap{text-align:center;margin:28px 0 8px;}
  .btn{display:inline-block;background:linear-gradient(135deg,#ff6b00,#ff9500);color:#ffffff !important;font-weight:700;font-size:14px;padding:14px 36px;text-decoration:none;border-radius:10px;letter-spacing:0.3px;}
  .divider{height:1px;background:#e2e8f0;margin:24px 0;}
  .footer{background:#0a1628;padding:28px 30px;text-align:center;}
  .footer p{margin:4px 0;font-size:12px;color:#64748b;line-height:1.6;}
  .footer a{color:#ff9500;text-decoration:none;}
  .footer-logo{font-size:16px;font-weight:800;color:#ffffff;margin-bottom:12px;display:block;}
  .footer-logo span{color:#ff9500;}
  .alert-card{border-left:4px solid;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:20px;}
  .admin-meta{background:#0f172a;color:#94a3b8;font-size:12px;padding:12px 16px;border-radius:8px;font-family:monospace;margin-top:16px;}
  @media(max-width:600px){
    .wrapper{padding:20px 0 !important;}
    .content{padding:24px 20px !important;}
    .header{padding:24px 20px !important;}
    .card{padding:18px !important;}
    .btn{display:block !important;text-align:center !important;}
  }
`;

function baseLayout(bodyContent: string, previewText = ""): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no">
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>${BASE_CSS}</style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌</div>` : ""}
  <div class="wrapper">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr><td align="center" style="padding:40px 16px;">
        <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
          ${bodyContent}
          <tr><td class="footer">
            <a href="${APP_URL}" class="footer-logo">Stay<span>Vacation</span></a>
            <p>&copy; ${YEAR} StayVacation. All rights reserved.</p>
            <p>If you have any questions, please reply to this email or contact our support team.</p>
            <p style="margin-top:10px;">
              <a href="${APP_URL}/pages/terms-of-service">Terms of Service</a>
              &nbsp;·&nbsp;
              <a href="${APP_URL}/pages/privacy-policy">Privacy Policy</a>
              &nbsp;·&nbsp;
              <a href="${APP_URL}/account/bookings">My Bookings</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>
</body>
</html>`;
}

function sharedHeader(): string {
  return `
  <tr><td class="header">
    <a href="${APP_URL}" class="logo-text">Stay<span class="logo-accent">Vacation</span></a>
    <p class="header-tagline">Premium Travel Experiences</p>
  </td></tr>`;
}

function detailsCard(data: BookingTemplateData, theme: StatusTheme): string {
  const currency = data.currency || "INR";
  const amount = formatCurrency(data.totalAmount, currency);
  const travellers = formatTravellers(data.travellers);
  const travelDate = formatDate(data.travelDate);
  const returnDate = data.returnDate ? formatDate(data.returnDate) : null;

  return `
  <div class="card">
    <p class="card-title">Booking Details</p>
    <table class="detail-table" role="presentation">
      <tr>
        <td class="dl">Booking ID</td>
        <td class="dv"><span class="id-chip">${data.bookingId}</span></td>
      </tr>
      <tr>
        <td class="dl">Package</td>
        <td class="dv">${data.packageName}</td>
      </tr>
      <tr>
        <td class="dl">Travel Date</td>
        <td class="dv">${travelDate}</td>
      </tr>
      ${returnDate ? `<tr><td class="dl">Return Date</td><td class="dv">${returnDate}</td></tr>` : ""}
      <tr>
        <td class="dl">Travelers</td>
        <td class="dv">${travellers}</td>
      </tr>
      <tr>
        <td class="dl">Status</td>
        <td class="dv">
          <span class="badge" style="background:${theme.badgeBg};color:${theme.badgeColor};">${theme.badge}</span>
        </td>
      </tr>
      <tr class="total-row">
        <td class="total-label">Total Amount</td>
        <td class="total-value">${amount}</td>
      </tr>
    </table>
  </div>`;
}

// =============================================================================
// Template 1 — Booking Confirmation
// Sent to user on newly confirmed booking (post payment).
// =============================================================================
export interface BookingConfirmationResult {
  subject: string;
  html: string;
  text: string;
}

export function bookingConfirmationTemplate(data: BookingTemplateData): BookingConfirmationResult {
  const theme = getStatusTheme("confirmed");
  const currency = data.currency || "INR";
  const amount = formatCurrency(data.totalAmount, currency);
  const travellers = formatTravellers(data.travellers);

  const subject = `🎉 Booking Confirmed: ${data.bookingId} — ${data.packageName}`;
  const previewText = `Your ${data.packageName} trip is confirmed! Booking ID: ${data.bookingId}`;

  const body = `
    ${sharedHeader()}
    <tr><td class="status-banner" style="background:${theme.bannerBg};">
      <span class="status-icon">${theme.icon}</span>
      <h1 class="status-title" style="color:${theme.bannerText};">Booking Confirmed!</h1>
      <p class="status-subtitle" style="color:${theme.bannerText};">Your adventure is locked in — get ready to explore!</p>
    </td></tr>
    <tr><td class="content">
      <h2 class="greeting">Hi ${data.userName},</h2>
      <p class="intro">
        Great news! Your booking for <strong>${data.packageName}</strong> has been successfully confirmed.
        We're excited to be part of your travel journey. Below are your complete booking details for reference.
      </p>
      ${detailsCard(data, theme)}
      <div class="card" style="background:${theme.bannerBg};border-color:${theme.accentColor};">
        <p class="card-title" style="color:${theme.badgeColor};">What's Next?</p>
        <p style="font-size:14px;color:#475569;margin:0;line-height:1.7;">
          Our team will get in touch with you before your travel date with detailed itinerary information.
          You can view and manage your booking anytime from your dashboard.
        </p>
      </div>
      <div class="cta-wrap">
        <a href="${APP_URL}/account/bookings" class="btn">View My Booking →</a>
      </div>
      <p style="font-size:13px;color:#94a3b8;text-align:center;margin-top:20px;">
        Questions? Reply to this email or contact our support team.
      </p>
    </td></tr>`;

  const text = `Hi ${data.userName},

Your booking has been CONFIRMED!

Booking ID:    ${data.bookingId}
Package:       ${data.packageName}
Travel Date:   ${formatDate(data.travelDate)}${data.returnDate ? `\nReturn Date:   ${formatDate(data.returnDate)}` : ""}
Travelers:     ${travellers}
Total Amount:  ${amount}
Status:        CONFIRMED

View your booking: ${APP_URL}/account/bookings

Safe travels,
The StayVacation Team`;

  return { subject, html: baseLayout(body, previewText), text };
}

// =============================================================================
// Template 2 — Booking Status Update
// Sent whenever a booking status changes: pending / cancelled / completed.
// =============================================================================
export interface BookingStatusUpdateResult {
  subject: string;
  html: string;
  text: string;
}

const STATUS_CONFIG: Record<string, { headline: string; intro: string; cta: string; emoji: string }> = {
  pending: {
    emoji: "⏳",
    headline: "Booking Received — Pending Confirmation",
    intro: "We've received your booking request! Your booking is currently awaiting payment confirmation. You'll receive another email once it's confirmed.",
    cta: "Complete Payment →",
  },
  cancelled: {
    emoji: "❌",
    headline: "Booking Cancelled",
    intro: "Your booking has been cancelled as requested. If this was a mistake or you'd like to rebook, our team is here to help.",
    cta: "Book Again →",
  },
  completed: {
    emoji: "🌟",
    headline: "Trip Completed — We Hope You Had a Blast!",
    intro: "Your journey with StayVacation is now marked as completed. We hope you had an incredible experience! We'd love to hear your feedback.",
    cta: "Share Your Experience →",
  },
};

export function bookingStatusUpdateTemplate(data: BookingTemplateData): BookingStatusUpdateResult {
  const statusLower = data.bookingStatus.toLowerCase();
  const theme = getStatusTheme(statusLower);
  const config = STATUS_CONFIG[statusLower] ?? {
    emoji: "📋",
    headline: `Booking Status Updated`,
    intro: `Your booking status has been updated to ${data.bookingStatus}.`,
    cta: "View Booking →",
  };

  const currency = data.currency || "INR";
  const amount = formatCurrency(data.totalAmount, currency);
  const travellers = formatTravellers(data.travellers);

  const subject = `${config.emoji} ${data.bookingStatus.charAt(0).toUpperCase() + data.bookingStatus.slice(1)}: ${data.bookingId} — ${data.packageName}`;
  const previewText = `Update on your booking ${data.bookingId}: ${data.bookingStatus.toUpperCase()}`;

  const body = `
    ${sharedHeader()}
    <tr><td class="status-banner" style="background:${theme.bannerBg};">
      <span class="status-icon">${config.emoji}</span>
      <h1 class="status-title" style="color:${theme.bannerText};">${config.headline}</h1>
      <p class="status-subtitle" style="color:${theme.bannerText};">Booking ID: ${data.bookingId}</p>
    </td></tr>
    <tr><td class="content">
      <h2 class="greeting">Hi ${data.userName},</h2>
      <p class="intro">${config.intro}</p>
      ${detailsCard(data, theme)}
      <div class="cta-wrap">
        <a href="${APP_URL}/account/bookings" class="btn" style="background:linear-gradient(135deg,${theme.accentColor},${theme.accentColor}dd);">${config.cta}</a>
      </div>
      <p style="font-size:13px;color:#94a3b8;text-align:center;margin-top:20px;">
        Need help? Reply to this email or reach us at support.
      </p>
    </td></tr>`;

  const text = `Hi ${data.userName},

Status Update: ${data.bookingStatus.toUpperCase()}

${config.intro}

Booking ID:    ${data.bookingId}
Package:       ${data.packageName}
Travel Date:   ${formatDate(data.travelDate)}${data.returnDate ? `\nReturn Date:   ${formatDate(data.returnDate)}` : ""}
Travelers:     ${travellers}
Total Amount:  ${amount}
Status:        ${data.bookingStatus.toUpperCase()}

View your booking: ${APP_URL}/account/bookings

The StayVacation Team`;

  return { subject, html: baseLayout(body, previewText), text };
}

// =============================================================================
// Template 3 — Admin Booking Alert
// Sent to admin when a new booking is created or a status changes.
// =============================================================================
export interface AdminBookingAlertData extends BookingTemplateData {
  eventType: "new_booking" | "status_change";
  previousStatus?: string;
  adminNotes?: string;
}

export interface AdminBookingAlertResult {
  subject: string;
  html: string;
  text: string;
}

export function adminBookingAlertTemplate(data: AdminBookingAlertData): AdminBookingAlertResult {
  const theme = getStatusTheme(data.bookingStatus);
  const currency = data.currency || "INR";
  const amount = formatCurrency(data.totalAmount, currency);
  const travellers = formatTravellers(data.travellers);
  const isNew = data.eventType === "new_booking";
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

  const subject = isNew
    ? `[New Booking] ${data.bookingId} — ${data.packageName} (${data.bookingStatus.toUpperCase()})`
    : `[Status Change] ${data.bookingId}: ${data.previousStatus?.toUpperCase() ?? "?"} → ${data.bookingStatus.toUpperCase()}`;

  const previewText = isNew
    ? `New booking from ${data.userName} for ${data.packageName}`
    : `${data.bookingId} status changed to ${data.bookingStatus}`;

  const alertBg = isNew ? "#fff7ed" : theme.bannerBg;
  const alertBorder = isNew ? "#f59e0b" : theme.accentColor;
  const alertColor = isNew ? "#92400e" : theme.bannerText;

  const body = `
    <tr><td style="background:${alertBg};border-bottom:3px solid ${alertBorder};padding:20px 30px;text-align:center;">
      <p style="font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${alertColor};margin:0 0 4px;">StayVacation Admin Alert</p>
      <h1 style="font-size:20px;font-weight:900;color:#0f172a;margin:0;">${isNew ? "🆕 New Booking Received" : `🔄 Status Changed → ${data.bookingStatus.toUpperCase()}`}</h1>
      ${!isNew && data.previousStatus ? `<p style="font-size:13px;color:#64748b;margin:6px 0 0;">${data.previousStatus.toUpperCase()} → <strong>${data.bookingStatus.toUpperCase()}</strong></p>` : ""}
    </td></tr>
    <tr><td class="content">

      <div class="alert-card" style="background:${alertBg};border-color:${alertBorder};">
        <p style="margin:0;font-size:13px;font-weight:700;color:${alertColor};">
          ${isNew ? `New booking created on ${timestamp}` : `Status updated on ${timestamp}`}
        </p>
      </div>

      <div class="card">
        <p class="card-title">Customer Information</p>
        <table class="detail-table" role="presentation">
          <tr><td class="dl">Name</td><td class="dv">${data.userName}</td></tr>
          <tr><td class="dl">Email</td><td class="dv"><a href="mailto:${data.userEmail}">${data.userEmail}</a></td></tr>
          ${data.userPhone ? `<tr><td class="dl">Phone</td><td class="dv">${data.userPhone}</td></tr>` : ""}
        </table>
      </div>

      <div class="card">
        <p class="card-title">Booking Summary</p>
        <table class="detail-table" role="presentation">
          <tr>
            <td class="dl">Booking ID</td>
            <td class="dv"><span class="id-chip">${data.bookingId}</span></td>
          </tr>
          <tr><td class="dl">Package</td><td class="dv">${data.packageName}</td></tr>
          <tr><td class="dl">Travel Date</td><td class="dv">${formatDate(data.travelDate)}</td></tr>
          ${data.returnDate ? `<tr><td class="dl">Return Date</td><td class="dv">${formatDate(data.returnDate)}</td></tr>` : ""}
          <tr><td class="dl">Travelers</td><td class="dv">${travellers}</td></tr>
          <tr>
            <td class="dl">Status</td>
            <td class="dv">
              <span class="badge" style="background:${theme.badgeBg};color:${theme.badgeColor};">${theme.badge}</span>
            </td>
          </tr>
          <tr class="total-row">
            <td class="total-label">Revenue</td>
            <td class="total-value">${amount}</td>
          </tr>
        </table>
      </div>

      ${data.notes ? `
      <div class="card" style="border-color:#cbd5e1;">
        <p class="card-title">Customer Notes</p>
        <p style="font-size:14px;color:#475569;margin:0;line-height:1.6;">${data.notes}</p>
      </div>` : ""}

      ${data.adminNotes ? `
      <div class="card" style="border-color:#7c3aed;background:#faf5ff;">
        <p class="card-title" style="color:#7c3aed;">Admin Notes</p>
        <p style="font-size:14px;color:#4c1d95;margin:0;line-height:1.6;">${data.adminNotes}</p>
      </div>` : ""}

      <div class="admin-meta">
        <span>BOOKING_ID: ${data.bookingId}</span><br>
        <span>EVENT: ${data.eventType.toUpperCase()}</span><br>
        <span>TIMESTAMP: ${new Date().toISOString()}</span>
      </div>

      <div class="cta-wrap" style="margin-top:24px;">
        <a href="${APP_URL}/admin/bookings" class="btn" style="background:linear-gradient(135deg,#1e293b,#0f172a);">Open Admin Panel →</a>
      </div>
    </td></tr>`;

  const text = `[StayVacation Admin Alert]
${isNew ? "NEW BOOKING RECEIVED" : `STATUS CHANGE: ${data.previousStatus?.toUpperCase()} → ${data.bookingStatus.toUpperCase()}`}
Timestamp: ${timestamp}

--- CUSTOMER ---
Name:    ${data.userName}
Email:   ${data.userEmail}
${data.userPhone ? `Phone:   ${data.userPhone}` : ""}

--- BOOKING ---
Booking ID:  ${data.bookingId}
Package:     ${data.packageName}
Travel Date: ${formatDate(data.travelDate)}${data.returnDate ? `\nReturn Date: ${formatDate(data.returnDate)}` : ""}
Travelers:   ${travellers}
Status:      ${data.bookingStatus.toUpperCase()}
Revenue:     ${amount}
${data.notes ? `\nCustomer Notes: ${data.notes}` : ""}
${data.adminNotes ? `\nAdmin Notes: ${data.adminNotes}` : ""}

Manage bookings: ${APP_URL}/admin/bookings`;

  return { subject, html: baseLayout(body, previewText), text };
}
