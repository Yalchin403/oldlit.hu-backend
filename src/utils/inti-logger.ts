import path from "path";
import { createLogger, format, transports } from "winston";
import fs from "fs";

const logDirPathsGenerators: Array<string> = [__dirname, "../../logs/"];
const logDirPath: string = path.join(...logDirPathsGenerators);

export function initializeLogger() {
  try {
    createLogDirIfNotExists(logDirPath);
    const logger = createLogger({
      transports: [
        new transports.File({
          filename: path.join(...logDirPathsGenerators, "file.log"),
        }),
        new transports.Console({ level: "debug" }),
      ],
      exceptionHandlers: [
        new transports.File({
          filename: path.join(...logDirPathsGenerators, "exceptions.log"),
        }),
      ],
      rejectionHandlers: [
        new transports.File({
          filename: path.join(...logDirPathsGenerators, "rejections.log"),
        }),
      ],
      format: format.combine(format.timestamp(), format.json()),
    });

    return logger;
  } catch (err) {
    console.log(err);
  }
}

function createLogDirIfNotExists(logDirPath: string) {
  if (!fs.existsSync(logDirPath)) {
    fs.mkdirSync(logDirPath);
  }
}
