
const { EdgeConfig } = require("@vercel/edge-config");

const store = new EdgeConfig({ 
  token: process.env.EDGE_CONFIG 
});

module.exports = store;

