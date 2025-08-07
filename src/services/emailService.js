const formData = require('form-data');
const Mailgun = require('mailgun.js');
const logger = require('../utils/logger');

// Initialize Mailgun client
const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});
const domain = process.env.MAILGUN_DOMAIN;

/**
 * Get email subject based on type
 * @param {string} type - Type of OTP
 * @returns {string} Email subject
 */
function getSubject(type) {
  const subjects = {
    login: 'Your Login OTP - Fyaar',
    registration: 'Verify Your Email - Fyaar',
    password_reset: 'Password Reset OTP - Fyaar'
  };
  return subjects[type] || subjects.login;
}

/**
 * Get OTP email HTML template
 * @param {string} otp - OTP code
 * @param {string} type - Type of OTP
 * @returns {string} HTML email template
 */
function getOTPEmailTemplate(otp, type) {
  const messages = {
    login: 'Use this OTP to login to your account:',
    registration: 'Use this OTP to verify your email address:',
    password_reset: 'Use this OTP to reset your password:'
  };

  const message = messages[type] || messages.login;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fyaar - OTP</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #4a90e2;
          margin-bottom: 10px;
        }
        .otp-container {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #4a90e2;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          color: #4a90e2;
          letter-spacing: 4px;
          font-family: 'Courier New', monospace;
        }
        .message {
          margin-bottom: 20px;
          color: #666;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 10px;
          border-radius: 5px;
          margin-top: 20px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Fyaar</div>
        </div>

        <div class="message">
          <p>Hello!</p>
          <p>${message}</p>
        </div>

        <div class="otp-container">
          <div class="otp-code">${otp}</div>
        </div>

        <div class="message">
          <p>This OTP will expire in 10 minutes for security reasons.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>

        <div class="warning">
          <strong>Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for your OTP.
        </div>

        <div class="footer">
          <p>© 2024 Fyaar. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 * @param {string} type - Type of OTP (login, registration, password_reset)
 * @returns {Promise<Object>} Email response
 */
async function sendOTPEmail(to, otp, type = 'login') {
  try {
    const subject = getSubject(type);
    const html = getOTPEmailTemplate(otp, type);

    const messageData = {
      from: `Fyaar <postmaster@${domain}>`,
      to: [to],
      subject: subject,
      html: html
    };

    const response = await client.messages.create(domain, messageData);


    logger.info(`OTP email sent to ${to} for ${type}`);
    return response;
  } catch (error) {
    logger.error('Email service error:', error.message);
    throw new Error('Failed to send email');
  }
}

/**
 * Send welcome email
 * @param {string} to - Recipient email
 * @param {string} firstName - User's first name
 * @returns {Promise<Object>} Email response
 */
async function sendWelcomeEmail(to, firstName) {
  try {
    const messageData = {
      from: `Fyaar <noreply@${domain}>`,
      to: [to],
      subject: 'Welcome to Fyaar!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Fyaar</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #4a90e2;
              margin-bottom: 10px;
            }
            .welcome-message {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background-color: #e8f5e8;
              border-radius: 8px;
              border-left: 4px solid #28a745;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Fyaar</div>
            </div>

            <div class="welcome-message">
              <h2>Welcome to Fyaar, ${firstName}!</h2>
              <p>Thank you for joining our community. We're excited to have you on board!</p>
            </div>

            <div class="message">
              <p>Your account has been successfully created and verified. You can now:</p>
              <ul>
                <li>Login to your account</li>
                <li>Explore our features</li>
                <li>Start creating amazing content</li>
              </ul>
            </div>

            <div class="footer">
              <p>© 2024 Fyaar. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const response = await client.messages.create(domain, messageData);

    logger.info(`Welcome email sent to ${to}`);
    return response;
  } catch (error) {
    logger.error('Welcome email error:', error.message);
    throw new Error('Failed to send welcome email');
  }
}

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};
