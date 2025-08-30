import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"Chattapp " <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
};
