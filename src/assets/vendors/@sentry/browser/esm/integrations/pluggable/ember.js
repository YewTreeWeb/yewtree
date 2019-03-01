import { captureException, captureMessage, getCurrentHub, withScope } from '@sentry/core/esm';
import { logger } from '@sentry/utils/esm/logger';
import { getGlobalObject } from '@sentry/utils/esm/misc';
/** JSDoc */
export class Ember {
    /**
     * @inheritDoc
     */
    constructor(options = {}) {
        /**
         * @inheritDoc
         */
        this.name = Ember.id;
        this.Ember =
            options.Ember ||
                getGlobalObject().Ember;
    }
    /**
     * @inheritDoc
     */
    setupOnce() {
        if (!this.Ember) {
            logger.error('EmberIntegration is missing an Ember instance');
            return;
        }
        const oldOnError = this.Ember.onerror;
        this.Ember.onerror = (error) => {
            if (getCurrentHub().getIntegration(Ember)) {
                withScope(scope => {
                    this.addIntegrationToSdkInfo(scope);
                    captureException(error);
                });
            }
            if (typeof oldOnError === 'function') {
                oldOnError.call(this.Ember, error);
            }
            else if (this.Ember.testing) {
                throw error;
            }
        };
        this.Ember.RSVP.on('error', (reason) => {
            if (getCurrentHub().getIntegration(Ember)) {
                withScope(scope => {
                    if (reason instanceof Error) {
                        scope.setExtra('context', 'Unhandled Promise error detected');
                        this.addIntegrationToSdkInfo(scope);
                        captureException(reason);
                    }
                    else {
                        scope.setExtra('reason', reason);
                        this.addIntegrationToSdkInfo(scope);
                        captureMessage('Unhandled Promise error detected');
                    }
                });
            }
        });
    }
    /**
     * Appends SDK integrations
     * @param scope The scope currently used.
     */
    addIntegrationToSdkInfo(scope) {
        scope.addEventProcessor(async (event) => {
            if (event.sdk) {
                const integrations = event.sdk.integrations || [];
                event.sdk = {
                    ...event.sdk,
                    integrations: [...integrations, 'ember'],
                };
            }
            return event;
        });
    }
}
/**
 * @inheritDoc
 */
Ember.id = 'Ember';
//# sourceMappingURL=ember.js.map