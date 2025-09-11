const { v4: uuidv4 } = require('uuid');
const { withRequestId } = require("../core/logger");

module.exports = function requestId(req, res, next) {
  const id = uuidv4();
  withRequestId(id, () => {
    req.request_id = id;
    next();
  });
};
