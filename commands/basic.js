const axios = require('axios').default;

const { InteractionCallbackType, ApplicationCommandType, ApplicationCommandOptionType } = require("../types");

const BOT_TOKEN = process.env.BOT_TOKEN;
const headers = {
  "Authorization": `Bot ${BOT_TOKEN}`,
  "Content-Type": "application/json"
};

const handleEcho = (options) => {
  const message = (options && options[0]) ? options[0].value : "echo";
  return {
    type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: message }
  };
};

const handleRelay = async (options, user) => {
  if (!options || !(options.length === 2 || options.length === 3)) {
    return;
  }
  let channel, message, anonymous;
  for (const option of options) {
    switch (option.name) {
      case "channel_id":
        channel = option.value;
        break;
      case "message":
        message = option.value;
        break;
      case "anonymous":
        anonymous = option.value;
        break;
      default:
        return;
    }
  }
  if (!anonymous) {
    message = `<@${user.id}>: ${message}`;
  }
  const res = await axios.post(
    `https://discord.com/api/channels/${channel}/messages`,
    JSON.stringify({ content: message }),
    { headers: headers }
  );
  if (res.status === 200) {
    return {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Message relayed. ID: ${res.data.id}.` }
    };
  }
};

const REG_ECHO = {
  name: "echo",
  type: ApplicationCommandType.CHAT_INPUT,
  description: "Echo your message",
  options: [{
    name: "message",
    description: "Message to be echoed",
    type: ApplicationCommandOptionType.STRING,
    required: false
  }]
};

const REG_RELAY = {
  name: "relay",
  type: ApplicationCommandType.CHAT_INPUT,
  description: "Relay your message as bot",
  options: [{
    name: "channel_id",
    description: "Destination channel ID to relay your message",
    type: ApplicationCommandOptionType.STRING,
    required: true
  },
  {
    name: "message",
    description: "Message to be relayed",
    type: ApplicationCommandOptionType.STRING,
    required: true
  },
  {
    name: "anonymous",
    description: "Relay the message anonymously",
    type: ApplicationCommandOptionType.BOOLEAN,
    required: false
  }]
};

module.exports = {
  handleEcho,
  handleRelay,
  REG_ECHO,
  REG_RELAY
};