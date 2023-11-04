const Controller = require("./app/Controller");
const jwt = require("jsonwebtoken");
const { ENDPOINT_METADATA } = require("./metadata");
function parseEvent(event) {
  try {
    const body = event?.body ? JSON.parse(event.body) : {};
    const queryString = event.queryStringParameters || {};
    const { method: requestMethod, path } = event?.requestContext?.http;
    const { method, tokenRequired, next } = ENDPOINT_METADATA[path];

    if (!(path && requestMethod)) return null;
    if (!(method && next)) return null;
    if (method !== requestMethod) return null;

    const accessToken = event?.headers?.["x-access-token"];
    if (tokenRequired && !accessToken) return null;

    return {
      method,
      path,
      tokenRequired,
      next,
      accessToken,
      data: {
        ...body,
        ...queryString,
      },
    };
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function verifyAccessToken(token) {
  if (!token) {
    return null;
  }
  const p = new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, verifiedToken) => {
      if (err) reject(err);
      resolve(verifiedToken);
    });
  });
  try {
    return await p; // verified Token
  } catch (err) {
    console.error("[AUTH]: ", err);
    return null;
  }
}

module.exports = {
  parseEvent,
  verifyAccessToken,
};
