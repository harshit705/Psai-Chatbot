const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
  },
});

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  // Extract reset code from link (last 6 digits)
  const resetCode = resetLink.split('code=')[1]?.split('&')[0] || '';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - PSAI Chatbot',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your PSAI Chatbot account.</p>
      
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 14px;">Your Reset Code:</p>
        <h1 style="margin: 10px 0; color: #007bff; letter-spacing: 5px; font-family: monospace;">${resetCode}</h1>
        <p style="margin: 0; color: #666; font-size: 12px;">(Valid for 1 hour)</p>
      </div>

      <p>Enter this code in the PSAI Chatbot app to reset your password.</p>
      
      <p><strong>Or click the link below:</strong></p>
      <a href="${resetLink}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">Reset Password</a>

      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        If you didn't request this, please ignore this email and your password will remain unchanged.
      </p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to PSAI Chatbot!',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for joining PSAI Chatbot.</p>
      <p>Your account has been created successfully.</p>
      <p>You can now log in and start chatting.</p>
      <hr/>
      <p style="color: #666; font-size: 12px;">
        If you have any questions, feel free to contact us.
      </p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
