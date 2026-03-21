const axios = require('axios');
const User = require('../models/User');

/**
 * POST /api/v1/sos/trigger
 * Body: { latitude, longitude }
 * Protected route – req.user is set by authController.protect
 *
 * Steps:
 *  1. Load the logged-in user + their emergency contacts
 *  2. Build a Google Maps link from the supplied coordinates
 *  3. Send an SMS to every contact via TextLK
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

    // 2. Build Google Maps live-location link
    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    // 3. Compose message
    const message =
      `🚨 EMERGENCY ALERT 🚨\n` +
      `${user.name} needs immediate help!\n\n` +
      `📍 Live Location:\n${mapsLink}\n\n` +
      `Please respond immediately or call emergency services.\n` +
      `– SheShield Safety App`;

    // 4. Send SMS to every contact (fire in parallel)
    const smsResults = await Promise.allSettled(
      user.emergencyContacts.map((contact) =>
        sendTextLKSms(contact.phone, message)
      )
    );

    // 5. Summarise results
    const sent = smsResults.filter((r) => r.status === 'fulfilled').length;
    const failed = smsResults.filter((r) => r.status === 'rejected').length;

    console.log(`[SOS] User: ${user.name} | Sent: ${sent} | Failed: ${failed}`);
    console.log('[SOS] Results:', smsResults);

    return res.status(200).json({
      status: 'success',
      message: `SOS alert sent to ${sent} contact(s).`,
      data: {
        sent,
        failed,
        location: { latitude, longitude, mapsLink },
        contactsNotified: user.emergencyContacts.map((c) => ({
          name: c.name,
          phone: c.phone,
        })),
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
