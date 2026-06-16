require('dotenv').config();
const dns = require('dns');

// Force DNS servers to resolve SRV records correctly on local machine
dns.setServers(['8.8.8.8', '1.1.1.1']);
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
