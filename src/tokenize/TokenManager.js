const crypto = require('crypto');

const TokenManager = {
  generateToken(payload, secret) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  },

  verifyToken(token, secret) {
    const [header, body, signature] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (signature !== expectedSig) {
      throw new Error('Invalid token');
    }
    return JSON.parse(Buffer.from(body, 'base64url').toString());
  },

  generateAccessToken(payload) {
    return this.generateToken(payload, process.env.ACCESS_TOKEN_KEY);
  },

  generateRefreshToken(payload) {
    return this.generateToken(payload, process.env.REFRESH_TOKEN_KEY);
  },

  verifyAccessToken(token) {
    return this.verifyToken(token, process.env.ACCESS_TOKEN_KEY);
  },

  verifyRefreshToken(token) {
    return this.verifyToken(token, process.env.REFRESH_TOKEN_KEY);
  },
};

module.exports = TokenManager;
