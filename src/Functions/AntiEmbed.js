// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Client } = require("discord.js");
const colors = {
  warn: "ORANGE",
  error: "DARK_RED",
  success: "DARK_GREEN",
};
const text = "Antiraid | v5 has been released!";

module.exports = class AntiEmbed extends MessageEmbed {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super();
    this.client = client;
    this.setFooter({ text });
    if (client?.user?.displayAvatarURL())
      this.setFooter({ text, iconURL: client.user.displayAvatarURL() });
    this.setColor("DARK_BLUE");
  }
  /**
   * Creates a warning embed
   * @param {String} str The message to pass
   * @returns {AntiEmbed}
   */
  warn(str) {
    this.setColor(colors.warn);
    this.setTitle("⚠️ | Warning");
    this.setDescription(str);
    return this;
  }
  /**
   * Creates an error embed
   * @param {String} str The message to pass
   * @returns {AntiEmbed}
   */
  error(str) {
    this.setColor(colors.error);
    this.setTitle("❌ | Error");
    this.setDescription(str);
    return this;
  }
  /**
   * Creates a success embed
   * @param {String} str The message to pass
   * @returns {AntiEmbed}
   */
  success(str) {
    this.color = colors.success;
    this.title = "✅ | Success";
    this.description = str;
    return this;
  }
};
