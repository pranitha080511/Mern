import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendFeedbackEmail = async ({ userName, userEmail, orderId, rating, comment, photoPath }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log('⚠️ EMAIL_PASS not configured. Skipping email. Set EMAIL_USER and EMAIL_PASS in .env to enable.');
    return { sent: false, reason: 'Email credentials not configured' };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: { user: emailUser, pass: emailPass },
    tls: { rejectUnauthorized: false },
  });

  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

  let resolvedPhotoPath = photoPath;
  if (photoPath && !path.isAbsolute(photoPath)) {
    resolvedPhotoPath = path.join(__dirname, '..', photoPath);
  }

  const hasPhoto = resolvedPhotoPath && fs.existsSync(resolvedPhotoPath);

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1525; color: #f8f4f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      <div style="background: linear-gradient(135deg, #be185d, #7c3aed); padding: 24px 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; color: white;">🌸 New Product Feedback</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.85);">Hikari's Luxe - Order #${orderId}</p>
      </div>
      <div style="padding: 28px 32px;">
        <div style="background: rgba(255,255,255,0.06); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
          <p style="margin: 0 0 6px; font-size: 11px; color: rgba(248,244,240,0.5); text-transform: uppercase; letter-spacing: 1px;">Customer</p>
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #ffffff;">👤 ${userName}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: rgba(248,244,240,0.6);">📧 ${userEmail}</p>
        </div>
        <div style="background: rgba(255,255,255,0.06); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
          <p style="margin: 0 0 6px; font-size: 11px; color: rgba(248,244,240,0.5); text-transform: uppercase; letter-spacing: 1px;">Rating</p>
          <p style="margin: 0; font-size: 24px; color: #f59e0b;">${stars}</p>
        </div>
        <div style="background: rgba(255,255,255,0.06); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
          <p style="margin: 0 0 6px; font-size: 11px; color: rgba(248,244,240,0.5); text-transform: uppercase; letter-spacing: 1px;">Feedback</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #f8f4f0;">"${comment}"</p>
        </div>
        ${hasPhoto ? `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; text-align: center; margin-top: 16px;">
            <p style="margin: 0 0 10px; font-size: 11px; color: rgba(248,244,240,0.5); text-transform: uppercase; letter-spacing: 1px;">📷 Customer Product Photo</p>
            <img src="cid:productPhoto" alt="Customer Product Photo" style="max-width: 100%; height: auto; max-height: 320px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
          </div>
        ` : ''}
      </div>
      <div style="padding: 16px 32px; background: rgba(0,0,0,0.3); text-align: center; font-size: 12px; color: rgba(248,244,240,0.4); border-top: 1px solid rgba(255,255,255,0.05);">
        Hikari's Luxe Admin Portal
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

  if (hasPhoto) {
    mailOptions.attachments.push({
      filename: path.basename(resolvedPhotoPath),
      path: resolvedPhotoPath,
      cid: 'productPhoto',
    });
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Feedback email sent for order #${orderId} to ${emailUser} (MessageID: ${info.messageId}, Photo attached: ${hasPhoto})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send feedback email for order #${orderId}:`, error);
    return { sent: false, reason: error.message };
  }
};

export const sendNewProductEmail = async (product, emails) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log('⚠️ EMAIL_PASS not configured. Skipping new product email.');
    return { sent: false, reason: 'Email credentials not configured' };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: { user: emailUser, pass: emailPass },
    tls: { rejectUnauthorized: false },
  });

  const attachments = [];
  let imageHtml = '';

  if (product.image) {
    let localPath = null;
    if (product.image.startsWith('uploads/')) {
      localPath = path.join(__dirname, '..', product.image);
    } else if (product.image.startsWith('images/')) {
      localPath = path.join(__dirname, '..', '..', product.image);
    }

    if (localPath && fs.existsSync(localPath)) {
      attachments.push({
        filename: path.basename(localPath),
        path: localPath,
        cid: 'productImage',
      });
      imageHtml = `<div style="text-align: center; margin-bottom: 20px;"><img src="cid:productImage" alt="${product.name}" style="max-width: 100%; height: auto; max-height: 280px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" /></div>`;
    } else if (product.image.startsWith('http')) {
      imageHtml = `<div style="text-align: center; margin-bottom: 20px;"><img src="${product.image}" alt="${product.name}" style="max-width: 100%; height: auto; max-height: 280px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" /></div>`;
    }
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1525; color: #f8f4f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      <div style="background: linear-gradient(135deg, #be185d, #7c3aed); padding: 28px 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: white; letter-spacing: 0.5px;">🌸 New Launch Alert!</h1>
        <p style="margin: 6px 0 0; font-size: 14px; color: rgba(255,255,255,0.85); font-weight: 500;">Hikari's Luxe Cosmetics</p>
      </div>
      <div style="padding: 32px;">
        ${imageHtml}
        
        <p style="font-size: 16px; font-weight: 600; margin: 0 0 16px; color: #f8f4f0;">
          We just launched an exciting new arrival in our <span style="color: #e8b4b8; font-weight: 700;">${product.category}</span> collection!
        </p>
        
        <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #ffffff;">${product.name}</h2>
          <p style="margin: 0; font-size: 12px; color: rgba(248,244,240,0.6); text-transform: uppercase; letter-spacing: 1px;">Category: ${product.category}</p>
          <div style="margin-top: 14px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 24px; color: #e8b4b8; font-weight: 800;">₹${product.price}</span>
            <span style="background: rgba(16,185,129,0.2); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">Now Available</span>
          </div>
        </div>
        
        <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: rgba(248,244,240,0.8);">
          Be among the first to experience this new product. Visit our online store to check it out!
        </p>
      </div>
      <div style="padding: 20px 32px; background: rgba(0,0,0,0.3); text-align: center; font-size: 12px; color: rgba(248,244,240,0.4); border-top: 1px solid rgba(255,255,255,0.05);">
        © ${new Date().getFullYear()} Hikari's Luxe Cosmetics. All rights reserved.
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Hikari's Luxe" <${emailUser}>`,
    to: emailUser,
    bcc: emails,
    subject: `🌟 New Arrival: ${product.name}`,
    html: htmlContent,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ New product launch email successfully sent to ${emails.length} user(s)`);
    return { sent: true };
  } catch (error) {
    console.error('❌ Failed to send new product launch email:', error.message);
    return { sent: false, reason: error.message };
  }
};

