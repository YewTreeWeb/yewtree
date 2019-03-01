import { captureException, getCurrentHub, withScope } from '@sentry/core/esm';
import { isPlainObject, isUndefined } from '@sentry/utils/esm/is';
import { logger } from '@sentry/utils/esm/logger';
import { getGlobalObject } from '@sentry/utils/esm/misc';
/** JSDoc */
export class Vue {
    /**
     * @inheritDoc
     */
    constructor(options = {}) {
        /**
         * @inheritDoc
         */
        this.name = Vue.id;
        this.Vue =
            options.Vue ||
                getGlobalObject().Vue;
        this.attachProps = options.attachProps || true;
    }
    /** JSDoc */
    formatComponentName(vm) {
        if (vm.$root === vm) {
            return 'root instance';
        }
        const name = vm._isVue ? vm.$options.name || vm.$options._componentTag : vm.name;
        return ((name ? `component <${name}>` : 'anonymous component') +
            (vm._isVue && vm.$options.__file ? ` at ${vm.$options.__file}` : ''));
    }
    /**
     * @inheritDoc
     */
    setupOnce() {
        if (!this.Vue || !this.Vue.config) {
            logger.error('VueIntegration is missing a Vue instance');
            return;
        }
        const oldOnError = this.Vue.config.errorHandler;
        this.Vue.config.errorHandler = (error, vm, info) => {
            const metadata = {};
            if (isPlainObject(vm)) {
                metadata.componentName = this.formatComponentName(vm);
                if (this.attachProps) {
                    metadata.propsData = vm.$options.propsData;
                }
            }
            if (!isUndefined(info)) {
                metadata.lifecycleHook = info;
            }
            if (getCurrentHub().getIntegration(Vue)) {
                withScope(scope => {
                    Object.keys(metadata).forEach(key => {
                        scope.setExtra(key, metadata[key]);
                    });
                    scope.addEventProcessor(async (event) => {
                        if (event.sdk) {
                            const integrations = event.sdk.integrations || [];
                            event.sdk = {
                                ...event.sdk,
                                integrations: [...integrations, 'vue'],
                            };
                        }
                        return event;
                    });
                    captureException(error);
                });
            }
            if (typeof oldOnError === 'function') {
                oldOnError.call(this.Vue, error, vm, info);
            }
        };
    }
}
/**
 * @inheritDoc
 */
Vue.id = 'Vue';
//# sourceMappingURL=vue.js.map