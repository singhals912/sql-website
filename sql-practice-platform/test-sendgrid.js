// Quick SendGrid test
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
        user: 'apikey',
        pass: 'YOUR_SENDGRID_API_KEY_HERE'  // Replace with your actual key
    }
});

const testEmail = async () => {
    try {
        const result = await transporter.sendMail({
            from: 'noreply@datasql.pro',
            to: 'singhals912@gmail.com',
            subject: 'SendGrid Test from datasql.pro',
            html: '<h2>Test Email</h2><p>If you receive this, SendGrid is working!</p>',
            text: 'Test Email - If you receive this, SendGrid is working!'
        });
        
        console.log('✅ Email sent successfully:', result.messageId);
    } catch (error) {
        console.error('❌ Email failed:', error.message);
    }
};

testEmail();