export { Severity, Status, } from '@sentry/types/esm';
export { addGlobalEventProcessor, addBreadcrumb, captureException, captureEvent, captureMessage, configureScope, withScope, getHubFromCarrier, getCurrentHub, Hub, Scope, } from '@sentry/core/esm';
export { BrowserBackend } from './backend';
export { BrowserClient } from './client';
export { defaultIntegrations, forceLoad, init, lastEventId, onLoad, showReportDialog, flush, close } from './sdk';
export { SDK_NAME, SDK_VERSION } from './version';
import { Integrations as CoreIntegrations } from '@sentry/core/esm';
import * as BrowserIntegrations from './integrations';
import * as Transports from './transports';
const INTEGRATIONS = {
    ...CoreIntegrations,
    ...BrowserIntegrations,
};
export { INTEGRATIONS as Integrations, Transports };
//# sourceMappingURL=index.js.map