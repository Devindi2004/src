const { optionalAuth, protect } = require("./authMiddleware");
const { authorize } = require("./roleMiddleware");

module.exports = { authorize, optionalAuth, protect };
