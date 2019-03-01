import { SentryEvent, SentryException, StackFrame } from '@sentry/types/esm';
import { StackFrame as TraceKitStackFrame, StackTrace as TraceKitStackTrace } from './tracekit';
/**
 * This function creates an exception from an TraceKitStackTrace
 * @param stacktrace TraceKitStackTrace that will be converted to an exception
 */
export declare function exceptionFromStacktrace(stacktrace: TraceKitStackTrace): SentryException;
/** JSDoc */
export declare function eventFromPlainObject(exception: {}, syntheticException: Error | null): SentryEvent;
/** JSDoc */
export declare function eventFromStacktrace(stacktrace: TraceKitStackTrace): SentryEvent;
/** JSDoc */
export declare function prepareFramesForEvent(stack: TraceKitStackFrame[]): StackFrame[];
/**
 * Adds exception values, type and value to an synthetic Exception.
 * @param event The event to modify.
 * @param value Value of the exception.
 * @param type Type of the exception.
 */
export declare function addExceptionTypeValue(event: SentryEvent, value?: string, type?: string): void;
