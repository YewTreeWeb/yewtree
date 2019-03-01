import { BaseBackend, SentryError } from '@sentry/core/esm';
import { Severity } from '@sentry/types/esm';
import { isDOMError, isDOMException, isError, isErrorEvent, isPlainObject } from '@sentry/utils/esm/is';
import { supportsBeacon, supportsFetch } from '@sentry/utils/esm/supports';
import { addExceptionTypeValue, eventFromPlainObject, eventFromStacktrace, prepareFramesForEvent } from './parsers';
import { computeStackTrace } from './tracekit';
import { BeaconTransport, FetchTransport, XHRTransport } from './transports';
/** The Sentry Browser SDK Backend. */
export class BrowserBackend extends BaseBackend {
    /**
     * @inheritDoc
     */
    install() {
        // We are only called by the client if the SDK is enabled and a valid Dsn
        // has been configured. If no Dsn is present, this indicates a programming
        // error.
        const dsn = this.options.dsn;
        if (!dsn) {
            throw new SentryError('Invariant exception: install() must not be called when disabled');
        }
        Error.stackTraceLimit = 50;
        return true;
    }
    /**
     * @inheritdoc
     */
    setupTransport() {
        if (!this.options.dsn) {
            // We return the noop transport here in case there is no Dsn.
            return super.setupTransport();
        }
        const transportOptions = this.options.transportOptions ? this.options.transportOptions : { dsn: this.options.dsn };
        if (this.options.transport) {
            return new this.options.transport(transportOptions);
        }
        else if (supportsBeacon()) {
            return new BeaconTransport(transportOptions);
        }
        else if (supportsFetch()) {
            return new FetchTransport(transportOptions);
        }
        return new XHRTransport(transportOptions);
    }
    /**
     * @inheritDoc
     */
    async eventFromException(exception, hint) {
        let event;
        if (isErrorEvent(exception) && exception.error) {
            // If it is an ErrorEvent with `error` property, extract it to get actual Error
            const ex = exception;
            exception = ex.error; // tslint:disable-line:no-parameter-reassignment
            event = eventFromStacktrace(computeStackTrace(exception));
        }
        else if (isDOMError(exception) || isDOMException(exception)) {
            // If it is a DOMError or DOMException (which are legacy APIs, but still supported in some browsers)
            // then we just extract the name and message, as they don't provide anything else
            // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
            // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
            const ex = exception;
            const name = ex.name || (isDOMError(ex) ? 'DOMError' : 'DOMException');
            const message = ex.message ? `${name}: ${ex.message}` : name;
            event = await this.eventFromMessage(message, Severity.Error, hint);
            addExceptionTypeValue(event, message);
        }
        else if (isError(exception)) {
            // we have a real Error object, do nothing
            event = eventFromStacktrace(computeStackTrace(exception));
        }
        else if (isPlainObject(exception) && hint && hint.syntheticException) {
            // If it is plain Object, serialize it manually and extract options
            // This will allow us to group events based on top-level keys
            // which is much better than creating new group when any key/value change
            const ex = exception;
            event = eventFromPlainObject(ex, hint.syntheticException);
            addExceptionTypeValue(event, 'Custom Object');
        }
        else {
            // If none of previous checks were valid, then it means that
            // it's not a DOMError/DOMException
            // it's not a plain Object
            // it's not a valid ErrorEvent (one with an error property)
            // it's not an Error
            // So bail out and capture it as a simple message:
            const ex = exception;
            event = await this.eventFromMessage(ex, undefined, hint);
            addExceptionTypeValue(event, `${ex}`);
        }
        event = {
            ...event,
            event_id: hint && hint.event_id,
            exception: {
                ...event.exception,
                mechanism: {
                    handled: true,
                    type: 'generic',
                },
            },
        };
        return event;
    }
    /**
     * @inheritDoc
     */
    async eventFromMessage(message, level = Severity.Info, hint) {
        const event = {
            event_id: hint && hint.event_id,
            level,
            message,
        };
        if (this.options.attachStacktrace && hint && hint.syntheticException) {
            const stacktrace = computeStackTrace(hint.syntheticException);
            const frames = prepareFramesForEvent(stacktrace.stack);
            event.stacktrace = {
                frames,
            };
        }
        return event;
    }
}
//# sourceMappingURL=backend.js.map