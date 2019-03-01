import { getCurrentHub, initAndBind, Integrations as CoreIntegrations } from '@sentry/core/esm';
import { BrowserClient } from './client';
import { Breadcrumbs, GlobalHandlers, LinkedErrors, TryCatch, UserAgent } from './integrations';
export const defaultIntegrations = [
    // Common
    new CoreIntegrations.Dedupe(),
    new CoreIntegrations.InboundFilters(),
    new CoreIntegrations.FunctionToString(),
    new CoreIntegrations.ExtraErrorData(),
    // Native Wrappers
    new TryCatch(),
    new Breadcrumbs(),
    // Global Handlers
    new GlobalHandlers(),
    // Misc
    new LinkedErrors(),
    new UserAgent(),
];
/**
 * The Sentry Browser SDK Client.
 *
 * To use this SDK, call the {@link init} function as early as possible when
 * loading the web page. To set context information or send manual events, use
 * the provided methods.
 *
 * @example
 * import { init } from '@sentry/browser/esm';
 *
 * init({
 *   dsn: '__DSN__',
 *   // ...
 * });
 *
 * @example
 * import { configureScope } from '@sentry/browser/esm';
 * configureScope((scope: Scope) => {
 *   scope.setExtra({ battery: 0.7 });
 *   scope.setTag({ user_mode: 'admin' });
 *   scope.setUser({ id: '4711' });
 * });
 *
 * @example
 * import { addBreadcrumb } from '@sentry/browser/esm';
 * addBreadcrumb({
 *   message: 'My Breadcrumb',
 *   // ...
 * });
 *
 * @example
 * import * as Sentry from '@sentry/browser';
 * Sentry.captureMessage('Hello, world!');
 * Sentry.captureException(new Error('Good bye'));
 * Sentry.captureEvent({
 *   message: 'Manual',
 *   stacktrace: [
 *     // ...
 *   ],
 * });
 *
 * @see BrowserOptions for documentation on configuration options.
 */
export function init(options = {}) {
    if (options.defaultIntegrations === undefined) {
        options.defaultIntegrations = defaultIntegrations;
    }
    initAndBind(BrowserClient, options);
}
/**
 * Present the user with a report dialog.
 *
 * @param options Everything is optional, we try to fetch all info need from the global scope.
 */
export function showReportDialog(options = {}) {
    if (!options.eventId) {
        options.eventId = getCurrentHub().lastEventId();
    }
    getCurrentHub().getClient().showReportDialog(options);
}
/**
 * This is the getter for lastEventId.
 *
 * @returns The last event id of a captured event.
 */
export function lastEventId() {
    return getCurrentHub().lastEventId();
}
/**
 * This function is here to be API compatible with the loader
 */
export function forceLoad() {
    // Noop
}
/**
 * This function is here to be API compatible with the loader
 */
export function onLoad(callback) {
    callback();
}
/**
 * A promise that resolves when all current events have been sent.
 * If you provide a timeout and the queue takes longer to drain the promise returns false.
 *
 * @param timeout Maximum time in ms the client should wait.
 */
export async function flush(timeout) {
    return getCurrentHub().getClient().flush(timeout);
}
/**
 * A promise that resolves when all current events have been sent.
 * If you provide a timeout and the queue takes longer to drain the promise returns false.
 *
 * @param timeout Maximum time in ms the client should wait.
 */
export async function close(timeout) {
    return getCurrentHub().getClient().close(timeout);
}
//# sourceMappingURL=sdk.js.map