const { Resend } = require('resend');

// Ensure you add RESEND_API_KEY to your docker-compose.yaml environment
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOTP = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL, // Use verified domain for production
      to: email,
      subject: 'Verify your Neighbourly Account',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Your Verification Code</h2>
          <p>Please use the following 6-digit code to complete your login/registration:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #059669; padding: 10px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Mailer Error:', err);
    throw new Error('Could not send verification email.');
  }
};