const { InteractionCallbackType, ApplicationCommandType, ApplicationCommandOptionType } = require("../types");

export const handleEcho = (options) => {
  const content = (options && options[0]) ? options[0].value : "echo";
  return {
    type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: message }
  };
};

export const REG_ECHO = {
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