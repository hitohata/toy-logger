# Toy Logger

This is a logger allowing to attach callback functions. 
When the logging is executed, the attached functions are also executed. 
To allow to attach asynchronous functions, this methods are async functions.
The log level responds to the console's level, which is the build-in method.

## How to use

You can use this logger just instantiating using the static method. 

```ts

const logger = ToyLogger.crete();
await logger.log("log messages");

```

### Log Configuration

When instantiating, you can customize the settings of this logger.
This logger is also customizable with the default log behavior and each level's behavior.
The default setting is used for every log level, but if you set the setting to each log level, the individual settings has a priority.

```ts
const logger = ToyLogger.create({
    "WARN": {
        useConsole: true,
        format: "customized format"
    },
    defaultSettings: {
        useStackTrace: false,
        format: "default format",
    }
});

logger.log("message") // the output will be "default format".
logger.warn("message") // the output will be "customized format".
```

Callback functions can attach to this logger after instantiation.


```ts
const logger = ToyLogger.create();

logger.addCallBack(LogLevel.LOG, callbackFunction);

logger.log("message") // the callbackFunction will be called. 
```

The options are the following:

| key Name      | type    | Description                                                     | Default |
|:--------------|:--------|:----------------------------------------------------------------|:--------|
| singleLine    | boolean | if ture, the error message will be single string.               | false   |
| format        | string  | [format of the error message](#error-message-format)            | -       |
| useConsole    | boolean | use console's method.                                           | true    |
| useStackTrace | boolean | if ture, the stack trace will be attached to the error message. | false   |

### Error Message Format

The default error message format is "[LEVEL]: TIMESTAMP - MESSAGE",
The LEVEL, TIMESTAMP, and MESSAGE are placeholder.
When logging, these values are overwritten by error level, ISO format timestamp, and error message passed to the method.
