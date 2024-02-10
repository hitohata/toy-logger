const DEFAULT_LOG_SETTINGS: LogSettings = {
    singleLine: false,
    format: "[LEVEL]: TIMESTAMP - MESSAGE",
    useConsole: true,
    useStackTrace: false
}

/**
 * The document is here:
 * https://github.com/hitohata/toy-logger
 */
export class ToyLogger {

    private target: LogTarget = new Map();
    private readonly defaultSetting: LogSettings;

    private constructor(config?: LogConfig) {
        this.target.set(LogLevel.DEBUG, toLogDetail(config ? config[LogLevel.DEBUG] : undefined));
        this.target.set(LogLevel.INFO, toLogDetail(config ? config[LogLevel.INFO] : undefined));
        this.target.set(LogLevel.LOG,toLogDetail(config ? config[LogLevel.LOG] : undefined));
        this.target.set(LogLevel.WARN,toLogDetail(config ? config[LogLevel.WARN] : undefined));
        this.target.set(LogLevel.ERROR,toLogDetail(config ? config[LogLevel.ERROR] : undefined));
        this.defaultSetting = {
            ...DEFAULT_LOG_SETTINGS,
            ...config?.defaultSettings
        };
    }

    // add new call back function(s).
    public addCallBack(level: LogLevel, callback: LogCallbackInput) {
        const logDetail = this.target.get(level)!;
        const callbackList = Array.isArray(callback) ? callback : [callback];
        this.target.set(level, {
            ...logDetail,
            callback: [...logDetail.callback, ...callbackList]
        })
    }

    public async log(logMessage: LogMessage) {
        const logDetail = this.target.get(LogLevel.LOG)!;
        await output({...this.defaultSetting, ...logDetail}, logDetail.callback, logMessage, LogLevel.LOG, console.log);
    }
    public async debug(logMessage: LogMessage) {
        const logDetail = this.target.get(LogLevel.DEBUG)!;
        await output({...this.defaultSetting, ...logDetail}, logDetail.callback, logMessage, LogLevel.LOG, console.debug);
    }
    public async info(logMessage: LogMessage) {
        const logDetail = this.target.get(LogLevel.INFO)!;
        await output({...this.defaultSetting, ...logDetail}, logDetail.callback, logMessage, LogLevel.LOG, console.info);
    }

    public async warn(logMessage: LogMessage) {
        const logDetail = this.target.get(LogLevel.WARN)!;
        await output({...this.defaultSetting, ...logDetail}, logDetail.callback, logMessage, LogLevel.LOG, console.warn);
    }
    public async error(logMessage: LogMessage) {
        const logDetail = this.target.get(LogLevel.ERROR)!;
        await output({...this.defaultSetting, ...logDetail}, logDetail.callback, logMessage, LogLevel.LOG, console.error);
    }

    /**
     * create a ToyLogger object.
     * @param config
     */
    static create(config?: LogConfig): ToyLogger {
        return new ToyLogger(config);
    }
}

/**
 * convert the message into log format
 * @param format
 * @param level
 * @param timestamp
 * @param logMessage
 */
function intoLogFormat(format: string, level: LogLevel, timestamp: string, logMessage: string) {
    return format.replace("LEVEL", level).replace("TIMESTAMP", timestamp).replace("MESSAGE", logMessage);
}

/**
 * Output the messages.
 * This is async function.
 * @param logDetail
 * @param callbackFunctions
 * @param logMessage
 * @param level
 * @param console - pass an appropriate console method
 */
async function output(logDetail: LogSettings, callbackFunctions: LogCallback[], logMessage: LogMessage, level: LogLevel, console: (message?: any) => void) {

    // into a list.
    const messages: string[] = logDetail.singleLine
        ? Array.isArray(logMessage) ? [logMessage.join("/n")] : [logMessage]
        : Array.isArray(logMessage) ? logMessage : [logMessage];

    const stackTrace = new Error().stack;

    if (logDetail.useStackTrace) {
        messages.push(stackTrace || "the stack trace is not available");
    }

    const asyncCallBacks = [];

    for (const message of messages) {
        const formattedMessage = intoLogFormat(logDetail.format, level, new Date().toISOString(), message);
        if (logDetail.useConsole) {
            console(formattedMessage);
        }
        for (const callBack of callbackFunctions) {
            asyncCallBacks.push(callBack(formattedMessage));
        }
    }
    await Promise.all(asyncCallBacks);
}

/**
 * This is a helper function to create a LogDetail.
 * This function is used to convert a LogCallback into a LogDetail.
 */
const toLogDetail = (input?: LogDetailInput) => {
    return {
        ...input,
        callback: input?.callback
            ? Array.isArray(input.callback) ? input.callback : [input.callback]
            : [],
    }
}

export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    LOG = "LOG",
    WARN = "WARN",
    ERROR = "ERROR",
}

type LogMessage = string | string[];

type LogMessageCallback = (logMessage: string) => void;
type LogMessagePromiseCallback = (logMessage: string) => Promise<void>;
type LogCallback = LogMessageCallback | LogMessagePromiseCallback

type LogTarget = Map<
    LogLevel,
    LogDetail
>

type LogDetail  = {
    callback: LogCallback[];
} & Partial<LogSettings>

type LogSettings = {
    singleLine: boolean;
    format: string;
    useConsole: boolean;
    useStackTrace: boolean
}

type LogCallbackInput = LogCallback | LogCallback[];
type LogDetailInput = Partial<Omit<LogDetail, "callback"> & { callback: LogCallbackInput }>

type LogConfig = {
    [LogLevel.DEBUG]?: LogDetailInput;
    [LogLevel.INFO]?: LogDetailInput;
    [LogLevel.LOG]?: LogDetailInput;
    [LogLevel.WARN]?: LogDetailInput;
    [LogLevel.ERROR]?: LogDetailInput;
    defaultSettings?: Partial<LogSettings>
};

export const __DEFAULT_LOG_SETTINGS__ = DEFAULT_LOG_SETTINGS;
export const __local__ = { output, intoLogFormat }

export type __LogSettings = LogSettings;
