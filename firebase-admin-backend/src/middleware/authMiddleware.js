// src/middleware/authMiddleware.js
const admin = require('firebase-admin');

// Middleware to verify Firebase Auth ID token in Authorization header
async function authenticateAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token sent' });
  }
  const token = header.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // OPTIONAL: You can check for a specific admin email or custom claim here
    if (!decodedToken.email || !decodedToken.email.endsWith('@gmail.com')) {
      return res.status(403).json({ error: 'Forbidden: Admin only' });
    }
    req.adminUser = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

module.exports = authenticateAdmin;