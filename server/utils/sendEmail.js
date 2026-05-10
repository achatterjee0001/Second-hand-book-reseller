import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // If SMTP credentials are not provided, just log the email to the console (useful for development)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n=============================================');
    console.log('📧 MOCK EMAIL SENT (SMTP Credentials Missing)');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log('=============================================\n');
    return;
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // e.g., your gmail address
      pass: process.env.SMTP_PASS, // e.g., your gmail app password
    },
  });

  // Define email options
  const mailOptions = {
    from: `"Collector's Marketplace" <${process.env.SMTP_USER || 'no-reply@example.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.htmlMessage || `<p>${options.message}</p>`,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Even if it fails, we might still throw or log. In a real app we'd throw to inform the user.
    // We won't throw here to prevent crashing if credentials are not set up yet.
    // Instead we log it so you know you need to setup your SMTP credentials.
  }
};
