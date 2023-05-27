const nacl = require('tweetnacl');
const { InteractionType, InteractionCallbackType } = require("./types");
const { handleEcho, handleRelay } = require("./commands/basic");

const PUBLIC_KEY = process.env.PUBLIC_KEY;

const createResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  };
};

const processCommand = async (command, options, user) => {
  switch (command) {
    case "echo":
      return handleEcho(options);
    case "relay":
      return await handleRelay(options, user);
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
      // message.user: user use command in bot DM
      // message.member.user: user use command in a channel
      const user = message.user ? message.user : message.member.user;
      console.log(`[APPCMD] id: ${message.id}, user: ${user?.id}, command: ${command}`);
      const res = await processCommand(command, options, user);
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