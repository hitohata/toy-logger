import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import {LogLevel, ToyLogger, __local__, __DEFAULT_LOG_SETTINGS__, __LogSettings  } from "../lib";
const { output, intoLogFormat } = __local__;

describe("toy logger", () => {

    let mockBlockingFunction: Mock<any, any>;
    let mockAsyncFunction: Mock<any, any>;

    beforeEach(() => {
        mockBlockingFunction = vi.fn();
        mockAsyncFunction = vi.fn().mockImplementation(() => Promise.resolve());
    })
    afterEach(() => {
        vi.restoreAllMocks();
    })

    describe("normal behavior", () => {
        let toyLogger: ToyLogger;

        beforeEach(() => {
            toyLogger = ToyLogger.create({
                "DEBUG": {
                    callback: [mockBlockingFunction, mockAsyncFunction]
                },
                "INFO": {
                    callback: [mockBlockingFunction, mockAsyncFunction]
                },
                "LOG": {
                    callback: [mockBlockingFunction, mockAsyncFunction]
                },
                "WARN": {
                    callback: [mockBlockingFunction, mockAsyncFunction]
                },
                "ERROR": {
                    callback: [mockBlockingFunction, mockAsyncFunction]
                }
            });
        });

        afterEach(() => {
            vi.resetAllMocks()
        });

        it("debug", async () => {
            await toyLogger.debug("debug");
            expect(mockBlockingFunction).toBeCalledTimes(1);
            expect(mockAsyncFunction).toBeCalledTimes(1);
        });
        it("info", async () => {
            await toyLogger.info("info");
            expect(mockBlockingFunction).toBeCalledTimes(1);
            expect(mockAsyncFunction).toBeCalledTimes(1);
        });
        it("log", async () => {
            await toyLogger.log("log");
            expect(mockBlockingFunction).toBeCalledTimes(1);
            expect(mockAsyncFunction).toBeCalledTimes(1);
        });
        it("warn", async () => {
            await toyLogger.warn("warn");
            expect(mockBlockingFunction).toBeCalledTimes(1);
            expect(mockAsyncFunction).toBeCalledTimes(1);
        });
        it("error", async () => {
            await toyLogger.error("error");
            expect(mockBlockingFunction).toBeCalledTimes(1);
            expect(mockAsyncFunction).toBeCalledTimes(1);
        })
    })

    describe("inject functions after instantiate", () => {
        it("attach logger function", async () => {
            const toyLogger = ToyLogger.create();

            // before assigned
            await toyLogger.log("")
            expect(mockBlockingFunction).toBeCalledTimes(0);

            // after assigned
            toyLogger.addCallBack(LogLevel.LOG, mockBlockingFunction);
            await toyLogger.log("")
            expect(mockBlockingFunction).toBeCalledTimes(1);
        })
    })

    describe("the each settings has a priority", () => {
        it("priority", async () => {
            const a = vi.spyOn(console, "log").mockImplementation(() => {});
            const b = vi.spyOn(console, "warn").mockImplementation(() => {});
            const toyLogger = ToyLogger.create({
                "WARN": {
                    useConsole: true
                },
                defaultSettings: {
                    useConsole: false
                }
            })

            await toyLogger.log("");
            expect(a).toBeCalledTimes(0);

            await toyLogger.warn("");
            expect(b).toHaveBeenCalledTimes(1);
        })
    })

    describe("intoLogFormat", () => {
        it("format", () => {
            const TIMESTAMP = "1984/04/04T00:00:00"
            const MESSAGE = "crucial"
            expect(intoLogFormat(__DEFAULT_LOG_SETTINGS__.format, LogLevel.DEBUG, TIMESTAMP, MESSAGE)).toBe(`[DEBUG]: ${TIMESTAMP} - ${MESSAGE}`);
        });
    });

    describe("toLogDetail", () => {

        let mockSetting: __LogSettings;

        beforeEach(() => {
            mockSetting = {
                singleLine: false,
                format: "",
                useConsole: false,
                useStackTrace: false,
            }
            vi.useFakeTimers()
        })
        afterEach(() => {
            vi.restoreAllMocks();
            vi.useRealTimers()
        })
        describe("console log", () => {
            it("enable", async () => {
                mockSetting.useConsole = true;
                const fn = vi.fn();
                await output(mockSetting, [() => {}], "test", LogLevel.DEBUG, fn);
                expect(fn).toBeCalled();
            })
            it("disable", async () => {
                const fn = vi.fn();
                await output(mockSetting, [() => {}], "test", LogLevel.DEBUG, fn);
                expect(fn).not.toBeCalled();
            })
        })
    })
})