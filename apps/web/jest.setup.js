require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof global.Headers === 'undefined') {
    global.Headers = class Headers {
        constructor(init) { this.map = new Map(Object.entries(init || {})); }
        get(key) { return this.map.get(key) || null; }
        set(key, val) { this.map.set(key, val); }
    };
}
if (typeof global.Request === 'undefined') {
    global.Request = class Request { };
}
if (typeof global.Response === 'undefined') {
    global.Response = class Response {
        constructor(body, init) {
            this._body = body;
            this.status = init?.status || 200;
            this.headers = new global.Headers(init?.headers);
        }
        async json() { return typeof this._body === 'string' ? JSON.parse(this._body) : this._body; }
        async text() { return this._body; }
    };
}

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));
