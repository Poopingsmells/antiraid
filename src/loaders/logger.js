const winston = require("winston");
const { createLogger, format, transports } = winston;
const path = require("path");

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    ready: 3,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "blue",
    ready: "green",
  },
};

const logFormat = format.printf((info) => {
  const { timestamp, level, label, message, ...rest } = info;
  let log = `${timestamp} - ${level} [${label}]: ${message}`;

  if (!(Object.keys(rest).length === 0 && rest.constructor === Object)) {
    log = `${log}\n${JSON.stringify(rest, null, 2)}`.replace(/\\n/g, "\n");
  }
  return log;
});

module.exports.run = (client) => {
  client.logger = createLogger({
    levels: customLevels.levels,
    format: format.combine(
      format.errors({ stack: true }),
      format.label({ label: "AntiRaid" }),
      format.timestamp({ format: "HH:mm:ss" }),
      format.json(),
      logFormat,
    ),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: path.join(process.cwd(), "logs/full.log"),
      }),
      new transports.File({
        filename: path.join(process.cwd(), "logs/error.log"),
        level: "warn",
      }),
    ],
  });
};
