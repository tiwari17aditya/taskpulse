import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validatePhoneNumber } from '@/lib/countryCodes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function loadEnvFallback() {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'main-code/.env'),
    path.resolve(process.cwd(), 'main-code/.env.local'),
    path.resolve(__dirname, '../../../../.env'),
    path.resolve(__dirname, '../../../../../.env')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [k, ...v] = trimmed.split('=');
            const val = v.join('=').trim().replace(/^["']|["']$/g, '');
            if (k && !process.env[k.trim()]) {
              process.env[k.trim()] = val;
            }
          }
        });
      } catch (err) {
        console.warn(`[SMS API] Failed to parse env file at ${p}:`, err.message);
      }
    }
  }
}

export async function GET() {
  loadEnvFallback();
  
  const twilioSid = process.env.TWILIO_ACCOUNT_SID || '';
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '';
  const smsProvider = process.env.SMS_PROVIDER || (twilioSid ? 'twilio' : 'sandbox');
  const isConfigured = Boolean(twilioSid && process.env.TWILIO_AUTH_TOKEN && twilioPhone);

  return NextResponse.json({
    success: true,
    configured: isConfigured,
    provider: smsProvider,
    senderNumber: twilioPhone ? twilioPhone.replace(/(\d{3})\d+(\d{4})/, '$1****$2') : 'TaskPulse SMS Hub',
    status: isConfigured ? 'Active Carrier Connected' : 'Sandbox Simulation Ready'
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    }
  });
}

export async function POST(request) {
  loadEnvFallback();

  try {
    const body = await request.json();
    const { 
      to, 
      countryCode = '+91', 
      message = '', 
      tasksSummary = [],
      provider = 'twilio'
    } = body;

    if (!to || !to.trim()) {
      return NextResponse.json(
        { success: false, error: 'Recipient mobile phone number is required' },
        { status: 400 }
      );
    }

    const validation = validatePhoneNumber(to, countryCode);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: `Invalid mobile number: ${validation.message}` },
        { status: 400 }
      );
    }

    const fullRecipientNumber = validation.fullE164;
    
    // Construct SMS Text Payload (Concise for SMS limits)
    let smsBody = message.trim();
    if (!smsBody) {
      if (tasksSummary && tasksSummary.length > 0) {
        const taskLines = tasksSummary
          .slice(0, 3)
          .map((t, i) => `${i + 1}. ${t.title || 'Task'} ${t.dueDate ? `[Due: ${t.dueDate}]` : ''}`)
          .join('\n');
        smsBody = `[TaskPulse Alert] Action items for today:\n${taskLines}\n- Completed focus via TaskPulse.`;
      } else {
        smsBody = `[TaskPulse Notification] Your automated SMS dispatch is active and functioning properly!`;
      }
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    // 1. Live Twilio Carrier Dispatch
    if (twilioSid && twilioAuthToken && twilioFrom) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', fullRecipientNumber);
        params.append('From', twilioFrom);
        params.append('Body', smsBody);

        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
          }
        );

        const twilioData = await twilioRes.json();
        if (twilioRes.ok) {
          return NextResponse.json({
            success: true,
            mode: 'live',
            provider: 'twilio',
            messageId: twilioData.sid,
            recipient: fullRecipientNumber,
            status: twilioData.status || 'queued',
            preview: smsBody
          });
        } else {
          return NextResponse.json({
            success: false,
            error: twilioData.message || 'Twilio dispatch failed'
          }, { status: 500 });
        }
      } catch (err) {
        console.error('[SMS API] Live carrier error:', err);
        return NextResponse.json({
          success: false,
          error: `Carrier dispatch error: ${err.message}`
        }, { status: 500 });
      }
    }

    // 2. High-Fidelity Sandbox Simulation
    const mockMessageId = `SM${Math.random().toString(36).substring(2, 10).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
    
    return NextResponse.json({
      success: true,
      mode: 'sandbox_simulation',
      provider: provider || 'sandbox',
      messageId: mockMessageId,
      recipient: fullRecipientNumber,
      country: validation.formatted,
      status: 'DELIVERED (Sandbox Simulation)',
      timestamp: new Date().toISOString(),
      preview: smsBody,
      notice: 'Twilio API keys not present in .env. Dispatched via TaskPulse Mock SMS Gateway with 100% payload validation.'
    });

  } catch (error) {
    console.error('[SMS API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
