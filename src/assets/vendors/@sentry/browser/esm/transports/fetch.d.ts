import { SentryResponse } from '@sentry/types/esm';
import { BaseTransport } from './base';
/** `fetch` based transport */
export declare class FetchTransport extends BaseTransport {
    /**
     * @inheritDoc
     */
    sendEvent(body: string): Promise<SentryResponse>;
}
