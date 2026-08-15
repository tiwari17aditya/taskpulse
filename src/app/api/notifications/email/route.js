import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { to, subject, htmlText, tasksSummary } = body;

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const fromEmail = process.env.SMTP_FROM_EMAIL || `"TaskPulse" <${user || 'noreply@taskpulse.app'}>`;

    const missing = [];
    if (!host) missing.push('SMTP_HOST');
    if (!user) missing.push('SMTP_USER');
    if (!pass) missing.push('SMTP_PASS');

    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        configured: false,
        error: `SMTP credentials missing in .env (${missing.join(', ')})`,
        missingVars: missing
      }, { status: 400 });
    }

    // Dynamic import nodemailer
    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });

    const defaultHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #090d16; color: #f1f5f9; padding: 24px; borderRadius: 16px;">
        <div style="max-width: 550px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #818cf8; margin: 0; font-size: 20px;">🚀 TaskPulse Notification</h2>
            <span style="font-size: 11px; background: #312e81; color: #c7d2fe; padding: 4px 8px; border-radius: 9999px; font-weight: bold;">Daily Reminder</span>
          </div>

          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            ${htmlText || 'Here is your automated TaskPulse reminder for upcoming tasks & routines.'}
          </p>

          ${tasksSummary ? `
            <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <h4 style="margin: 0 0 10px 0; color: #f59e0b; font-size: 13px;">📌 Today's Focus Items:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 13px;">
                ${tasksSummary.map(t => `<li style="margin-bottom: 6px;"><strong>${t.title}</strong> ${t.dueDate ? `(Due: ${t.dueDate})` : ''}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b;">
            Sent automatically by TaskPulse SMTP Dispatcher • ${new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: fromEmail,
      to: to || user,
      subject: subject || 'TaskPulse Automated Reminder & Focus Summary ⏰',
      html: defaultHtml
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      configured: true,
      messageId: info.messageId,
      response: info.response
    });

  } catch (error) {
    console.error('SMTP Dispatch Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to dispatch email via SMTP server.'
    }, { status: 500 });
  }
}
