const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email service configuration
const createEmailTransporter = () => {
    // Check for email service configuration
    if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Use app-specific password
            }
        });
    } 
    else if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    else {
        console.warn('⚠️  No email service configured. Using console logging for development.');
        return null;
    }
};

const transporter = createEmailTransporter();

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Generate secure verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Email templates
const emailTemplates = {
    verification: (otp, userFullName) => ({
        subject: 'Verify Your SQL Practice Platform Account',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: #4c51bf; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0; letter-spacing: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                .warning { background: #fed7d7; border: 1px solid #fc8181; color: #c53030; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Verify Your Account</h1>
                    <p>SQL Practice Platform</p>
                </div>
                <div class="content">
                    <h2>Hello ${userFullName || 'there'}!</h2>
                    <p>Welcome to SQL Practice Platform! Please verify your email address using the code below:</p>
                    
                    <div class="otp-box">${otp}</div>
                    
                    <p><strong>This verification code will expire in 15 minutes.</strong></p>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>Never share this code with anyone</li>
                            <li>We will never ask for this code via phone or email</li>
                            <li>If you didn't create an account, please ignore this email</li>
                        </ul>
                    </div>
                    
                    <p>If you have any questions, please contact our support team.</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} SQL Practice Platform. All rights reserved.</p>
                    <p>This email was sent to verify your account registration.</p>
                </div>
            </div>
        </body>
        </html>
        `,
        text: `
Welcome to SQL Practice Platform!

Your verification code is: ${otp}

This code will expire in 15 minutes.

If you didn't create an account, please ignore this email.

© ${new Date().getFullYear()} SQL Practice Platform
        `
    }),

    passwordReset: (resetToken, userFullName) => ({
        subject: 'Reset Your SQL Practice Platform Password',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .reset-button { display: inline-block; background: #4c51bf; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                .warning { background: #fed7d7; border: 1px solid #fc8181; color: #c53030; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔑 Password Reset</h1>
                    <p>SQL Practice Platform</p>
                </div>
                <div class="content">
                    <h2>Hello ${userFullName || 'there'}!</h2>
                    <p>You requested a password reset for your SQL Practice Platform account.</p>
                    
                    <p>Click the button below to reset your password:</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}" class="reset-button">
                        Reset My Password
                    </a>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                        ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}
                    </p>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>This link will expire in 1 hour</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Your password will remain unchanged until you create a new one</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} SQL Practice Platform. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `,
        text: `
Password Reset - SQL Practice Platform

Hello ${userFullName || 'there'}!

You requested a password reset. Click this link to reset your password:
${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}

This link will expire in 1 hour.

If you didn't request this reset, please ignore this email.

© ${new Date().getFullYear()} SQL Practice Platform
        `
    })
};

// Send email function
const sendEmail = async (to, template, templateData = {}) => {
    try {
        if (!transporter) {
            // Development mode - log to console
            console.log('📧 EMAIL SENT (Console Mode):');
            console.log('To:', to);
            console.log('Subject:', template.subject);
            console.log('Content:', template.text);
            console.log('---');
            return { success: true, messageId: 'console-' + Date.now() };
        }

        const mailOptions = {
            from: `"SQL Practice Platform" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: to,
            subject: template.subject,
            text: template.text,
            html: template.html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };

    } catch (error) {
        console.error('📧 Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Verification email
const sendVerificationEmail = async (email, otp, userFullName = null) => {
    const template = emailTemplates.verification(otp, userFullName);
    return await sendEmail(email, template);
};

// Password reset email
const sendPasswordResetEmail = async (email, resetToken, userFullName = null) => {
    const template = emailTemplates.passwordReset(resetToken, userFullName);
    return await sendEmail(email, template);
};

// Test email configuration
const testEmailConfig = async () => {
    try {
        if (!transporter) {
            return { success: false, message: 'No email transporter configured' };
        }

        await transporter.verify();
        return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

module.exports = {
    generateOTP,
    generateVerificationToken,
    sendVerificationEmail,
    sendPasswordResetEmail,
    testEmailConfig,
    sendEmail
};