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
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 32px 16px;">
        <div style="max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 22px; font-weight: 800; tracking-wide: 0.5px;">⚡ TaskPulse Notification</h1>
            <p style="color: #e0e7ff; margin: 0; font-size: 13px; opacity: 0.9;">Automated Workspace Summary & Task Reminders</p>
          </div>

          <!-- Body Container -->
          <div style="padding: 24px;">
            <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-top: 0;">
              ${htmlText || 'Hello! Here is your scheduled TaskPulse automated digest and task summary.'}
            </p>

            ${tasksSummary && tasksSummary.length > 0 ? `
              <div style="margin: 20px 0;">
                <h3 style="color: #818cf8; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; tracking-wider: 1px;">📌 Task Overview & Details</h3>
                <table style="width: 100%; border-collapse: collapse; background: #020617; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; font-size: 13px;">
                  <thead>
                    <tr style="background: #1e293b; color: #94a3b8; text-align: left; font-size: 11px; text-transform: uppercase;">
                      <th style="padding: 10px 12px;">Task Title</th>
                      <th style="padding: 10px 12px;">Due Date</th>
                      <th style="padding: 10px 12px;">Priority / Tags</th>
                      <th style="padding: 10px 12px; text-align: right;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tasksSummary.map((t, idx) => `
                      <tr style="border-top: 1px solid #1e293b; color: #e2e8f0;">
                        <td style="padding: 10px 12px; font-weight: 600;">${t.title || 'Untitled Task'}</td>
                        <td style="padding: 10px 12px; color: #818cf8;">${t.dueDate || 'Today'}</td>
                        <td style="padding: 10px 12px; color: #fbbf24;">${t.tags ? t.tags.join(', ') : (t.starred ? 'Starred' : 'Normal')}</td>
                        <td style="padding: 10px 12px; text-align: right;">
                          <span style="background: ${t.completed ? '#065f46' : '#312e81'}; color: ${t.completed ? '#34d399' : '#a5b4fc'}; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold;">
                            ${t.completed ? 'COMPLETED' : 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            <!-- Proverb & Quote Banner (Enhancement 8) -->
            <div style="margin-top: 24px; padding: 16px 20px; background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; border-radius: 8px;">
              <p style="margin: 0 0 4px 0; font-size: 13px; font-style: italic; color: #c7d2fe; line-height: 1.5;">
                "The secret of getting ahead is getting started. Focus on being productive instead of busy."
              </p>
              <span style="font-size: 11px; font-weight: bold; color: #818cf8;">— Mark Twain & Tim Ferriss</span>
            </div>

            <!-- Footer -->
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b;">
              TaskPulse Automated Dispatcher • ${new Date().toLocaleTimeString()}
            </div>
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
