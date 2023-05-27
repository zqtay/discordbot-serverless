const nacl = require('tweetnacl');
const { InteractionType, InteractionCallbackType } = require("./types");
const PUBLIC_KEY = process.env.PUBLIC_KEY;

const createResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  };
};

const processCommand = (command, options) => {
  switch (command) {
    case "echo":
      return {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {content: "echo"}
      };
    default:
      return;
  }
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

    if (message.type === InteractionType.PING) {
      console.log("Handling Ping request");
      return createResponse(200, { type: InteractionCallbackType.PONG });
    }
    else if (message.type === InteractionType.APPLICATION_COMMAND) {
      const command = message.data.name.toLowerCase();
      const options = message.data.options;
      const res = processCommand(command, options);
      if (res) {
        return createResponse(200, res);
      }
      else {
        return createResponse(400, null);
      }
    }
    else {
      console.error("Unknown Type");
    }
  }
  return createResponse(statusCode, body);
};