import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export const sendFeedbackEmail = async ({ userName, userEmail, orderId, rating, comment, photoPath }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log('⚠️ EMAIL_PASS not configured. Skipping email. Set EMAIL_USER and EMAIL_PASS in .env to enable.');
    return { sent: false, reason: 'Email credentials not configured' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass },
  });

  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #1a1525; color: #f8f4f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #be185d, #7c3aed); padding: 24px 32px;">
        <h1 style="margin: 0; font-size: 22px; color: white;">🌸 New Product Feedback</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.8);">Hikari's Luxe - Order #${orderId}</p>
      </div>
      <div style="padding: 28px 32px;">
        <div style="background: rgba(255,255,255,0.06); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px; font-size: 12px; color: rgba(248,244,240,0.5); text-transform: uppercase; letter-spacing: 1px;">Customer</p>
          <p style="margin: 0; font-size: 16px; font-weight: 700;">👤 ${userName}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: rgba(248,244,240,0.6);">📧 ${userEmail}</p>
        </div>
        <div style="background: rgba(255,255,255,0.06); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px; font-size: 12px; color: rgba(248,244,240,0.5); text-transform: uppercase; letter-spacing: 1px;">Rating</p>
          <p style="margin: 0; font-size: 24px; color: #f59e0b;">${stars}</p>
        </div>
        <div style="background: rgba(255,255,255,0.06); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px; font-size: 12px; color: rgba(248,244,240,0.5); text-transform: uppercase; letter-spacing: 1px;">Feedback</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6;">${comment}</p>
        </div>
        ${photoPath ? '<p style="font-size: 13px; color: rgba(248,244,240,0.6);">📷 Product photo attached below</p>' : ''}
      </div>
      <div style="padding: 16px 32px; background: rgba(0,0,0,0.3); text-align: center; font-size: 12px; color: rgba(248,244,240,0.4);">
        Hikari\'s Luxe Admin Portal
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Hikari's Luxe Feedback" <${emailUser}>`,
    to: emailUser,
    subject: `⭐ New Feedback - Order #${orderId} - ${stars}`,
    html: htmlContent,
    attachments: [],
  };

  if (photoPath && fs.existsSync(photoPath)) {
    mailOptions.attachments.push({
      filename: path.basename(photoPath),
      path: photoPath,
      cid: 'productPhoto',
    });
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Feedback email sent for order #${orderId}`);
    return { sent: true };
  } catch (error) {
    console.error('❌ Failed to send feedback email:', error.message);
    return { sent: false, reason: error.message };
  }
};
