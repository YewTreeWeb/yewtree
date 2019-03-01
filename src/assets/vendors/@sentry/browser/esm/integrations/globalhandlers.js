import { getCurrentHub } from '@sentry/core/esm';
import { logger } from '@sentry/utils/esm/logger';
import { safeNormalize, serialize } from '@sentry/utils/esm/object';
import { truncate } from '@sentry/utils/esm/string';
import { addExceptionTypeValue, eventFromStacktrace } from '../parsers';
import { installGlobalHandler, installGlobalUnhandledRejectionHandler, subscribe, } from '../tracekit';
import { shouldIgnoreOnError } from './helpers';
/** Global handlers */
export class GlobalHandlers {
    /** JSDoc */
    constructor(options) {
        /**
         * @inheritDoc
         */
        this.name = GlobalHandlers.id;
        this.options = {
            onerror: true,
            onunhandledrejection: true,
            ...options,
        };
    }
    /**
     * @inheritDoc
     */
    setupOnce() {
        subscribe((stack, _, error) => {
            // TODO: use stack.context to get a valuable information from TraceKit, eg.
            // [
            //   0: "  })"
            //   1: ""
            //   2: "  function foo () {"
            //   3: "    Sentry.captureException('some error')"
            //   4: "    Sentry.captureMessage('some message')"
            //   5: "    throw 'foo'"
            //   6: "  }"
            //   7: ""
            //   8: "  function bar () {"
            //   9: "    foo();"
            //   10: "  }"
            // ]
            if (shouldIgnoreOnError()) {
                return;
            }
            const self = getCurrentHub().getIntegration(GlobalHandlers);
            if (self) {
                getCurrentHub().captureEvent(self.eventFromGlobalHandler(stack), { originalException: error, data: { stack } });
            }
        });
        if (this.options.onerror) {
            logger.log('Global Handler attached: onerror');
            installGlobalHandler();
        }
        if (this.options.onunhandledrejection) {
            logger.log('Global Handler attached: onunhandledrejection');
            installGlobalUnhandledRejectionHandler();
        }
    }
    /**
     * This function creates an SentryEvent from an TraceKitStackTrace.
     *
     * @param stacktrace TraceKitStackTrace to be converted to an SentryEvent.
     */
    eventFromGlobalHandler(stacktrace) {
        const event = eventFromStacktrace(stacktrace);
        const data = {
            mode: stacktrace.mode,
        };
        if (stacktrace.message) {
            data.message = stacktrace.message;
        }
        if (stacktrace.name) {
            data.name = stacktrace.name;
        }
        const newEvent = {
            ...event,
            exception: {
                ...event.exception,
                mechanism: {
                    data,
                    handled: false,
                    type: stacktrace.mechanism,
                },
            },
        };
        const fallbackValue = typeof stacktrace.original !== 'undefined'
            ? `${truncate(serialize(safeNormalize(stacktrace.original)), 300)}`
            : '';
        const fallbackType = stacktrace.mechanism === 'onunhandledrejection' ? 'UnhandledRejection' : 'Error';
        // This makes sure we have type/value in every exception
        addExceptionTypeValue(newEvent, fallbackValue, fallbackType);
        return newEvent;
    }
}
/**
 * @inheritDoc
 */
GlobalHandlers.id = 'GlobalHandlers';
//# sourceMappingURL=globalhandlers.js.map