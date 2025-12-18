import pino, { type LoggerOptions } from "pino";
import { join } from "path";
import { PATH_LOG } from "@/config/path";
import { ENV_IS_DEV } from "@/config/env";

const createLogger = (): pino.Logger => {
  if (ENV_IS_DEV) {
    const devOptions: LoggerOptions = {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    };

    return pino(devOptions);
  }

  const logDir = PATH_LOG;

  const allLogsStream = pino.destination({
    dest: join(logDir, "app.log"),
    sync: false,
    rotate: "YYYY-MM-DD",
  });

  const errorLogsStream = pino.destination({
    dest: join(logDir, "error.log"),
    sync: false,
    rotate: "YYYY-MM-DD",
  });

  return pino(
    {
      level: "info",
    },
    pino.multistream([
      { stream: process.stdout },
      { stream: allLogsStream },
      { level: "error", stream: errorLogsStream },
    ]),
  );
};

export const logger = createLogger();
