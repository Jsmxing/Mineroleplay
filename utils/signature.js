const crypto = require('node:crypto');

module.exports = function (data) {
  if(typeof data === 'number') data = data.toString();
  return crypto.createHmac('sha256', process.env.API_SECRET ?? 'secret').update(data).digest('hex');
}