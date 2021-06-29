const crypto = require('crypto');

function computeSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

function verifySignature(payload, signature, secret) {
  const payloadSig = computeSignature(payload, secret);
  return crypto.timingSafeEqual(signature, payloadSig);
}

module.exports = {
  computeSignature,
  verifySignature,
}
