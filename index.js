const nacl = require('tweetnacl');

const APP_ID = process.env.APPLIC_ID;
const TOKEN = process.env.TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY;

const createResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  };
};

exports.handler = async (event) => {
  let body;
  let statusCode = 400;
  if (event.httpMethod === "POST") {
    const signature = event.headers["x-signature-ed25519"];
    const timestamp = event.headers["x-signature-timestamp"];

    const isValidRequest = nacl.sign.detached.verify(
      Buffer.from(timestamp + event.body),
      Buffer.from(signature, 'hex'),
      Buffer.from(PUBLIC_KEY, 'hex')
    );

    if (!isValidRequest) {
      console.error("Invalid Request");
      return createResponse(401, { error: "Bad request signature" });
    }

    const message = JSON.parse(event.body);

    if (message.type === 1) {
      console.log("Handling Ping request");
      return createResponse(200, { type: 1 });
    }
    else if (message.type === 2) {
      switch (message.data.name.toLowerCase()) {
        default:
          console.error("Unknown Command");
      }
    }
    else {
      console.error("Unknown Type");
    }
  }
  return createResponse(statusCode, body);
};