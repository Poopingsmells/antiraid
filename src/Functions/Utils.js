const servers = require("../models/servers");
// eslint-disable-next-line no-unused-vars
const fetch = require("node-fetch");
module.exports = class Utils {
  constructor(client) {
    this.client = client;
  }
  checkowner(userID) {
    return this.client.config.dev.includes(userID);
  }
  async checkPremium(guildID) {
    const access = await servers.findOne({ guildID: guildID });
    if (access.premium == false) {
      return "This Server doesn't have premium!";
    } else {
      return "This Server does have premium!";
    }
  }
  missingPerms(member, perms) {
    const missingPerms = member.permissions.missing(perms).map(
      (str) =>
        `\`${str
          .toLowerCase()
          .replace(/(^|"|_)(\S)/g, (s) => s.toUpperCase())
          .replace(/_/g, " ")
          .replace(/Guild/g, "Server")
          .replace(/Use Vad/g, "Use Voice Acitvity")}\``,
    );

    return missingPerms.length > 1
      ? `${missingPerms.slice(0, -1).join(", ")} **,** ${
          missingPerms.slice(-1)[0]
        }`
      : missingPerms[0];
  }
  toProperCase(string) {
    return string
      .split(" ")
      .map((str) => str.slice(0, 1).toUpperCase() + str.slice(1))
      .join(" ");
  }
  formatPerms(perm) {
    return perm
      .toLowerCase()
      .replace(/(^|"|_)(\S)/g, (s) => s.toUpperCase())
      .replace(/_/g, " ")
      .replace(/Guild/g, "Server")
      .replace(/Use Vad/g, "Use Voice Acitvity");
  }
  trimArray(arr, maxLen = 10) {
    if (arr.length > maxLen) {
      const len = arr.length - maxLen;
      arr = arr.slice(0, maxLen);
      arr.push(`${len} more...`);
    }
    return arr;
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }

  removeDuplicates(arr) {
    return [...new Set(arr)];
  }

  capitalise(string) {
    return string
      .split(" ")
      .map((str) => str.slice(0, 1).toUpperCase() + str.slice(1))
      .join(" ");
  }

  checkOwner(target) {
    return this.client.owners.includes(target);
  }

  comparePerms(member, target) {
    return member.roles.highest.position < target.roles.highest.position;
  }

  formatArray(array, type = "conjunction") {
    return new Intl.ListFormat("en-GB", { style: "short", type: type }).format(
      array,
    );
  }

  checkPerms(type, guild) {
    const types = {
      1: ["SEND_MESSAGES", "EMBED_LINKS"],
    };
    if (guild.me.permissions.has(types[type])) return true;
    else return false;
  }
  // format timestamp to human readable
  formatTimestamp(timestamp) {
    return new Date(timestamp).toUTCString();
  }
  // determite if a string is capitalized
  isCapitalized(string) {
    return string.charAt(0).toUpperCase() === string.charAt(0);
  }
};
