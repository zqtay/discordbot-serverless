const axios = require('axios').default;

const APP_ID = process.env.APP_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

let url = `https://discord.com/api/v8/applications/${APP_ID}/commands`;

const headers = {
  "Authorization": `Bot ${BOT_TOKEN}`,
  "Content-Type": "application/json"
};

let command_data = {
  "name": "echo",
  "type": ApplicationCommandType.CHAT_INPUT,
  "description": "Echo your message",
  "options": [{
    "name": "message",
    "description": "Message to be echoed",
    "type": ApplicationCommandOptionType.STRING,
    "required": false
  }]
};

axios.post(url, JSON.stringify(command_data), {
  headers: headers,
});

// Delete
// axios.delete(url + '/1111693158963740723', {headers: headers}).then(console.log)

// Get all
// axios.get(url, {headers: headers}).then(console.log)
