/*
  controllers/adminController.js
  Minimal safe adminLogin for debugging:
  - logs req.body and envs
  - does NOT use jwt
  - returns clear JSON errors (no HTML)
*/
exports.adminLogin = (req, res) => {
  try {
    console.log('DEBUG adminLogin invoked - req.body:', req.body);
    console.log('DEBUG ADMIN_PASSWORD present?', !!process.env.ADMIN_PASSWORD);

    const password = (req.body && req.body.password) || null;

    if (!password) {
      console.warn('adminLogin: missing password in request body');
      return res.status(400).json({ ok: false, message: 'Password required' });
    }

    if (!process.env.ADMIN_PASSWORD) {
      console.warn('adminLogin: ADMIN_PASSWORD not set in environment');
      return res
        .status(500)
        .json({ ok: false, message: 'Server not configured: ADMIN_PASSWORD missing' });
    }

    if (password === process.env.ADMIN_PASSWORD) {
      console.log('adminLogin: password matched - returning token placeholder');
      return res.status(200).json({ ok: true, message: 'Logged in', token: 'admin-placeholder-token' });
    }

    console.warn('adminLogin: invalid password attempt');
    return res.status(401).json({ ok: false, message: 'Invalid password' });
  } catch (err) {
    console.error('adminLogin unexpected error:', err && err.stack ? err.stack : err);
    // Return JSON with error — avoid server-wide HTML error page
    return res.status(500).json({ ok: false, message: 'Internal Server Error' });
  }
};