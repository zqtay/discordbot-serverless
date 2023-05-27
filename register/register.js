const axios = require('axios').default;

const { REG_ECHO } = require("../commands/basic");

const APP_ID = process.env.APP_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

let url = `https://discord.com/api/v8/applications/${APP_ID}/commands`;

const headers = {
  "Authorization": `Bot ${BOT_TOKEN}`,
  "Content-Type": "application/json"
};

let commands = [REG_ECHO];

const registerCommands = async () => {
  let res;
  for (const command of commands) {
    res = await axios.post(url, JSON.stringify(command), {
      headers: headers,
    });
    switch (res.status) {
      case 200:
        console.log(`Command "${command.name}" updated`);
        break;
      case 201:
        console.log(`Command "${command.name}" created`);
        break;
      default:
        console.log(`Command "${command.name}" update failed: ${res.status}`);
        break;
    }
  }
};

registerCommands();

// Delete
// axios.delete(url + '/1111693158963740723', {headers: headers}).then(console.log)

// Get all
// axios.get(url, {headers: headers}).then(console.log)
