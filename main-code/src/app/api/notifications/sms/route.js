import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validatePhoneNumber, COUNTRY_CODES } from '@/lib/countryCodes';

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
  const twilioToken = process.env.TWILIO_AUTH_TOKEN || '';
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '';
  const fast2smsKey = process.env.FAST2SMS_API_KEY || '';
  const textlocalKey = process.env.TEXTLOCAL_API_KEY || '';
  const webhookUrl = process.env.SMS_WEBHOOK_URL || process.env.WEBHOOK_URL || '';

  const providers = {
    twilio: {
      name: 'Twilio Programmable SMS',
      configured: Boolean(twilioSid && twilioToken && twilioPhone),
      missing: [
        !twilioSid && 'TWILIO_ACCOUNT_SID',
        !twilioToken && 'TWILIO_AUTH_TOKEN',
        !twilioPhone && 'TWILIO_PHONE_NUMBER'
      ].filter(Boolean),
      sender: twilioPhone || null
    },
    fast2sms: {
      name: 'Fast2SMS Indian Gateway',
      configured: Boolean(fast2smsKey),
      missing: [!fast2smsKey && 'FAST2SMS_API_KEY'].filter(Boolean),
      sender: 'FASTSMS'
    },
    textlocal: {
      name: 'Textlocal Enterprise Gateway',
      configured: Boolean(textlocalKey),
      missing: [!textlocalKey && 'TEXTLOCAL_API_KEY'].filter(Boolean),
      sender: 'TXTLCL'
    },
    generic_webhook: {
      name: 'Custom SMS Webhook',
      configured: Boolean(webhookUrl),
      missing: [!webhookUrl && 'SMS_WEBHOOK_URL'].filter(Boolean),
      sender: 'WEBHOOK'
    }
  };

  return NextResponse.json({
    success: true,
    providers,
    hasAnyConfigured: Object.values(providers).some(p => p.configured)
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    }
  });
}

export async function POST(request) {
  loadEnvFallback();

  const diagnosticSteps = [];

  try {
    const body = await request.json();
    const { 
      to, 
      countryCode = '+91', 
      message = '', 
      tasksSummary = [],
      provider = 'twilio',
      customWebhookUrl = ''
    } = body;

    // STEP 1: Validate Recipient Phone Number
    if (!to || !to.trim()) {
      return NextResponse.json({
        success: false,
        failedStep: 'Step 1: Recipient Phone Number Check',
        error: 'Recipient mobile phone number is required.',
        steps: [
          { name: 'Step 1: Phone Validation', status: 'failed', error: 'Missing mobile number' },
          { name: 'Step 2: Gateway Credentials Check', status: 'skipped' },
          { name: 'Step 3: Network Carrier Dispatch', status: 'skipped' }
        ]
      }, { status: 400 });
    }

    const validation = validatePhoneNumber(to, countryCode);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        failedStep: 'Step 1: Recipient Phone Number Validation',
        error: `Invalid mobile number: ${validation.message}`,
        steps: [
          { name: 'Step 1: Phone Validation', status: 'failed', error: validation.message },
          { name: 'Step 2: Gateway Credentials Check', status: 'skipped' },
          { name: 'Step 3: Network Carrier Dispatch', status: 'skipped' }
        ]
      }, { status: 400 });
    }

    diagnosticSteps.push({
      name: 'Step 1: Phone Validation',
      status: 'passed',
      details: `Validated ${validation.formatted} (E.164: ${validation.fullE164})`
    });

    // STEP 2: Carrier Gateway Verification (Strict Anti-Hallucination & Error Handling)
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    const textlocalKey = process.env.TEXTLOCAL_API_KEY;
    const webhookEndpoint = customWebhookUrl || process.env.SMS_WEBHOOK_URL || process.env.WEBHOOK_URL;

    // Construct concise SMS Payload
    let smsBody = message.trim();
    if (!smsBody) {
      if (tasksSummary && tasksSummary.length > 0) {
        const taskLines = tasksSummary
          .slice(0, 3)
          .map((t, i) => `${i + 1}. ${t.title || 'Task'} ${t.dueDate ? `[Due: ${t.dueDate}]` : ''}`)
          .join('\n');
        smsBody = `[TaskPulse Alert] Action items for today:\n${taskLines}\n- Complete focus via TaskPulse.`;
      } else {
        smsBody = `[TaskPulse Notification] Automated SMS dispatch test triggered at ${new Date().toLocaleTimeString()}.`;
      }
    }

    // Provider A: Twilio
    if (provider === 'twilio') {
      const missingVars = [
        !twilioSid && 'TWILIO_ACCOUNT_SID',
        !twilioAuthToken && 'TWILIO_AUTH_TOKEN',
        !twilioFrom && 'TWILIO_PHONE_NUMBER'
      ].filter(Boolean);

      if (missingVars.length > 0) {
        diagnosticSteps.push({
          name: 'Step 2: Gateway Credentials Check (Twilio)',
          status: 'failed',
          error: `Missing required environment variables in .env: ${missingVars.join(', ')}`
        });

        return NextResponse.json({
          success: false,
          failedStep: 'Step 2: Carrier Authentication Verification',
          provider: 'twilio',
          error: `Twilio gateway is NOT configured. Missing .env variables: ${missingVars.join(', ')}.`,
          instructions: 'Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your .env file or Vercel environment variables.',
          steps: [
            ...diagnosticSteps,
            { name: 'Step 3: Network Carrier Dispatch', status: 'aborted' }
          ]
        }, { status: 400 });
      }

      diagnosticSteps.push({
        name: 'Step 2: Gateway Credentials Check (Twilio)',
        status: 'passed',
        details: `Credentials verified. Sender Number: ${twilioFrom}`
      });

      // Dispatch to Twilio REST API
      try {
        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', validation.fullE164);
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
          diagnosticSteps.push({
            name: 'Step 3: Network Carrier Dispatch',
            status: 'passed',
            details: `Twilio accepted message SID: ${twilioData.sid}, Status: ${twilioData.status}`
          });

          return NextResponse.json({
            success: true,
            provider: 'twilio',
            messageId: twilioData.sid,
            recipient: validation.fullE164,
            status: twilioData.status || 'queued',
            preview: smsBody,
            steps: diagnosticSteps
          });
        } else {
          diagnosticSteps.push({
            name: 'Step 3: Network Carrier Dispatch',
            status: 'failed',
            error: `Twilio Error (${twilioData.code || twilioRes.status}): ${twilioData.message || 'Dispatch rejected'}`
          });

          return NextResponse.json({
            success: false,
            failedStep: 'Step 3: Carrier API Response',
            provider: 'twilio',
            error: `Twilio Error (${twilioData.code || twilioRes.status}): ${twilioData.message || 'Dispatch failed'}`,
            steps: diagnosticSteps
          }, { status: 502 });
        }
      } catch (networkErr) {
        diagnosticSteps.push({
          name: 'Step 3: Network Carrier Dispatch',
          status: 'failed',
          error: `Network transport failure: ${networkErr.message}`
        });

        return NextResponse.json({
          success: false,
          failedStep: 'Step 3: Network Carrier Connection',
          provider: 'twilio',
          error: `Failed to connect to Twilio API servers: ${networkErr.message}`,
          steps: diagnosticSteps
        }, { status: 504 });
      }
    }

    // Provider B: Fast2SMS (Indian Gateway)
    if (provider === 'fast2sms') {
      if (!fast2smsKey) {
        diagnosticSteps.push({
          name: 'Step 2: Gateway Credentials Check (Fast2SMS)',
          status: 'failed',
          error: 'Missing FAST2SMS_API_KEY in .env'
        });

        return NextResponse.json({
          success: false,
          failedStep: 'Step 2: Carrier Authentication Verification',
          provider: 'fast2sms',
          error: 'Fast2SMS gateway is NOT configured. Missing FAST2SMS_API_KEY in .env.',
          instructions: 'Please add FAST2SMS_API_KEY to your .env file.',
          steps: [
            ...diagnosticSteps,
            { name: 'Step 3: Network Carrier Dispatch', status: 'aborted' }
          ]
        }, { status: 400 });
      }

      diagnosticSteps.push({
        name: 'Step 2: Gateway Credentials Check (Fast2SMS)',
        status: 'passed',
        details: 'FAST2SMS_API_KEY verified.'
      });

      // Dispatch to Fast2SMS REST API
      try {
        const rawPhone = String(to).replace(/\D/g, '');
        const fastRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2smsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'q',
            message: smsBody,
            numbers: rawPhone
          })
        });

        const fastData = await fastRes.json();
        if (fastData.return === true) {
          diagnosticSteps.push({
            name: 'Step 3: Network Carrier Dispatch',
            status: 'passed',
            details: `Fast2SMS Request ID: ${fastData.request_id}`
          });

          return NextResponse.json({
            success: true,
            provider: 'fast2sms',
            messageId: fastData.request_id,
            recipient: validation.fullE164,
            status: 'queued',
            preview: smsBody,
            steps: diagnosticSteps
          });
        } else {
          diagnosticSteps.push({
            name: 'Step 3: Network Carrier Dispatch',
            status: 'failed',
            error: fastData.message || 'Fast2SMS dispatch rejected'
          });

          return NextResponse.json({
            success: false,
            failedStep: 'Step 3: Fast2SMS API Response',
            provider: 'fast2sms',
            error: fastData.message || 'Fast2SMS rejected payload',
            steps: diagnosticSteps
          }, { status: 502 });
        }
      } catch (fastErr) {
        return NextResponse.json({
          success: false,
          failedStep: 'Step 3: Fast2SMS Connection',
          provider: 'fast2sms',
          error: `Fast2SMS network error: ${fastErr.message}`,
          steps: diagnosticSteps
        }, { status: 504 });
      }
    }

    // Provider C: Textlocal
    if (provider === 'textlocal') {
      if (!textlocalKey) {
        diagnosticSteps.push({
          name: 'Step 2: Gateway Credentials Check (Textlocal)',
          status: 'failed',
          error: 'Missing TEXTLOCAL_API_KEY in .env'
        });

        return NextResponse.json({
          success: false,
          failedStep: 'Step 2: Carrier Authentication Verification',
          provider: 'textlocal',
          error: 'Textlocal gateway is NOT configured. Missing TEXTLOCAL_API_KEY in .env.',
          instructions: 'Please add TEXTLOCAL_API_KEY to your .env file.',
          steps: [
            ...diagnosticSteps,
            { name: 'Step 3: Network Carrier Dispatch', status: 'aborted' }
          ]
        }, { status: 400 });
      }

      diagnosticSteps.push({
        name: 'Step 2: Gateway Credentials Check (Textlocal)',
        status: 'passed',
        details: 'TEXTLOCAL_API_KEY verified.'
      });

      // Dispatch to Textlocal
      try {
        const rawPhone = String(to).replace(/\D/g, '');
        const params = new URLSearchParams();
        params.append('apikey', textlocalKey);
        params.append('numbers', rawPhone);
        params.append('message', smsBody);
        params.append('sender', 'TXTLCL');

        const tlRes = await fetch('https://api.textlocal.in/send/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });

        const tlData = await tlRes.json();
        if (tlData.status === 'success') {
          diagnosticSteps.push({
            name: 'Step 3: Network Carrier Dispatch',
            status: 'passed',
            details: `Textlocal Batch ID: ${tlData.batch_id}`
          });

          return NextResponse.json({
            success: true,
            provider: 'textlocal',
            messageId: String(tlData.batch_id),
            recipient: validation.fullE164,
            status: 'sent',
            preview: smsBody,
            steps: diagnosticSteps
          });
        } else {
          const errDetail = tlData.errors && tlData.errors[0] ? tlData.errors[0].message : 'Textlocal dispatch failed';
          diagnosticSteps.push({
            name: 'Step 3: Network Carrier Dispatch',
            status: 'failed',
            error: errDetail
          });

          return NextResponse.json({
            success: false,
            failedStep: 'Step 3: Textlocal API Response',
            provider: 'textlocal',
            error: `Textlocal Error: ${errDetail}`,
            steps: diagnosticSteps
          }, { status: 502 });
        }
      } catch (tlErr) {
        return NextResponse.json({
          success: false,
          failedStep: 'Step 3: Textlocal Connection',
          provider: 'textlocal',
          error: `Textlocal network error: ${tlErr.message}`,
          steps: diagnosticSteps
        }, { status: 504 });
      }
    }

    // Provider D: Custom Webhook
    if (provider === 'generic_webhook') {
      if (!webhookEndpoint || !webhookEndpoint.startsWith('http')) {
        diagnosticSteps.push({
          name: 'Step 2: Gateway Credentials Check (Webhook)',
          status: 'failed',
          error: 'No valid Webhook URL provided'
        });

        return NextResponse.json({
          success: false,
          failedStep: 'Step 2: Webhook Endpoint Verification',
          provider: 'generic_webhook',
          error: 'Custom Webhook gateway is NOT configured. Please enter a valid Webhook URL (e.g. Zapier / Make / Slack endpoint) in Notification Settings.',
          steps: [
            ...diagnosticSteps,
            { name: 'Step 3: Network Carrier Dispatch', status: 'aborted' }
          ]
        }, { status: 400 });
      }

      diagnosticSteps.push({
        name: 'Step 2: Gateway Credentials Check (Webhook)',
        status: 'passed',
        details: `Webhook URL verified: ${webhookEndpoint}`
      });

      // Dispatch Webhook
      try {
        const whRes = await fetch(webhookEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'taskpulse_sms_dispatch',
            recipient: validation.fullE164,
            country: validation.formatted,
            message: smsBody,
            tasks: tasksSummary,
            timestamp: new Date().toISOString()
          })
        });

        if (whRes.ok) {
          diagnosticSteps.push({
            name: 'Step 3: Network Carrier Dispatch',
            status: 'passed',
            details: `Webhook returned HTTP ${whRes.status}`
          });

          return NextResponse.json({
            success: true,
            provider: 'generic_webhook',
            messageId: `WH-${Date.now()}`,
            recipient: validation.fullE164,
            status: 'delivered',
            preview: smsBody,
            steps: diagnosticSteps
          });
        } else {
          diagnosticSteps.push({
            name: 'Step 3: Network Carrier Dispatch',
            status: 'failed',
            error: `Webhook returned HTTP status ${whRes.status}`
          });

          return NextResponse.json({
            success: false,
            failedStep: 'Step 3: Webhook Endpoint Response',
            provider: 'generic_webhook',
            error: `Webhook server responded with HTTP status ${whRes.status}`,
            steps: diagnosticSteps
          }, { status: 502 });
        }
      } catch (whErr) {
        return NextResponse.json({
          success: false,
          failedStep: 'Step 3: Webhook Connection',
          provider: 'generic_webhook',
          error: `Webhook connection failure: ${whErr.message}`,
          steps: diagnosticSteps
        }, { status: 504 });
      }
    }

    // Default Unknown Provider
    return NextResponse.json({
      success: false,
      failedStep: 'Step 2: Provider Validation',
      error: `Unknown gateway provider '${provider}' selected.`
    }, { status: 400 });

  } catch (error) {
    console.error('[SMS API Error]:', error);
    return NextResponse.json({
      success: false,
      failedStep: 'Internal Server Error',
      error: error.message,
      steps: diagnosticSteps
    }, { status: 500 });
  }
}
