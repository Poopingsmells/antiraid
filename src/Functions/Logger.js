const colors = {
  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",
  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
  reset: "\u001b[0m",
};
const moment = require("moment");
module.exports = class Logger {
  constructor(client) {
    this.client = client;
  }
  ready(name, type) {
    console.log(
      `Ready as: ${colors.FgGreen}${this.client.user.username} - ${
        colors.FgRed
      }${name} - ${colors.FgYellow}[${type}] - ${
        colors.reset
      }(${moment().format("LLLL")})`,
    );
  }
  commandLogs(name, type = "Command Executed", author) {
    console.log(
      `Command Name: ${colors.FgRed}${name} - ${colors.FgBlue}[${type}] - ${
        colors.FgYellow
      }${author} - ${colors.reset}(${moment().format("LLLL")})`,
    );
  }
  error(name, type = "Error") {
    console.error(
      `${colors.FgRed}${name} - ${colors.BgRed}[${type}] - ${
        colors.reset
      }(${moment().format("LLLL")})`,
    );
  }
  dashReady(name, type = "Dashboard") {
    console.log(
      `Working On: ${colors.FgGreen}${this.client.config.port} - ${
        colors.FgRed
      }${name} - ${colors.FgYellow}[${type}] - ${
        colors.reset
      }(${moment().format("LLLL")})`,
    );
  }
  mongo(name, type = "Database") {
    console.log(
      `DB Connected: ${colors.FgGreen}${this.client.config.mongo_url} - ${
        colors.FgRed
      }${name} - ${colors.FgYellow}[${type}] - ${
        colors.reset
      }(${moment().format("LLLL")})`,
    );
  }
  visitLogs(req, name, res, type = "Profile Visit") {
    console.log(
      `New Visit from Visitor: ${colors.FgGreen}${req} - ${
        colors.FgRed
      }${name} - ${colors.FgYellow}[${type}] - Profile: ${
        colors.FgCyan
      }${res} - ${colors.reset}(${moment().format("LLLL")})`,
    );
  }
};
