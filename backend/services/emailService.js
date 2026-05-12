const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure email transporter
    // You can use Gmail, SendGrid, AWS SES, or any SMTP service
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // Your email
        pass: process.env.SMTP_PASS, // Your email password or app password
      },
    });
  }

  async sendTeamInvitation(toEmail, password, ownerEmail, loginUrl) {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Security Scanner'}" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: '🎉 You\'ve been invited to join an Enterprise Team!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-left: 4px solid #F59E0B; margin: 20px 0; }
            .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to the Team!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p><strong>${ownerEmail}</strong> has invited you to join their <strong>Enterprise Team</strong> on our Security Scanner platform!</p>
              
              <p>You now have full access to all Enterprise features under their subscription.</p>
              
              <div class="credentials">
                <h3>🔐 Your Login Credentials</h3>
                <p><strong>Email:</strong> ${toEmail}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
              </div>
              
              <p><strong>⚠️ Important:</strong> Please change your password after your first login for security.</p>
              
              <center>
                <a href="${loginUrl}" class="button">Login to Dashboard</a>
              </center>
              
              <h3>What you can do:</h3>
              <ul>
                <li>Run unlimited security scans</li>
                <li>Access all vulnerability reports</li>
                <li>Collaborate with your team</li>
                <li>Use all Enterprise features</li>
              </ul>
              
              <p>If you have any questions, feel free to contact your team administrator at <strong>${ownerEmail}</strong>.</p>
              
              <p>Best regards,<br>The Security Scanner Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} Security Scanner. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to the Team!
        
        ${ownerEmail} has invited you to join their Enterprise Team on our Security Scanner platform!
        
        Your Login Credentials:
        Email: ${toEmail}
        Password: ${password}
        Login URL: ${loginUrl}
        
        Please change your password after your first login for security.
        
        If you have any questions, contact your team administrator at ${ownerEmail}.
        
        Best regards,
        The Security Scanner Team
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendVerificationEmail(toEmail, verificationUrl) {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'CyberTrace Security'}" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: '✉️ Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #F59E0B; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thank you for registering with <strong>CyberTrace Security Scanner</strong>!</p>
              
              <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
              
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationUrl}</p>
              
              <div class="warning">
                <p><strong>⏰ Important:</strong> This verification link will expire in <strong>24 hours</strong>.</p>
              </div>
              
              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>Log in to your account</li>
                <li>Run security scans</li>
                <li>Access vulnerability reports</li>
                <li>Manage your security dashboard</li>
              </ul>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
              
              <p>Best regards,<br>The CyberTrace Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} CyberTrace Security Scanner. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Verify Your Email Address
        
        Thank you for registering with CyberTrace Security Scanner!
        
        To complete your registration and activate your account, please verify your email address by clicking this link:
        
        ${verificationUrl}
        
        This verification link will expire in 24 hours.
        
        Once verified, you'll be able to log in and start using all features.
        
        If you didn't create an account with us, please ignore this email.
        
        Best regards,
        The CyberTrace Team
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent to:', toEmail);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email server is ready to send messages');
      return true;
    } catch (error) {
      console.error('❌ Email server connection failed:', error);
      return false;
    }
  }
}

module.exports = EmailService;
