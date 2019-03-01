import { PromiseBuffer } from '@sentry/core/esm';
import { SentryResponse, Transport, TransportOptions } from '@sentry/types/esm';
/** Base Transport class implementation */
export declare abstract class BaseTransport implements Transport {
    options: TransportOptions;
    /**
     * @inheritDoc
     */
    url: string;
    /** A simple buffer holding all requests. */
    protected readonly buffer: PromiseBuffer<SentryResponse>;
    constructor(options: TransportOptions);
    /**
     * @inheritDoc
     */
    sendEvent(_: string): Promise<SentryResponse>;
    /**
     * @inheritDoc
     */
    close(timeout?: number): Promise<boolean>;
}
