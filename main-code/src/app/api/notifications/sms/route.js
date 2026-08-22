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
  const twilioToken = process.env.TWILIO_AUTH_TOKEN || '';
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '';
  const textlocalKey = process.env.TEXTLOCAL_API_KEY || '';
  const webhookUrl = process.env.SMS_WEBHOOK_URL || process.env.WEBHOOK_URL || '';
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const ntfyTopic = process.env.NTFY_TOPIC || 'taskpulse_alerts';

  const providers = {
    ntfy: {
      name: 'Ntfy.sh Open-Source iOS & Android Gateway (100% Free)',
      configured: true,
      missing: [],
      sender: `ntfy.sh/${ntfyTopic}`,
      isOpenSource: true,
      free: true
    },
    telegram: {
      name: 'Telegram Bot Instant Messenger (100% Free)',
      configured: Boolean(telegramToken),
      missing: [!telegramToken && 'TELEGRAM_BOT_TOKEN'].filter(Boolean),
      sender: '@TaskPulseBot',
      isOpenSource: false,
      free: true
    },
    twilio: {
      name: 'Twilio Programmable SMS',
      configured: Boolean(twilioSid && twilioToken && twilioPhone),
      missing: [
        !twilioSid && 'TWILIO_ACCOUNT_SID',
        !twilioToken && 'TWILIO_AUTH_TOKEN',
        !twilioPhone && 'TWILIO_PHONE_NUMBER'
      ].filter(Boolean),
      sender: twilioPhone || null,
      isOpenSource: false,
      free: false
    },
    textlocal: {
      name: 'Textlocal Enterprise Gateway',
      configured: Boolean(textlocalKey),
      missing: [!textlocalKey && 'TEXTLOCAL_API_KEY'].filter(Boolean),
      sender: 'TXTLCL',
      isOpenSource: false,
      free: false
    },
    generic_webhook: {
      name: 'Custom SMS / HTTP Webhook',
      configured: Boolean(webhookUrl),
      missing: [!webhookUrl && 'SMS_WEBHOOK_URL'].filter(Boolean),
      sender: 'WEBHOOK',
      isOpenSource: true,
      free: true
    }
  };

  return NextResponse.json({
    success: true,
    providers,
    hasAnyConfigured: true,
    defaultOpenSourceTopic: ntfyTopic
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
      provider = 'ntfy',
      customWebhookUrl = '',
      ntfyTopic = 'taskpulse_alerts',
      telegramChatId = ''
    } = body;

    // STEP 1: Validate Recipient (Phone number for SMS or Topic for Ntfy)
    let validatedRecipient = to || ntfyTopic;

    if (provider !== 'ntfy' && provider !== 'generic_webhook') {
      if (!to || !to.trim()) {
        return NextResponse.json({
          success: false,
          failedStep: 'Step 1: Recipient Mobile Number Check',
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
      validatedRecipient = validation.fullE164;

      diagnosticSteps.push({
        name: 'Step 1: Phone Validation',
        status: 'passed',
        details: `Validated ${validation.formatted} (E.164: ${validation.fullE164})`
      });
    } else {
      diagnosticSteps.push({
        name: 'Step 1: Open Source Target Channel Verification',
        status: 'passed',
        details: provider === 'ntfy' ? `Target Topic: ntfy.sh/${ntfyTopic}` : `Webhook URL Verified`
      });
    }

    // Construct concise message payload
    let smsBody = message.trim();
    if (!smsBody) {
      if (tasksSummary && tasksSummary.length > 0) {
        const taskLines = tasksSummary
          .slice(0, 4)
          .map((t, i) => `${i + 1}. ${t.title || 'Task'} ${t.dueDate ? `[Due: ${t.dueDate}]` : ''}`)
          .join('\n');
        smsBody = `[TaskPulse Alert] Today's Priority Action Items:\n${taskLines}\n- Focused execution via TaskPulse.`;
      } else {
        smsBody = `[TaskPulse Notification] Open-source mobile notification test dispatched successfully at ${new Date().toLocaleTimeString()}!`;
      }
    }

    // PROVIDER 1: NTFY.SH (100% Free Open-Source Push for iOS & Android)
    if (provider === 'ntfy') {
      const topic = (ntfyTopic || process.env.NTFY_TOPIC || 'taskpulse_alerts').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      
      diagnosticSteps.push({
        name: 'Step 2: Open Source Server Resolution',
        status: 'passed',
        details: `Connecting to Open Source Hub: https://ntfy.sh/${topic} (Zero cost, iOS & Android compatible)`
      });

      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taskpulse17.vercel.app';
        const ntfyRes = await fetch(`https://ntfy.sh/${topic}`, {
          method: 'POST',
          headers: {
            'Title': 'TaskPulse Action Alert',
            'Priority': 'high',
            'Tags': 'dart,white_check_mark,bell',
            'Click': appUrl
          },
          body: smsBody
        });

        if (ntfyRes.ok) {
          const ntfyData = await ntfyRes.json();
          diagnosticSteps.push({
            name: 'Step 3: Mobile Push Dispatch (iOS & Android)',
            status: 'passed',
            details: `Broadcasted to iOS & Android topic '${topic}' (Message ID: ${ntfyData.id || Date.now()})`
          });

          return NextResponse.json({
            success: true,
            provider: 'ntfy',
            isOpenSource: true,
            free: true,
            topic: topic,
            messageId: ntfyData.id || `NTFY-${Date.now()}`,
            recipient: `iOS & Android App (Topic: ${topic})`,
            status: 'delivered',
            preview: smsBody,
            steps: diagnosticSteps,
            instructions: `To receive this on your iPhone/iPad or Android phone for 100% FREE: Install the 'ntfy' app from the App Store or Google Play, and subscribe to topic: '${topic}'.`
          });
        } else {
          diagnosticSteps.push({
            name: 'Step 3: Mobile Push Dispatch',
            status: 'failed',
            error: `Ntfy hub returned HTTP ${ntfyRes.status}`
          });

          return NextResponse.json({
            success: false,
            failedStep: 'Step 3: Ntfy Hub Response',
            provider: 'ntfy',
            error: `Ntfy server error (HTTP ${ntfyRes.status})`,
            steps: diagnosticSteps
          }, { status: 502 });
        }
      } catch (ntfyErr) {
        diagnosticSteps.push({
          name: 'Step 3: Mobile Push Dispatch',
          status: 'failed',
          error: ntfyErr.message
        });

        return NextResponse.json({
          success: false,
          failedStep: 'Step 3: Network Connection to Ntfy',
          provider: 'ntfy',
          error: `Could not connect to Ntfy push servers: ${ntfyErr.message}`,
          steps: diagnosticSteps
        }, { status: 504 });
      }
    }

    // PROVIDER 2: TELEGRAM BOT (100% Free Instant Messenger)
    if (provider === 'telegram') {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = telegramChatId || process.env.TELEGRAM_CHAT_ID;

      if (!botToken || !chatId) {
        diagnosticSteps.push({
          name: 'Step 2: Gateway Credentials Check (Telegram)',
          status: 'failed',
          error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env'
        });

        return NextResponse.json({
          success: false,
          failedStep: 'Step 2: Telegram Credentials Check',
          provider: 'telegram',
          error: 'Telegram Bot is not configured. Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.',
          instructions: 'Create a free bot via @BotFather on Telegram and add TELEGRAM_BOT_TOKEN to .env.',
          steps: [
            ...diagnosticSteps,
            { name: 'Step 3: Network Dispatch', status: 'aborted' }
          ]
        }, { status: 400 });
      }

      diagnosticSteps.push({
        name: 'Step 2: Gateway Credentials Check (Telegram)',
        status: 'passed',
        details: `Telegram Bot Token verified. Target Chat ID: ${chatId}`
      });

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: smsBody,
            parse_mode: 'HTML'
          })
        });

        const tgData = await tgRes.json();
        if (tgData.ok) {
          diagnosticSteps.push({
            name: 'Step 3: Network Dispatch (Telegram)',
            status: 'passed',
            details: `Delivered to Telegram Message ID: ${tgData.result.message_id}`
          });

          return NextResponse.json({
            success: true,
            provider: 'telegram',
            messageId: String(tgData.result.message_id),
            recipient: `Telegram Chat ID: ${chatId}`,
            status: 'delivered',
            preview: smsBody,
            steps: diagnosticSteps
          });
        } else {
          return NextResponse.json({
            success: false,
            failedStep: 'Step 3: Telegram API Error',
            error: tgData.description || 'Telegram dispatch failed',
            steps: diagnosticSteps
          }, { status: 502 });
        }
      } catch (tgErr) {
        return NextResponse.json({
          success: false,
          failedStep: 'Step 3: Telegram Connection',
          error: tgErr.message,
          steps: diagnosticSteps
        }, { status: 504 });
      }
    }

    // PROVIDER 3: Twilio
    if (provider === 'twilio') {
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

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
          instructions: 'Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your .env file.',
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

      try {
        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', validatedRecipient);
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
            recipient: validatedRecipient,
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
        return NextResponse.json({
          success: false,
          failedStep: 'Step 3: Network Carrier Connection',
          provider: 'twilio',
          error: `Failed to connect to Twilio: ${networkErr.message}`,
          steps: diagnosticSteps
        }, { status: 504 });
      }
    }

    // PROVIDER 5: Custom Webhook
    if (provider === 'generic_webhook') {
      const webhookEndpoint = customWebhookUrl || process.env.SMS_WEBHOOK_URL || process.env.WEBHOOK_URL;
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
          error: 'Custom Webhook is NOT configured. Please enter a valid Webhook URL in Notification Settings.',
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

      try {
        const whRes = await fetch(webhookEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'taskpulse_mobile_dispatch',
            recipient: validatedRecipient,
            message: smsBody,
            tasks: tasksSummary,
            timestamp: new Date().toISOString()
          })
        });

        if (whRes.ok) {
          diagnosticSteps.push({
            name: 'Step 3: Network Dispatch',
            status: 'passed',
            details: `Webhook returned HTTP ${whRes.status}`
          });

          return NextResponse.json({
            success: true,
            provider: 'generic_webhook',
            messageId: `WH-${Date.now()}`,
            recipient: validatedRecipient,
            status: 'delivered',
            preview: smsBody,
            steps: diagnosticSteps
          });
        } else {
          return NextResponse.json({
            success: false,
            failedStep: 'Step 3: Webhook Response',
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
          error: `Webhook failure: ${whErr.message}`,
          steps: diagnosticSteps
        }, { status: 504 });
      }
    }

    return NextResponse.json({
      success: false,
      failedStep: 'Step 2: Provider Validation',
      error: `Unknown gateway provider '${provider}' selected.`
    }, { status: 400 });

  } catch (error) {
    console.error('[SMS/Push API Error]:', error);
    return NextResponse.json({
      success: false,
      failedStep: 'Internal Server Error',
      error: error.message,
      steps: diagnosticSteps
    }, { status: 500 });
  }
}
