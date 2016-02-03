var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/core';
import { Request } from '../static_request';
import { ReadyState } from '../enums';
import { isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/subject/ReplaySubject';
import { take } from 'rxjs/operator/take';
/**
 *
 * Mock Connection to represent a {@link Connection} for tests.
 *
 **/
export class MockConnection {
    constructor(req) {
        this.response = take.call(new ReplaySubject(1), 1);
        this.readyState = ReadyState.Open;
        this.request = req;
    }
    /**
     * Sends a mock response to the connection. This response is the value that is emitted to the
     * {@link EventEmitter} returned by {@link Http}.
     *
     * ### Example
     *
     * ```
     * var connection;
     * backend.connections.subscribe(c => connection = c);
     * http.request('data.json').subscribe(res => console.log(res.text()));
     * connection.mockRespond(new Response('fake response')); //logs 'fake response'
     * ```
     *
     */
    mockRespond(res) {
        if (this.readyState === ReadyState.Done || this.readyState === ReadyState.Cancelled) {
            throw new BaseException('Connection has already been resolved');
        }
        this.readyState = ReadyState.Done;
        this.response.next(res);
        this.response.complete();
    }
    /**
     * Not yet implemented!
     *
     * Sends the provided {@link Response} to the `downloadObserver` of the `Request`
     * associated with this connection.
     */
    mockDownload(res) {
        // this.request.downloadObserver.onNext(res);
        // if (res.bytesLoaded === res.totalBytes) {
        //   this.request.downloadObserver.onCompleted();
        // }
    }
    // TODO(jeffbcross): consider using Response type
    /**
     * Emits the provided error object as an error to the {@link Response} {@link EventEmitter}
     * returned
     * from {@link Http}.
     */
    mockError(err) {
        // Matches XHR semantics
        this.readyState = ReadyState.Done;
        this.response.error(err);
    }
}
/**
 * A mock backend for testing the {@link Http} service.
 *
 * This class can be injected in tests, and should be used to override providers
 * to other backends, such as {@link XHRBackend}.
 *
 * ### Example
 *
 * ```
 * import {BaseRequestOptions, Http} from 'angular2/http';
 * import {MockBackend} from 'angular2/http/testing';
 * it('should get some data', inject([AsyncTestCompleter], (async) => {
 *   var connection;
 *   var injector = Injector.resolveAndCreate([
 *     MockBackend,
 *     provide(Http, {useFactory: (backend, options) => {
 *       return new Http(backend, options);
 *     }, deps: [MockBackend, BaseRequestOptions]})]);
 *   var http = injector.get(Http);
 *   var backend = injector.get(MockBackend);
 *   //Assign any newly-created connection to local variable
 *   backend.connections.subscribe(c => connection = c);
 *   http.request('data.json').subscribe((res) => {
 *     expect(res.text()).toBe('awesome');
 *     async.done();
 *   });
 *   connection.mockRespond(new Response('awesome'));
 * }));
 * ```
 *
 * This method only exists in the mock implementation, not in real Backends.
 **/
export let MockBackend = class {
    constructor() {
        this.connectionsArray = [];
        this.connections = new Subject();
        this.connections.subscribe((connection) => this.connectionsArray.push(connection));
        this.pendingConnections = new Subject();
    }
    /**
     * Checks all connections, and raises an exception if any connection has not received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    verifyNoPendingRequests() {
        let pending = 0;
        this.pendingConnections.subscribe((c) => pending++);
        if (pending > 0)
            throw new BaseException(`${pending} pending connections to be resolved`);
    }
    /**
     * Can be used in conjunction with `verifyNoPendingRequests` to resolve any not-yet-resolve
     * connections, if it's expected that there are connections that have not yet received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    resolveAllConnections() { this.connections.subscribe((c) => c.readyState = 4); }
    /**
     * Creates a new {@link MockConnection}. This is equivalent to calling `new
     * MockConnection()`, except that it also will emit the new `Connection` to the `connections`
     * emitter of this `MockBackend` instance. This method will usually only be used by tests
     * against the framework itself, not by end-users.
     */
    createConnection(req) {
        if (!isPresent(req) || !(req instanceof Request)) {
            throw new BaseException(`createConnection requires an instance of Request, got ${req}`);
        }
        let connection = new MockConnection(req);
        this.connections.next(connection);
        return connection;
    }
};
MockBackend = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockBackend);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19iYWNrZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2h0dHAvYmFja2VuZHMvbW9ja19iYWNrZW5kLnRzIl0sIm5hbWVzIjpbIk1vY2tDb25uZWN0aW9uIiwiTW9ja0Nvbm5lY3Rpb24uY29uc3RydWN0b3IiLCJNb2NrQ29ubmVjdGlvbi5tb2NrUmVzcG9uZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tEb3dubG9hZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tFcnJvciIsIk1vY2tCYWNrZW5kIiwiTW9ja0JhY2tlbmQuY29uc3RydWN0b3IiLCJNb2NrQmFja2VuZC52ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0cyIsIk1vY2tCYWNrZW5kLnJlc29sdmVBbGxDb25uZWN0aW9ucyIsIk1vY2tCYWNrZW5kLmNyZWF0ZUNvbm5lY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZTtPQUNqQyxFQUFDLE9BQU8sRUFBQyxNQUFNLG1CQUFtQjtPQUVsQyxFQUFDLFVBQVUsRUFBQyxNQUFNLFVBQVU7T0FFNUIsRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FDM0MsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsT0FBTyxFQUFDLE1BQU0sY0FBYztPQUM3QixFQUFDLGFBQWEsRUFBQyxNQUFNLDRCQUE0QjtPQUNqRCxFQUFDLElBQUksRUFBQyxNQUFNLG9CQUFvQjtBQUV2Qzs7OztJQUlJO0FBQ0o7SUFvQkVBLFlBQVlBLEdBQVlBO1FBQ3RCQyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNuREEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbENBLElBQUlBLENBQUNBLE9B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QUFHQSxJQUFJQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN6Q0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDbENBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO0lBQ3BCQSxDQUFDQTtBQUNISixDQUFDQTtBQTdGRDtJQUFDLFVBQVUsRUFBRTs7Z0JBNkZaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtSZXF1ZXN0fSBmcm9tICcuLi9zdGF0aWNfcmVxdWVzdCc7XG5pbXBvcnQge1Jlc3BvbnNlfSBmcm9tICcuLi9zdGF0aWNfcmVzcG9uc2UnO1xuaW1wb3J0IHtSZWFkeVN0YXRlfSBmcm9tICcuLi9lbnVtcyc7XG5pbXBvcnQge0Nvbm5lY3Rpb24sIENvbm5lY3Rpb25CYWNrZW5kfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7aXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzL1N1YmplY3QnO1xuaW1wb3J0IHtSZXBsYXlTdWJqZWN0fSBmcm9tICdyeGpzL3N1YmplY3QvUmVwbGF5U3ViamVjdCc7XG5pbXBvcnQge3Rha2V9IGZyb20gJ3J4anMvb3BlcmF0b3IvdGFrZSc7XG5cbi8qKlxuICpcbiAqIE1vY2sgQ29ubmVjdGlvbiB0byByZXByZXNlbnQgYSB7QGxpbmsgQ29ubmVjdGlvbn0gZm9yIHRlc3RzLlxuICpcbiAqKi9cbmV4cG9ydCBjbGFzcyBNb2NrQ29ubmVjdGlvbiBpbXBsZW1lbnRzIENvbm5lY3Rpb24ge1xuICAvLyBUT0RPIE5hbWUgYHJlYWR5U3RhdGVgIHNob3VsZCBjaGFuZ2UgdG8gYmUgbW9yZSBnZW5lcmljLCBhbmQgc3RhdGVzIGNvdWxkIGJlIG1hZGUgdG8gYmUgbW9yZVxuICAvLyBkZXNjcmlwdGl2ZSB0aGFuIFhIUiBzdGF0ZXMuXG4gIC8qKlxuICAgKiBEZXNjcmliZXMgdGhlIHN0YXRlIG9mIHRoZSBjb25uZWN0aW9uLCBiYXNlZCBvbiBgWE1MSHR0cFJlcXVlc3QucmVhZHlTdGF0ZWAsIGJ1dCB3aXRoXG4gICAqIGFkZGl0aW9uYWwgc3RhdGVzLiBGb3IgZXhhbXBsZSwgc3RhdGUgNSBpbmRpY2F0ZXMgYW4gYWJvcnRlZCBjb25uZWN0aW9uLlxuICAgKi9cbiAgcmVhZHlTdGF0ZTogUmVhZHlTdGF0ZTtcblxuICAvKipcbiAgICoge0BsaW5rIFJlcXVlc3R9IGluc3RhbmNlIHVzZWQgdG8gY3JlYXRlIHRoZSBjb25uZWN0aW9uLlxuICAgKi9cbiAgcmVxdWVzdDogUmVxdWVzdDtcblxuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn0gb2Yge0BsaW5rIFJlc3BvbnNlfS4gQ2FuIGJlIHN1YnNjcmliZWQgdG8gaW4gb3JkZXIgdG8gYmUgbm90aWZpZWQgd2hlbiBhXG4gICAqIHJlc3BvbnNlIGlzIGF2YWlsYWJsZS5cbiAgICovXG4gIHJlc3BvbnNlOiBSZXBsYXlTdWJqZWN0PFJlc3BvbnNlPjtcblxuICBjb25zdHJ1Y3RvcihyZXE6IFJlcXVlc3QpIHtcbiAgICB0aGlzLnJlc3BvbnNlID0gdGFrZS5jYWxsKG5ldyBSZXBsYXlTdWJqZWN0KDEpLCAxKTtcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlLk9wZW47XG4gICAgdGhpcy5yZXF1ZXN0ID0gcmVxO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgbW9jayByZXNwb25zZSB0byB0aGUgY29ubmVjdGlvbi4gVGhpcyByZXNwb25zZSBpcyB0aGUgdmFsdWUgdGhhdCBpcyBlbWl0dGVkIHRvIHRoZVxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfSByZXR1cm5lZCBieSB7QGxpbmsgSHR0cH0uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiB2YXIgY29ubmVjdGlvbjtcbiAgICogYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoYyA9PiBjb25uZWN0aW9uID0gYyk7XG4gICAqIGh0dHAucmVxdWVzdCgnZGF0YS5qc29uJykuc3Vic2NyaWJlKHJlcyA9PiBjb25zb2xlLmxvZyhyZXMudGV4dCgpKSk7XG4gICAqIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKCdmYWtlIHJlc3BvbnNlJykpOyAvL2xvZ3MgJ2Zha2UgcmVzcG9uc2UnXG4gICAqIGBgYFxuICAgKlxuICAgKi9cbiAgbW9ja1Jlc3BvbmQocmVzOiBSZXNwb25zZSkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFJlYWR5U3RhdGUuRG9uZSB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IFJlYWR5U3RhdGUuQ2FuY2VsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQ29ubmVjdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlc29sdmVkJyk7XG4gICAgfVxuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGUuRG9uZTtcbiAgICB0aGlzLnJlc3BvbnNlLm5leHQocmVzKTtcbiAgICB0aGlzLnJlc3BvbnNlLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogTm90IHlldCBpbXBsZW1lbnRlZCFcbiAgICpcbiAgICogU2VuZHMgdGhlIHByb3ZpZGVkIHtAbGluayBSZXNwb25zZX0gdG8gdGhlIGBkb3dubG9hZE9ic2VydmVyYCBvZiB0aGUgYFJlcXVlc3RgXG4gICAqIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbm5lY3Rpb24uXG4gICAqL1xuICBtb2NrRG93bmxvYWQocmVzOiBSZXNwb25zZSkge1xuICAgIC8vIHRoaXMucmVxdWVzdC5kb3dubG9hZE9ic2VydmVyLm9uTmV4dChyZXMpO1xuICAgIC8vIGlmIChyZXMuYnl0ZXNMb2FkZWQgPT09IHJlcy50b3RhbEJ5dGVzKSB7XG4gICAgLy8gICB0aGlzLnJlcXVlc3QuZG93bmxvYWRPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vIFRPRE8oamVmZmJjcm9zcyk6IGNvbnNpZGVyIHVzaW5nIFJlc3BvbnNlIHR5cGVcbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBwcm92aWRlZCBlcnJvciBvYmplY3QgYXMgYW4gZXJyb3IgdG8gdGhlIHtAbGluayBSZXNwb25zZX0ge0BsaW5rIEV2ZW50RW1pdHRlcn1cbiAgICogcmV0dXJuZWRcbiAgICogZnJvbSB7QGxpbmsgSHR0cH0uXG4gICAqL1xuICBtb2NrRXJyb3IoZXJyPzogRXJyb3IpIHtcbiAgICAvLyBNYXRjaGVzIFhIUiBzZW1hbnRpY3NcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlLkRvbmU7XG4gICAgdGhpcy5yZXNwb25zZS5lcnJvcihlcnIpO1xuICB9XG59XG5cbi8qKlxuICogQSBtb2NrIGJhY2tlbmQgZm9yIHRlc3RpbmcgdGhlIHtAbGluayBIdHRwfSBzZXJ2aWNlLlxuICpcbiAqIFRoaXMgY2xhc3MgY2FuIGJlIGluamVjdGVkIGluIHRlc3RzLCBhbmQgc2hvdWxkIGJlIHVzZWQgdG8gb3ZlcnJpZGUgcHJvdmlkZXJzXG4gKiB0byBvdGhlciBiYWNrZW5kcywgc3VjaCBhcyB7QGxpbmsgWEhSQmFja2VuZH0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7QmFzZVJlcXVlc3RPcHRpb25zLCBIdHRwfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqIGltcG9ydCB7TW9ja0JhY2tlbmR9IGZyb20gJ2FuZ3VsYXIyL2h0dHAvdGVzdGluZyc7XG4gKiBpdCgnc2hvdWxkIGdldCBzb21lIGRhdGEnLCBpbmplY3QoW0FzeW5jVGVzdENvbXBsZXRlcl0sIChhc3luYykgPT4ge1xuICogICB2YXIgY29ubmVjdGlvbjtcbiAqICAgdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgICAgTW9ja0JhY2tlbmQsXG4gKiAgICAgcHJvdmlkZShIdHRwLCB7dXNlRmFjdG9yeTogKGJhY2tlbmQsIG9wdGlvbnMpID0+IHtcbiAqICAgICAgIHJldHVybiBuZXcgSHR0cChiYWNrZW5kLCBvcHRpb25zKTtcbiAqICAgICB9LCBkZXBzOiBbTW9ja0JhY2tlbmQsIEJhc2VSZXF1ZXN0T3B0aW9uc119KV0pO1xuICogICB2YXIgaHR0cCA9IGluamVjdG9yLmdldChIdHRwKTtcbiAqICAgdmFyIGJhY2tlbmQgPSBpbmplY3Rvci5nZXQoTW9ja0JhY2tlbmQpO1xuICogICAvL0Fzc2lnbiBhbnkgbmV3bHktY3JlYXRlZCBjb25uZWN0aW9uIHRvIGxvY2FsIHZhcmlhYmxlXG4gKiAgIGJhY2tlbmQuY29ubmVjdGlvbnMuc3Vic2NyaWJlKGMgPT4gY29ubmVjdGlvbiA9IGMpO1xuICogICBodHRwLnJlcXVlc3QoJ2RhdGEuanNvbicpLnN1YnNjcmliZSgocmVzKSA9PiB7XG4gKiAgICAgZXhwZWN0KHJlcy50ZXh0KCkpLnRvQmUoJ2F3ZXNvbWUnKTtcbiAqICAgICBhc3luYy5kb25lKCk7XG4gKiAgIH0pO1xuICogICBjb25uZWN0aW9uLm1vY2tSZXNwb25kKG5ldyBSZXNwb25zZSgnYXdlc29tZScpKTtcbiAqIH0pKTtcbiAqIGBgYFxuICpcbiAqIFRoaXMgbWV0aG9kIG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAqKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrQmFja2VuZCBpbXBsZW1lbnRzIENvbm5lY3Rpb25CYWNrZW5kIHtcbiAgLyoqXG4gICAqIHtAbGluayBFdmVudEVtaXR0ZXJ9XG4gICAqIG9mIHtAbGluayBNb2NrQ29ubmVjdGlvbn0gaW5zdGFuY2VzIHRoYXQgaGF2ZSBiZWVuIGNyZWF0ZWQgYnkgdGhpcyBiYWNrZW5kLiBDYW4gYmUgc3Vic2NyaWJlZFxuICAgKiB0byBpbiBvcmRlciB0byByZXNwb25kIHRvIGNvbm5lY3Rpb25zLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogaW1wb3J0IHtNb2NrQmFja2VuZCwgSHR0cCwgQmFzZVJlcXVlc3RPcHRpb25zfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAgICogaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gICAqXG4gICAqIGl0KCdzaG91bGQgZ2V0IGEgcmVzcG9uc2UnLCAoKSA9PiB7XG4gICAqICAgdmFyIGNvbm5lY3Rpb247IC8vdGhpcyB3aWxsIGJlIHNldCB3aGVuIGEgbmV3IGNvbm5lY3Rpb24gaXMgZW1pdHRlZCBmcm9tIHRoZSBiYWNrZW5kLlxuICAgKiAgIHZhciB0ZXh0OyAvL3RoaXMgd2lsbCBiZSBzZXQgZnJvbSBtb2NrIHJlc3BvbnNlXG4gICAqICAgdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgICBNb2NrQmFja2VuZCxcbiAgICogICAgIHByb3ZpZGUoSHR0cCwge3VzZUZhY3Rvcnk6IChiYWNrZW5kLCBvcHRpb25zKSB7XG4gICAqICAgICAgIHJldHVybiBuZXcgSHR0cChiYWNrZW5kLCBvcHRpb25zKTtcbiAgICogICAgIH0sIGRlcHM6IFtNb2NrQmFja2VuZCwgQmFzZVJlcXVlc3RPcHRpb25zXX1dKTtcbiAgICogICB2YXIgYmFja2VuZCA9IGluamVjdG9yLmdldChNb2NrQmFja2VuZCk7XG4gICAqICAgdmFyIGh0dHAgPSBpbmplY3Rvci5nZXQoSHR0cCk7XG4gICAqICAgYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoYyA9PiBjb25uZWN0aW9uID0gYyk7XG4gICAqICAgaHR0cC5yZXF1ZXN0KCdzb21ldGhpbmcuanNvbicpLnN1YnNjcmliZShyZXMgPT4ge1xuICAgKiAgICAgdGV4dCA9IHJlcy50ZXh0KCk7XG4gICAqICAgfSk7XG4gICAqICAgY29ubmVjdGlvbi5tb2NrUmVzcG9uZChuZXcgUmVzcG9uc2Uoe2JvZHk6ICdTb21ldGhpbmcnfSkpO1xuICAgKiAgIGV4cGVjdCh0ZXh0KS50b0JlKCdTb21ldGhpbmcnKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIGNvbm5lY3Rpb25zOiBhbnk7ICAvLzxNb2NrQ29ubmVjdGlvbj5cblxuICAvKipcbiAgICogQW4gYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgYGNvbm5lY3Rpb25zYC4gVGhpcyBhcnJheSB3aWxsIGJlIHVwZGF0ZWQgd2l0aCBlYWNoIGNvbm5lY3Rpb24gdGhhdFxuICAgKiBpcyBjcmVhdGVkIGJ5IHRoaXMgYmFja2VuZC5cbiAgICpcbiAgICogVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICBjb25uZWN0aW9uc0FycmF5OiBNb2NrQ29ubmVjdGlvbltdO1xuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn0gb2Yge0BsaW5rIE1vY2tDb25uZWN0aW9ufSBpbnN0YW5jZXMgdGhhdCBoYXZlbid0IHlldCBiZWVuIHJlc29sdmVkIChpLmUuXG4gICAqIHdpdGggYSBgcmVhZHlTdGF0ZWBcbiAgICogbGVzcyB0aGFuIDQpLiBVc2VkIGludGVybmFsbHkgdG8gdmVyaWZ5IHRoYXQgbm8gY29ubmVjdGlvbnMgYXJlIHBlbmRpbmcgdmlhIHRoZVxuICAgKiBgdmVyaWZ5Tm9QZW5kaW5nUmVxdWVzdHNgIG1ldGhvZC5cbiAgICpcbiAgICogVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICBwZW5kaW5nQ29ubmVjdGlvbnM6IGFueTsgIC8vIFN1YmplY3Q8TW9ja0Nvbm5lY3Rpb24+XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY29ubmVjdGlvbnNBcnJheSA9IFtdO1xuICAgIHRoaXMuY29ubmVjdGlvbnMgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuY29ubmVjdGlvbnMuc3Vic2NyaWJlKChjb25uZWN0aW9uOiBNb2NrQ29ubmVjdGlvbikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uc0FycmF5LnB1c2goY29ubmVjdGlvbikpO1xuICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IFN1YmplY3QoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgYWxsIGNvbm5lY3Rpb25zLCBhbmQgcmFpc2VzIGFuIGV4Y2VwdGlvbiBpZiBhbnkgY29ubmVjdGlvbiBoYXMgbm90IHJlY2VpdmVkIGEgcmVzcG9uc2UuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIHZlcmlmeU5vUGVuZGluZ1JlcXVlc3RzKCkge1xuICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICB0aGlzLnBlbmRpbmdDb25uZWN0aW9ucy5zdWJzY3JpYmUoKGM6IE1vY2tDb25uZWN0aW9uKSA9PiBwZW5kaW5nKyspO1xuICAgIGlmIChwZW5kaW5nID4gMCkgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYCR7cGVuZGluZ30gcGVuZGluZyBjb25uZWN0aW9ucyB0byBiZSByZXNvbHZlZGApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbiBiZSB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggYHZlcmlmeU5vUGVuZGluZ1JlcXVlc3RzYCB0byByZXNvbHZlIGFueSBub3QteWV0LXJlc29sdmVcbiAgICogY29ubmVjdGlvbnMsIGlmIGl0J3MgZXhwZWN0ZWQgdGhhdCB0aGVyZSBhcmUgY29ubmVjdGlvbnMgdGhhdCBoYXZlIG5vdCB5ZXQgcmVjZWl2ZWQgYSByZXNwb25zZS5cbiAgICpcbiAgICogVGhpcyBtZXRob2Qgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgcmVzb2x2ZUFsbENvbm5lY3Rpb25zKCkgeyB0aGlzLmNvbm5lY3Rpb25zLnN1YnNjcmliZSgoYzogTW9ja0Nvbm5lY3Rpb24pID0+IGMucmVhZHlTdGF0ZSA9IDQpOyB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcge0BsaW5rIE1vY2tDb25uZWN0aW9ufS4gVGhpcyBpcyBlcXVpdmFsZW50IHRvIGNhbGxpbmcgYG5ld1xuICAgKiBNb2NrQ29ubmVjdGlvbigpYCwgZXhjZXB0IHRoYXQgaXQgYWxzbyB3aWxsIGVtaXQgdGhlIG5ldyBgQ29ubmVjdGlvbmAgdG8gdGhlIGBjb25uZWN0aW9uc2BcbiAgICogZW1pdHRlciBvZiB0aGlzIGBNb2NrQmFja2VuZGAgaW5zdGFuY2UuIFRoaXMgbWV0aG9kIHdpbGwgdXN1YWxseSBvbmx5IGJlIHVzZWQgYnkgdGVzdHNcbiAgICogYWdhaW5zdCB0aGUgZnJhbWV3b3JrIGl0c2VsZiwgbm90IGJ5IGVuZC11c2Vycy5cbiAgICovXG4gIGNyZWF0ZUNvbm5lY3Rpb24ocmVxOiBSZXF1ZXN0KTogTW9ja0Nvbm5lY3Rpb24ge1xuICAgIGlmICghaXNQcmVzZW50KHJlcSkgfHwgIShyZXEgaW5zdGFuY2VvZiBSZXF1ZXN0KSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYGNyZWF0ZUNvbm5lY3Rpb24gcmVxdWlyZXMgYW4gaW5zdGFuY2Ugb2YgUmVxdWVzdCwgZ290ICR7cmVxfWApO1xuICAgIH1cbiAgICBsZXQgY29ubmVjdGlvbiA9IG5ldyBNb2NrQ29ubmVjdGlvbihyZXEpO1xuICAgIHRoaXMuY29ubmVjdGlvbnMubmV4dChjb25uZWN0aW9uKTtcbiAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgfVxufVxuIl19