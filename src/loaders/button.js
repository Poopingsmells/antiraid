const { readdirSync } = require("fs");
const { join } = require("path");
const filePath = join(__dirname, "..", "buttons");

module.exports.run = (client) => {
  for (const btn of readdirSync(filePath).filter((file) =>
    file.endsWith(".js"),
  )) {
    const button = require(`${filePath}/${btn}`);
    client.buttons.set(button.id, button);
  }
};
