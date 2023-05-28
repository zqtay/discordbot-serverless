const axios = require('axios').default;

const { InteractionCallbackType, ApplicationCommandType, ApplicationCommandOptionType } = require("../types");

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const SUBROUTE_RESOLVE_VANITY_URL = "ISteamUser/ResolveVanityURL/v0001";
const SUBROUTE_GET_PLAYER_SUMMARIES = "ISteamUser/GetPlayerSummaries/v0002";

const buildURI = (subroute, params) => {
  var url = `https://api.steampowered.com/${subroute}?key=${STEAM_API_KEY}&language=en_us&format=JSON`;
  for (var i in params) {
    url += `&${i}=${params[i]}`;
  }
  return url;
};

const getUser = async (userId) => {
  let data = {};
  let res, body, uri;
  if (userId.startsWith('765611')) {
    data.steamId64 = userId;
    data.steamId32 = (Number(userId) >> 32).toString();
  }
  else {
    //If argument is username
    //Get 64bit ID
    uri = buildURI(SUBROUTE_RESOLVE_VANITY_URL, { vanityurl: userId });
    res = await axios.get(uri);
    if (res.status === 200) {
      body = res.data;
      if (body.response.success != 1) return;
      data.steamId64 = body.response.steamid;
      data.steamId32 = (Number(body.response.steamid) >> 32).toString();
      body = null;
    }
    else {
      return;
    }
  }
  uri = buildURI(SUBROUTE_GET_PLAYER_SUMMARIES, { steamids: data.steamId64 });
  res = await axios.get(uri);
  if (res.status === 200) {
    body = res.data;
    data.personaname = body.response.players[0].personaname;
    data.profileurl = body.response.players[0].profileurl;
    data.username = data.profileurl.split('/').slice(-2)[0];
    data.timecreated = body.response.players[0].timecreated;
    data.lastlogoff = body.response.players[0].lastlogoff;
    data.personastate = body.response.players[0].personastate;
    data.gameid = body.response.players[0].gameid;
    data.gameextrainfo = body.response.players[0].gameextrainfo;
    return data;
  }
};

const handleGetUser = async (options) => {
  if (!options || options.length !== 1) return;
  var data = await getUser(options[0].value);
  if (data == undefined) {
    return {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Steam user ${options[0].value} not found!` }
    };
  }
  else {
    var replyMsg = `User ID: [${data.username}](${data.profileurl})\nDisplay name: ${data.personaname}\nSteam ID: (64bit) ${data.steamId64}, (32bit) ${data.steamId32}\n`;
    var timeCreated = new Date(data.timecreated * 1000);
    timeCreated.setMinutes(timeCreated.getMinutes() + timeCreated.getTimezoneOffset());
    replyMsg += `Date joined: (UTC) ${timeCreated.toLocaleString()}\n`;

    if (data.personastate == 0) {
      var lastOnline = new Date(data.lastlogoff * 1000);
      lastOnline.setMinutes(lastOnline.getMinutes() + lastOnline.getTimezoneOffset());
      replyMsg += `Status: Offline\nLast online: (UTC) ${lastOnline.toLocaleString()}`;
    }
    else {
      if (data.personastate == 1) {
        replyMsg += `Status: Online\n`;
      }
      else if (data.personastate == 3) {
        replyMsg += `Status: Away\n`;
      }
      if (data.gameextrainfo != undefined) {
        replyMsg += `Playing: [${data.gameextrainfo}](https://store.steampowered.com/app/+${data.gameid}})`;
      }
    }
    return {
      type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { embeds: [{ description: replyMsg }] }
    };
  }
};

const REG_GETUSER = {
  name: "user",
  description: "Get Steam user info",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  required: false,
  options: [{
    name: "user_id",
    description: "Steam user id or nickname",
    type: ApplicationCommandOptionType.STRING,
    required: true,
  }]
};

const handleSteam = async (options) => {
  if (!options || options.length < 1) return;
  const subcommand = options[0].name;
  switch (subcommand) {
    case "user":
      return await handleGetUser(options[0].options);
    default:
      break;
  }
};

const REG_STEAM = {
  name: "steam",
  description: "Steam API commands",
  type: ApplicationCommandType.CHAT_INPUT,
  options: [REG_GETUSER]
};

module.exports = {
  handleSteam,
  REG_STEAM,
};