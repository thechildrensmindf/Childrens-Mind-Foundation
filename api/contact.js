/**
 * Vercel Serverless Function: Contact Form Handler
 * 
 * This API endpoint securely handles contact form submissions and sends emails
 * via Resend. The email address and API key are stored in environment variables,
 * keeping them safe from public exposure.
 * 
 * Environment variables required:
 * - RESEND_API_KEY: Your Resend API key
 * - RESEND_FROM_EMAIL: A sender address on your verified Resend domain
 * - CONTACT_EMAIL: Email address to receive submissions (e.g., test@example.com)
 */

const { Resend } = require("resend");

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Enable CORS for your domain
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      console.error("RESEND_API_KEY or RESEND_FROM_EMAIL is not set");
      return res.status(500).json({
        error: "Server configuration error. Please contact the administrator.",
      });
    }

    // Extract form data
    const { name, email, subject, message, topic } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Missing required fields: name, email, and message are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Sanitize inputs to prevent injection
    const sanitize = (str) => {
      if (!str) return "";
      return str
        .replace(/[<>]/g, "")
        .slice(0, 500);
    };

    const cleanName = sanitize(name);
    const cleanEmail = email.trim();
    const cleanTopic = topic ? sanitize(topic) : "General Enquiry";
    const cleanMessage = sanitize(message);

    // Get the recipient email from environment variable
    const recipientEmail = process.env.CONTACT_EMAIL;
    if (!recipientEmail) {
      console.error("CONTACT_EMAIL environment variable is not set");
      return res.status(500).json({
        error:
          "Server configuration error. Please contact the administrator.",
      });
    }

    // Construct the email
    const mailOptions = {
      from: process.env.RESEND_FROM_EMAIL,
      to: recipientEmail,
      replyTo: cleanEmail,
      subject: `New Contact Form Submission: ${cleanTopic || "General Enquiry"}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${cleanName}</p>
        <p><strong>Email:</strong> ${cleanEmail}</p>
        <p><strong>Topic:</strong> ${cleanTopic}</p>
        <p><strong>Message:</strong></p>
        <p>${cleanMessage.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><em>This is an automated email from the Children's Mind Foundation website contact form.</em></p>
      `,
      text: `
New Contact Form Submission

Name: ${cleanName}
Email: ${cleanEmail}
Topic: ${cleanTopic}
Message:
${cleanMessage}

---
This is an automated email from the Children's Mind Foundation website contact form.
      `,
    };

    // Send the email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send(mailOptions);

    if (error) {
      console.error("Resend error details:", error);
      return res.status(502).json({
        error: "Failed to send message. Please try again later or contact us directly.",
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Thank you! Your message has been sent successfully.",
      id: data?.id,
    });
  } catch (error) {
    console.error("Contact form error:", error);

    // Don't expose internal errors to the client
    return res.status(500).json({
      error:
        "Failed to send message. Please try again later or contact us directly.",
    });
  }
};
