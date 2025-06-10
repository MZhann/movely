import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from the .env file in the backend directory
dotenv.config();

const testSendEmail = async () => {
  console.log("Attempting to send a test email...");
  console.log("SMTP_USER:", process.env.SMTP_USER ? "set" : "not set");
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "set" : "not set");
  console.log("SMTP_FROM:", process.env.SMTP_FROM);

  if (
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.SMTP_FROM
  ) {
    console.error("Error: One or more SMTP environment variables are missing.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use false for port 587 with STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Only use this in development for self-signed certs
    },
    requireTLS: true, // Explicitly require STARTTLS
  });

  try {
    await transporter.verify();
    console.log("Transporter successfully verified. Ready to send emails.");
  } catch (verifyError) {
    console.error("Transporter verification failed:", verifyError);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER, // Sending to yourself for testing
    subject: "Test Email from Movely Backend",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Hello from Movely Backend!</h2>
        <p>This is a test email sent from your Node.js application using Nodemailer and your Gmail SMTP settings.</p>
        <p>If you received this, your email configuration is working!</p>
        <p>Regards,<br>Your Movely Backend</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Test email sent successfully:");
    console.log("Message ID:", info.messageId);
    console.log(
      "Preview URL (if available):",
      nodemailer.getTestMessageUrl(info)
    );
  } catch (error) {
    console.error("Failed to send test email:", error);
  }
};

testSendEmail();
