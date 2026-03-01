process.chdir('/var/www/nexiro-flux/backend');
const jwt = require('/var/www/nexiro-flux/backend/node_modules/jsonwebtoken');
const env = require('/var/www/nexiro-flux/backend/src/config/env');
const token = jwt.sign({id: 29, role: 'admin', site_key: 'nyala-gsm-4865d3-mm2jr396'}, env.JWT_SECRET, {expiresIn: '1h'});
console.log(token);
