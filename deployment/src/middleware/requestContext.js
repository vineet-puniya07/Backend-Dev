const { v4: uuidv4 } = require('uuid');

function requestContext() {
  return (req, res, next) => {
    const requestId = req.header('x-request-id') || uuidv4();

    req.context = {
      requestId
    };

    res.setHeader('x-request-id', requestId);
    next();
  };
}

module.exports = { requestContext };
