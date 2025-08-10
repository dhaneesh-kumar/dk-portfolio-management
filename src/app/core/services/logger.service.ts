import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

@Injectable({
  providedIn: "root",
})
export class LoggerService {
  private currentLogLevel: LogLevel = environment.production
    ? LogLevel.WARN
    : LogLevel.DEBUG;

  debug(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.DEBUG, message, optionalParams);
  }

  info(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.INFO, message, optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.WARN, message, optionalParams);
  }

  error(message: string, error?: Error, ...optionalParams: any[]): void {
    this.log(LogLevel.ERROR, message, [error, ...optionalParams]);
  }

  private log(level: LogLevel, message: string, optionalParams: any[]): void {
    if (level < this.currentLogLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const formattedMessage = `[${timestamp}] [${levelName}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, ...optionalParams);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, ...optionalParams);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...optionalParams);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, ...optionalParams);
        break;
    }
  }

  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }
}
