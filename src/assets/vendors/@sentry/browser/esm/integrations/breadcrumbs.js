import { API, getCurrentHub } from '@sentry/core/esm';
import { Severity } from '@sentry/types/esm';
import { isFunction, isString } from '@sentry/utils/esm/is';
import { logger } from '@sentry/utils/esm/logger';
import { getEventDescription, getGlobalObject, parseUrl } from '@sentry/utils/esm/misc';
import { deserialize, fill, safeNormalize } from '@sentry/utils/esm/object';
import { includes, safeJoin } from '@sentry/utils/esm/string';
import { supportsBeacon, supportsHistory, supportsNativeFetch } from '@sentry/utils/esm/supports';
import { breadcrumbEventHandler, keypressEventHandler, wrap } from './helpers';
const global = getGlobalObject();
let lastHref;
/** Default Breadcrumbs instrumentations */
export class Breadcrumbs {
    /**
     * @inheritDoc
     */
    constructor(options) {
        /**
         * @inheritDoc
         */
        this.name = Breadcrumbs.id;
        this.options = {
            beacon: true,
            console: true,
            dom: true,
            fetch: true,
            history: true,
            sentry: true,
            xhr: true,
            ...options,
        };
    }
    /** JSDoc */
    instrumentBeacon() {
        if (!supportsBeacon()) {
            return;
        }
        /** JSDoc */
        function beaconReplacementFunction(originalBeaconFunction) {
            return function (...args) {
                const url = args[0];
                const data = args[1];
                // If the browser successfully queues the request for delivery, the method returns "true" and returns "false" otherwise.
                // https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API/Using_the_Beacon_API
                const result = originalBeaconFunction.apply(this, args);
                const client = getCurrentHub().getClient();
                const dsn = client && client.getDsn();
                if (dsn) {
                    const filterUrl = new API(dsn).getStoreEndpoint();
                    // if Sentry key appears in URL, don't capture it as a request
                    // but rather as our own 'sentry' type breadcrumb
                    if (filterUrl && includes(url, filterUrl)) {
                        addSentryBreadcrumb(data);
                        return result;
                    }
                }
                // What is wrong with you TypeScript...
                const breadcrumbData = {
                    category: 'beacon',
                    data,
                    type: 'http',
                };
                if (!result) {
                    breadcrumbData.level = Severity.Error;
                }
                Breadcrumbs.addBreadcrumb(breadcrumbData, {
                    input: args,
                    result,
                });
                return result;
            };
        }
        fill(global.navigator, 'sendBeacon', beaconReplacementFunction);
    }
    /** JSDoc */
    instrumentConsole() {
        if (!('console' in global)) {
            return;
        }
        ['debug', 'info', 'warn', 'error', 'log'].forEach(function (level) {
            if (!(level in global.console)) {
                return;
            }
            fill(global.console, level, function (originalConsoleLevel) {
                return function (...args) {
                    const breadcrumbData = {
                        category: 'console',
                        data: {
                            extra: {
                                arguments: safeNormalize(args, 3),
                            },
                            logger: 'console',
                        },
                        level: Severity.fromString(level),
                        message: safeJoin(args, ' '),
                    };
                    if (level === 'assert') {
                        if (args[0] === false) {
                            breadcrumbData.message = `Assertion failed: ${safeJoin(args.slice(1), ' ') || 'console.assert'}`;
                            breadcrumbData.data.extra.arguments = safeNormalize(args.slice(1), 3);
                        }
                    }
                    Breadcrumbs.addBreadcrumb(breadcrumbData, {
                        input: args,
                        level,
                    });
                    // this fails for some browsers. :(
                    if (originalConsoleLevel) {
                        Function.prototype.apply.call(originalConsoleLevel, global.console, args);
                    }
                };
            });
        });
    }
    /** JSDoc */
    instrumentDOM() {
        if (!('document' in global)) {
            return;
        }
        // Capture breadcrumbs from any click that is unhandled / bubbled up all the way
        // to the document. Do this before we instrument addEventListener.
        global.document.addEventListener('click', breadcrumbEventHandler('click'), false);
        global.document.addEventListener('keypress', keypressEventHandler(), false);
    }
    /** JSDoc */
    instrumentFetch() {
        if (!supportsNativeFetch()) {
            return;
        }
        fill(global, 'fetch', function (originalFetch) {
            return function (...args) {
                const fetchInput = args[0];
                let method = 'GET';
                let url;
                if (typeof fetchInput === 'string') {
                    url = fetchInput;
                }
                else if ('Request' in global && fetchInput instanceof Request) {
                    url = fetchInput.url;
                    if (fetchInput.method) {
                        method = fetchInput.method;
                    }
                }
                else {
                    url = String(fetchInput);
                }
                if (args[1] && args[1].method) {
                    method = args[1].method;
                }
                const client = getCurrentHub().getClient();
                const dsn = client && client.getDsn();
                if (dsn) {
                    const filterUrl = new API(dsn).getStoreEndpoint();
                    // if Sentry key appears in URL, don't capture it as a request
                    // but rather as our own 'sentry' type breadcrumb
                    if (filterUrl && includes(url, filterUrl)) {
                        if (method === 'POST' && args[1] && args[1].body) {
                            addSentryBreadcrumb(args[1].body);
                        }
                        return originalFetch.apply(global, args);
                    }
                }
                const fetchData = {
                    method,
                    url,
                };
                return originalFetch
                    .apply(global, args)
                    .then((response) => {
                    fetchData.status_code = response.status;
                    Breadcrumbs.addBreadcrumb({
                        category: 'fetch',
                        data: fetchData,
                        type: 'http',
                    }, {
                        input: args,
                        response,
                    });
                    return response;
                })
                    .catch((error) => {
                    Breadcrumbs.addBreadcrumb({
                        category: 'fetch',
                        data: fetchData,
                        level: Severity.Error,
                        type: 'http',
                    }, {
                        error,
                        input: args,
                    });
                    throw error;
                });
            };
        });
    }
    /** JSDoc */
    instrumentHistory() {
        if (!supportsHistory()) {
            return;
        }
        const captureUrlChange = (from, to) => {
            const parsedLoc = parseUrl(global.location.href);
            const parsedTo = parseUrl(to);
            let parsedFrom = parseUrl(from);
            // Initial pushState doesn't provide `from` information
            if (!parsedFrom.path) {
                parsedFrom = parsedLoc;
            }
            // because onpopstate only tells you the "new" (to) value of location.href, and
            // not the previous (from) value, we need to track the value of the current URL
            // state ourselves
            lastHref = to;
            // Use only the path component of the URL if the URL matches the current
            // document (almost all the time when using pushState)
            if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
                // tslint:disable-next-line:no-parameter-reassignment
                to = parsedTo.relative;
            }
            if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
                // tslint:disable-next-line:no-parameter-reassignment
                from = parsedFrom.relative;
            }
            Breadcrumbs.addBreadcrumb({
                category: 'navigation',
                data: {
                    from,
                    to,
                },
            });
        };
        // record navigation (URL) changes
        const oldOnPopState = global.onpopstate;
        global.onpopstate = (...args) => {
            const currentHref = global.location.href;
            captureUrlChange(lastHref, currentHref);
            if (oldOnPopState) {
                return oldOnPopState.apply(this, args);
            }
        };
        /** JSDoc */
        function historyReplacementFunction(originalHistoryFunction) {
            // note history.pushState.length is 0; intentionally not declaring
            // params to preserve 0 arity
            return function (...args) {
                const url = args.length > 2 ? args[2] : undefined;
                // url argument is optional
                if (url) {
                    // coerce to string (this is what pushState does)
                    captureUrlChange(lastHref, String(url));
                }
                return originalHistoryFunction.apply(this, args);
            };
        }
        fill(global.history, 'pushState', historyReplacementFunction);
        fill(global.history, 'replaceState', historyReplacementFunction);
    }
    /** JSDoc */
    instrumentXHR() {
        if (!('XMLHttpRequest' in global)) {
            return;
        }
        /** JSDoc */
        function wrapProp(prop, xhr) {
            // TODO: Fix XHR types
            if (prop in xhr && isFunction(xhr[prop])) {
                fill(xhr, prop, original => wrap(original, {
                    mechanism: {
                        data: {
                            function: prop,
                            handler: (original && original.name) || '<anonymous>',
                        },
                        handled: true,
                        type: 'instrument',
                    },
                }));
            }
        }
        const xhrproto = XMLHttpRequest.prototype;
        fill(xhrproto, 'open', originalOpen => function (...args) {
            const url = args[1];
            this.__sentry_xhr__ = {
                method: args[0],
                url: args[1],
            };
            const client = getCurrentHub().getClient();
            const dsn = client && client.getDsn();
            if (dsn) {
                const filterUrl = new API(dsn).getStoreEndpoint();
                // if Sentry key appears in URL, don't capture it as a request
                // but rather as our own 'sentry' type breadcrumb
                if (isString(url) && (filterUrl && includes(url, filterUrl))) {
                    this.__sentry_own_request__ = true;
                }
            }
            return originalOpen.apply(this, args);
        });
        fill(xhrproto, 'send', originalSend => function (...args) {
            const xhr = this; // tslint:disable-line:no-this-assignment
            if (xhr.__sentry_own_request__) {
                addSentryBreadcrumb(args[0]);
            }
            /** JSDoc */
            function onreadystatechangeHandler() {
                if (xhr.readyState === 4) {
                    if (xhr.__sentry_own_request__) {
                        return;
                    }
                    try {
                        // touching statusCode in some platforms throws
                        // an exception
                        if (xhr.__sentry_xhr__) {
                            xhr.__sentry_xhr__.status_code = xhr.status;
                        }
                    }
                    catch (e) {
                        /* do nothing */
                    }
                    Breadcrumbs.addBreadcrumb({
                        category: 'xhr',
                        data: xhr.__sentry_xhr__,
                        type: 'http',
                    }, {
                        xhr,
                    });
                }
            }
            ['onload', 'onerror', 'onprogress'].forEach(prop => {
                wrapProp(prop, xhr);
            });
            if ('onreadystatechange' in xhr && isFunction(xhr.onreadystatechange)) {
                fill(xhr, 'onreadystatechange', function (original) {
                    return wrap(original, {
                        mechanism: {
                            data: {
                                function: 'onreadystatechange',
                                handler: (original && original.name) || '<anonymous>',
                            },
                            handled: true,
                            type: 'instrument',
                        },
                    }, onreadystatechangeHandler);
                });
            }
            else {
                // if onreadystatechange wasn't actually set by the page on this xhr, we
                // are free to set our own and capture the breadcrumb
                xhr.onreadystatechange = onreadystatechangeHandler;
            }
            return originalSend.apply(this, args);
        });
    }
    /**
     * Helper that checks if integration is enabled on the client.
     * @param breadcrumb Breadcrumb
     * @param hint SentryBreadcrumbHint
     */
    static addBreadcrumb(breadcrumb, hint) {
        if (getCurrentHub().getIntegration(Breadcrumbs)) {
            getCurrentHub().addBreadcrumb(breadcrumb, hint);
        }
    }
    /**
     * Instrument browser built-ins w/ breadcrumb capturing
     *  - Console API
     *  - DOM API (click/typing)
     *  - XMLHttpRequest API
     *  - Fetch API
     *  - History API
     */
    setupOnce() {
        if (this.options.console) {
            this.instrumentConsole();
        }
        if (this.options.dom) {
            this.instrumentDOM();
        }
        if (this.options.xhr) {
            this.instrumentXHR();
        }
        if (this.options.fetch) {
            this.instrumentFetch();
        }
        if (this.options.beacon) {
            this.instrumentBeacon();
        }
        if (this.options.history) {
            this.instrumentHistory();
        }
    }
}
/**
 * @inheritDoc
 */
Breadcrumbs.id = 'Breadcrumbs';
/** JSDoc */
function addSentryBreadcrumb(serializedData) {
    // There's always something that can go wrong with deserialization...
    try {
        const event = deserialize(serializedData);
        Breadcrumbs.addBreadcrumb({
            category: 'sentry',
            event_id: event.event_id,
            level: event.level || Severity.fromString('error'),
            message: getEventDescription(event),
        }, {
            event,
        });
    }
    catch (_oO) {
        logger.error('Error while adding sentry type breadcrumb');
    }
}
//# sourceMappingURL=breadcrumbs.js.map