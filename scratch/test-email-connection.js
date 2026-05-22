const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    console.error("No .env file found at:", envPath);
    return {};
  }
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join("=").trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      env[key] = val;
    }
  });
  return env;
}

async function testConnection() {
  const env = loadEnv();
  const host = env.SMTP_HOST;
  const port = parseInt(env.SMTP_PORT || "587", 10);
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;
  const secure = env.SMTP_SECURE === "true";

  console.log("Loaded SMTP Settings:");
  console.log(`- SMTP_HOST: ${host || "(not set)"}`);
  console.log(`- SMTP_PORT: ${port}`);
  console.log(`- SMTP_USER: ${user || "(not set)"}`);
  console.log(`- SMTP_PASS: ${pass ? "****" : "(not set)"}`);
  console.log(`- SMTP_SECURE: ${secure}`);
  console.log(`- SMTP_FROM_EMAIL: ${env.SMTP_FROM_EMAIL || "(not set)"}`);

  let transporter;
  let isEthereal = false;

  if (host && user && pass) {
    console.log("\nConnecting to configured SMTP server...");
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
  } else {
    console.log("\nSMTP settings empty/missing. Testing Ethereal Mail fallback...");
    const testAccount = await nodemailer.createTestAccount();
    console.log(`Created Ethereal test account: ${testAccount.user}`);
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    isEthereal = true;
  }

  try {
    console.log("Verifying transporter connection...");
    await transporter.verify();
    console.log("✅ Transporter connection verified successfully!");

    // Send a test email
    const toEmail = user || "test@example.com";
    const fromEmail = env.SMTP_FROM_EMAIL || "bookings@stayvacation.com";
    console.log(`Sending a test email to ${toEmail}...`);
    const info = await transporter.sendMail({
      from: `"StayVacation Test" <${fromEmail}>`,
      to: toEmail,
      subject: "StayVacation SMTP Verification Test",
      text: "If you are reading this, your StayVacation SMTP connection is fully working!",
      html: "<p>If you are reading this, your <b>StayVacation SMTP</b> connection is fully working!</p>"
    });

    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    if (isEthereal) {
      console.log(`Ethereal Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (err) {
    console.error("❌ Connection verification failed:", err);
  }
}

testConnection();
