const axios = require('axios');
const User = require('../models/User');
const SOSSession = require('../models/SOSSession');
const sendEmail = require('../utils/email');

/**
 * POST /api/v1/sos/trigger
 * Body: { latitude, longitude }
 */
exports.triggerSOS = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        status: 'fail',
        message: 'Latitude and longitude are required.',
      });
    }

    // 1. Fetch user with populated emergency contacts
    const user = await User.findById(req.user.id).populate('emergencyContacts');

    if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No emergency contacts found. Please add at least one contact.',
      });
    }

    // 2. Create a Live SOS Session
    const session = await SOSSession.create({
      user: req.user.id,
      currentLocation: { lat: latitude, lng: longitude },
      locationHistory: [{ lat: latitude, lng: longitude }]
    });

    // 4. Build Links
    const frontendUrl = process.env.FRONTEND_URL || req.get('origin') || 'http://localhost:5173';
    const liveLink = `${frontendUrl}/sos/track/${session._id}`;
    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    // 5. Compose message (SMS)
    const smsMessage =
      `🚨 EMERGENCY ALERT: ${user.name.toUpperCase()} 🚨\n\n` +
      `IMMEDIATE HELP NEEDED! I am in danger.\n\n` +
      `🛰️ TRACK MY LIVE MOVEMENT:\n${liveLink}\n\n` +
      `📍 STATIC LOCATION (Google Maps):\n${mapsLink}\n\n` +
      `Please respond or call emergency services.\n` +
      `– SheShield Safety Network`;

    // 6. Compose HTML Message (Email)
    const htmlMessage = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; padding: 40px 20px; line-height: 1.5; color: #1d1d1f;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid rgba(0,0,0,0.05);">
          <!-- EMERGENCY HEADER -->
          <div style="background-color: #ff3b30; padding: 20px; text-align: center;">
            <p style="margin: 0; color: #ffffff; font-weight: 800; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase;">🚨 Emergency SOS Alert</p>
          </div>
          
          <div style="padding: 40px;">
            <p style="margin: 0 0 8px; color: #ff3b30; font-weight: 700; font-size: 16px;">CRITICAL RESPONSE NEEDED</p>
            <h1 style="margin: 0 0 24px; font-size: 28px; font-weight: 700; letter-spacing: -0.04em;">${user.name} is in danger.</h1>
            
            <p style="margin-bottom: 32px; color: #636366; font-size: 16px; font-weight: 500;">
              An immediate emergency signal has been triggered. Please follow the link below to track their live coordinates in real-time.
            </p>

            <!-- PRIMARY ACTION -->
            <a href="${liveLink}" style="display: block; background-color: #ff3b30; color: #ffffff; text-decoration: none; text-align: center; padding: 18px 24px; border-radius: 12px; font-weight: 700; font-size: 17px; margin-bottom: 24px; box-shadow: 0 8px 20px rgba(255, 59, 48, 0.25);">
              🚀 Track Live Movement
            </a>

            <!-- SECONDARY ACTION -->
            <div style="text-align: center;">
              <p style="margin: 0 0 12px; color: #8e8e93; font-size: 13px; font-weight: 600; text-transform: uppercase;">Backup Location</p>
              <a href="${mapsLink}" style="color: #ff3b30; font-weight: 600; font-size: 15px;">📍 View on Google Maps</a>
            </div>
          </div>

          <div style="background-color: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #f0f0f0;">
            <p style="margin: 0; color: #8e8e93; font-size: 12px; font-weight: 700;">Sent via SheShield Safety Network</p>
          </div>
        </div>
      </div>
    `;

    // 7. Send SMS to every contact
    const smsResults = await Promise.allSettled(
      user.emergencyContacts.map((contact) =>
        sendTextLKSms(contact.phone, smsMessage)
      )
    );

    // 8. Send Email to every contact
    const emailResults = await Promise.allSettled(
      user.emergencyContacts
        .filter((c) => c.email)
        .map((contact) =>
          sendEmail({
            email: contact.email,
            subject: `🚨 EMERGENCY: ${user.name} 🚨`,
            message: smsMessage,
            html: htmlMessage
          })
        )
    );

    const smsSent = smsResults.filter((r) => r.status === 'fulfilled').length;
    const emailsSent = emailResults.filter((r) => r.status === 'fulfilled').length;

    return res.status(200).json({
      status: 'success',
      message: `SOS live + static links sent to ${smsSent} contacts via SMS and ${emailsSent} via Email.`,
      data: {
        sessionId: session._id,
        liveLink,
        mapsLink,
        smsSent,
        emailsSent
      },
    });
  } catch (err) {
    console.error('[SOS] Error:', err.message);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'SOS alert failed.',
    });
  }
};

/**
 * PATCH /api/v1/sos/update-location/:sessionId
 * Protected - Used by the device that triggered SOS
 */
exports.updateSOSLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { sessionId } = req.params;

    const session = await SOSSession.findOneAndUpdate(
      { _id: sessionId, user: req.user.id, status: 'active' },
      { 
        $set: { currentLocation: { lat: latitude, lng: longitude } },
        $push: { locationHistory: { lat: latitude, lng: longitude } }
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        status: 'fail',
        message: 'No active SOS session found for this ID.'
      });
    }

    res.status(200).json({ status: 'success', data: { session } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * GET /api/v1/sos/public/:sessionId
 * Public - Used by emergency contacts to track
 */
exports.getPublicSOSSession = async (req, res) => {
  try {
    const session = await SOSSession.findById(req.params.sessionId)
      .populate('user', 'name phone')
      .select('-locationHistory');

    if (!session || session.status !== 'active') {
      return res.status(404).json({
        status: 'fail',
        message: 'This SOS tracking session is no longer active.'
      });
    }

    res.status(200).json({ status: 'success', data: { session } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ... (sendTextLKSms helper stays the same)

// ─── TextLK SMS helper ────────────────────────────────────────────────────────
async function sendTextLKSms(to, message) {
  // Normalise phone: TextLK expects international format without leading zeros
  // Sri Lanka: 0768250162 -> 94768250162
  let phone = to.replace(/\s+/g, '');
  if (phone.startsWith('0')) {
    phone = '94' + phone.slice(1);
  }
  if (phone.startsWith('+')) {
    phone = phone.slice(1);
  }

  const payload = {
    recipient: phone,
    sender_id: process.env.TEXTLK_SENDER_ID,
    message,
  };

  console.log(`[TextLK] Sending SMS to ${phone}`);

  const response = await axios.post(
    'https://app.text.lk/api/v3/sms/send',
    payload,
    {
      headers: {
        Authorization: `Bearer ${process.env.TEXTLK_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10000,
    }
  );

  console.log(`[TextLK] Response for ${phone}:`, response.data);
  return response.data;
}
