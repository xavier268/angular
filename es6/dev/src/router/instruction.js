var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isPresent, isBlank, normalizeBlank, CONST_EXPR } from 'angular2/src/facade/lang';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { Injectable } from 'angular2/core';
/**
 * `RouteParams` is an immutable map of parameters for the given route
 * based on the url matcher and optional parameters for that route.
 *
 * You can inject `RouteParams` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, as: 'UserCmp'},
 * ])
 * class AppCmp {}
 *
 * @Component({ template: 'user: {{id}}' })
 * class UserCmp {
 *   id: string;
 *   constructor(params: RouteParams) {
 *     this.id = params.get('id');
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
export let RouteParams = class {
    constructor(params) {
        this.params = params;
    }
    get(param) { return normalizeBlank(StringMapWrapper.get(this.params, param)); }
};
RouteParams = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Object])
], RouteParams);
/**
 * `RouteData` is an immutable map of additional data you can configure in your {@link Route}.
 *
 * You can inject `RouteData` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {Component, View} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, routerBindings, RouteConfig} from 'angular2/router';
 *
 * @Component({...})
 * @View({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, as: 'UserCmp', data: {isAdmin: true}},
 * ])
 * class AppCmp {}
 *
 * @Component({...})
 * @View({ template: 'user: {{isAdmin}}' })
 * class UserCmp {
 *   string: isAdmin;
 *   constructor(data: RouteData) {
 *     this.isAdmin = data.get('isAdmin');
 *   }
 * }
 *
 * bootstrap(AppCmp, routerBindings(AppCmp));
 * ```
 */
export class RouteData {
    constructor(data = CONST_EXPR({})) {
        this.data = data;
    }
    get(key) { return normalizeBlank(StringMapWrapper.get(this.data, key)); }
}
export var BLANK_ROUTE_DATA = new RouteData();
/**
 * `Instruction` is a tree of {@link ComponentInstruction}s with all the information needed
 * to transition each component in the app to a given route, including all auxiliary routes.
 *
 * `Instruction`s can be created using {@link Router#generate}, and can be used to
 * perform route changes with {@link Router#navigateByInstruction}.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   constructor(router: Router) {
 *     var instruction = router.generate(['/MyRoute']);
 *     router.navigateByInstruction(instruction);
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
export class Instruction {
    constructor(component, child, auxInstruction) {
        this.component = component;
        this.child = child;
        this.auxInstruction = auxInstruction;
    }
    get urlPath() { return isPresent(this.component) ? this.component.urlPath : ''; }
    get urlParams() { return isPresent(this.component) ? this.component.urlParams : []; }
    get specificity() {
        var total = '';
        if (isPresent(this.component)) {
            total += this.component.specificity;
        }
        if (isPresent(this.child)) {
            total += this.child.specificity;
        }
        return total;
    }
    /**
     * converts the instruction into a URL string
     */
    toRootUrl() { return this.toUrlPath() + this.toUrlQuery(); }
    /** @internal */
    _toNonRootUrl() {
        return this._stringifyPathMatrixAuxPrefixed() +
            (isPresent(this.child) ? this.child._toNonRootUrl() : '');
    }
    toUrlQuery() { return this.urlParams.length > 0 ? ('?' + this.urlParams.join('&')) : ''; }
    /**
     * Returns a new instruction that shares the state of the existing instruction, but with
     * the given child {@link Instruction} replacing the existing child.
     */
    replaceChild(child) {
        return new ResolvedInstruction(this.component, child, this.auxInstruction);
    }
    /**
     * If the final URL for the instruction is ``
     */
    toUrlPath() {
        return this.urlPath + this._stringifyAux() +
            (isPresent(this.child) ? this.child._toNonRootUrl() : '');
    }
    // default instructions override these
    toLinkUrl() {
        return this.urlPath + this._stringifyAux() +
            (isPresent(this.child) ? this.child._toLinkUrl() : '');
    }
    // this is the non-root version (called recursively)
    /** @internal */
    _toLinkUrl() {
        return this._stringifyPathMatrixAuxPrefixed() +
            (isPresent(this.child) ? this.child._toLinkUrl() : '');
    }
    /** @internal */
    _stringifyPathMatrixAuxPrefixed() {
        var primary = this._stringifyPathMatrixAux();
        if (primary.length > 0) {
            primary = '/' + primary;
        }
        return primary;
    }
    /** @internal */
    _stringifyMatrixParams() {
        return this.urlParams.length > 0 ? (';' + this.urlParams.join(';')) : '';
    }
    /** @internal */
    _stringifyPathMatrixAux() {
        if (isBlank(this.component)) {
            return '';
        }
        return this.urlPath + this._stringifyMatrixParams() + this._stringifyAux();
    }
    /** @internal */
    _stringifyAux() {
        var routes = [];
        StringMapWrapper.forEach(this.auxInstruction, (auxInstruction, _) => {
            routes.push(auxInstruction._stringifyPathMatrixAux());
        });
        if (routes.length > 0) {
            return '(' + routes.join('//') + ')';
        }
        return '';
    }
}
/**
 * a resolved instruction has an outlet instruction for itself, but maybe not for...
 */
export class ResolvedInstruction extends Instruction {
    constructor(component, child, auxInstruction) {
        super(component, child, auxInstruction);
    }
    resolveComponent() {
        return PromiseWrapper.resolve(this.component);
    }
}
/**
 * Represents a resolved default route
 */
export class DefaultInstruction extends Instruction {
    constructor(component, child) {
        super(component, child, {});
    }
    resolveComponent() {
        return PromiseWrapper.resolve(this.component);
    }
    toLinkUrl() { return ''; }
    /** @internal */
    _toLinkUrl() { return ''; }
}
/**
 * Represents a component that may need to do some redirection or lazy loading at a later time.
 */
export class UnresolvedInstruction extends Instruction {
    constructor(_resolver, _urlPath = '', _urlParams = CONST_EXPR([])) {
        super(null, null, {});
        this._resolver = _resolver;
        this._urlPath = _urlPath;
        this._urlParams = _urlParams;
    }
    get urlPath() {
        if (isPresent(this.component)) {
            return this.component.urlPath;
        }
        if (isPresent(this._urlPath)) {
            return this._urlPath;
        }
        return '';
    }
    get urlParams() {
        if (isPresent(this.component)) {
            return this.component.urlParams;
        }
        if (isPresent(this._urlParams)) {
            return this._urlParams;
        }
        return [];
    }
    resolveComponent() {
        if (isPresent(this.component)) {
            return PromiseWrapper.resolve(this.component);
        }
        return this._resolver().then((resolution) => {
            this.child = resolution.child;
            return this.component = resolution.component;
        });
    }
}
export class RedirectInstruction extends ResolvedInstruction {
    constructor(component, child, auxInstruction, _specificity) {
        super(component, child, auxInstruction);
        this._specificity = _specificity;
    }
    get specificity() { return this._specificity; }
}
/**
 * A `ComponentInstruction` represents the route state for a single component. An `Instruction` is
 * composed of a tree of these `ComponentInstruction`s.
 *
 * `ComponentInstructions` is a public API. Instances of `ComponentInstruction` are passed
 * to route lifecycle hooks, like {@link CanActivate}.
 *
 * `ComponentInstruction`s are [hash consed](https://en.wikipedia.org/wiki/Hash_consing). You should
 * never construct one yourself with "new." Instead, rely on {@link Router/RouteRecognizer} to
 * construct `ComponentInstruction`s.
 *
 * You should not modify this object. It should be treated as immutable.
 */
export class ComponentInstruction {
    constructor(urlPath, urlParams, data, componentType, terminal, specificity, params = null) {
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this.componentType = componentType;
        this.terminal = terminal;
        this.specificity = specificity;
        this.params = params;
        this.reuse = false;
        this.routeData = isPresent(data) ? data : BLANK_ROUTE_DATA;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2luc3RydWN0aW9uLnRzIl0sIm5hbWVzIjpbIlJvdXRlUGFyYW1zIiwiUm91dGVQYXJhbXMuY29uc3RydWN0b3IiLCJSb3V0ZVBhcmFtcy5nZXQiLCJSb3V0ZURhdGEiLCJSb3V0ZURhdGEuY29uc3RydWN0b3IiLCJSb3V0ZURhdGEuZ2V0IiwiSW5zdHJ1Y3Rpb24iLCJJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIkluc3RydWN0aW9uLnVybFBhdGgiLCJJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkluc3RydWN0aW9uLnRvUm9vdFVybCIsIkluc3RydWN0aW9uLl90b05vblJvb3RVcmwiLCJJbnN0cnVjdGlvbi50b1VybFF1ZXJ5IiwiSW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkIiwiSW5zdHJ1Y3Rpb24udG9VcmxQYXRoIiwiSW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiSW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIkluc3RydWN0aW9uLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5TWF0cml4UGFyYW1zIiwiSW5zdHJ1Y3Rpb24uX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5QXV4IiwiUmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJSZXNvbHZlZEluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24iLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24ucmVzb2x2ZUNvbXBvbmVudCIsIkRlZmF1bHRJbnN0cnVjdGlvbi50b0xpbmtVcmwiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi51cmxQYXRoIiwiVW5yZXNvbHZlZEluc3RydWN0aW9uLnVybFBhcmFtcyIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi5yZXNvbHZlQ29tcG9uZW50IiwiUmVkaXJlY3RJbnN0cnVjdGlvbiIsIlJlZGlyZWN0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJSZWRpcmVjdEluc3RydWN0aW9uLnNwZWNpZmljaXR5IiwiQ29tcG9uZW50SW5zdHJ1Y3Rpb24iLCJDb21wb25lbnRJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBa0IsZ0JBQWdCLEVBQWMsTUFBTSxnQ0FBZ0M7T0FDdEYsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBUSxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDdEYsRUFBVSxjQUFjLEVBQUMsTUFBTSwyQkFBMkI7T0FDMUQsRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO0FBR3hDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTZCRztBQUNIO0lBRUVBLFlBQW1CQSxNQUErQkE7UUFBL0JDLFdBQU1BLEdBQU5BLE1BQU1BLENBQXlCQTtJQUFHQSxDQUFDQTtJQUV0REQsR0FBR0EsQ0FBQ0EsS0FBYUEsSUFBWUUsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNqR0YsQ0FBQ0E7QUFMRDtJQUFDLFVBQVUsRUFBRTs7Z0JBS1o7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJHO0FBQ0g7SUFDRUcsWUFBbUJBLElBQUlBLEdBQXlCQSxVQUFVQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUEzQ0Ms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Q0FBQ0E7QUFDSEQsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TWFwLCBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBub3JtYWxpemVCbGFuaywgVHlwZSwgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuXG4vKipcbiAqIGBSb3V0ZVBhcmFtc2AgaXMgYW4gaW1tdXRhYmxlIG1hcCBvZiBwYXJhbWV0ZXJzIGZvciB0aGUgZ2l2ZW4gcm91dGVcbiAqIGJhc2VkIG9uIHRoZSB1cmwgbWF0Y2hlciBhbmQgb3B0aW9uYWwgcGFyYW1ldGVycyBmb3IgdGhhdCByb3V0ZS5cbiAqXG4gKiBZb3UgY2FuIGluamVjdCBgUm91dGVQYXJhbXNgIGludG8gdGhlIGNvbnN0cnVjdG9yIG9mIGEgY29tcG9uZW50IHRvIHVzZSBpdC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtSb3V0ZXIsIFJPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAge3BhdGg6ICcvdXNlci86aWQnLCBjb21wb25lbnQ6IFVzZXJDbXAsIGFzOiAnVXNlckNtcCd9LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7fVxuICpcbiAqIEBDb21wb25lbnQoeyB0ZW1wbGF0ZTogJ3VzZXI6IHt7aWR9fScgfSlcbiAqIGNsYXNzIFVzZXJDbXAge1xuICogICBpZDogc3RyaW5nO1xuICogICBjb25zdHJ1Y3RvcihwYXJhbXM6IFJvdXRlUGFyYW1zKSB7XG4gKiAgICAgdGhpcy5pZCA9IHBhcmFtcy5nZXQoJ2lkJyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBST1VURVJfUFJPVklERVJTKTtcbiAqIGBgYFxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm91dGVQYXJhbXMge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge31cblxuICBnZXQocGFyYW06IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBub3JtYWxpemVCbGFuayhTdHJpbmdNYXBXcmFwcGVyLmdldCh0aGlzLnBhcmFtcywgcGFyYW0pKTsgfVxufVxuXG4vKipcbiAqIGBSb3V0ZURhdGFgIGlzIGFuIGltbXV0YWJsZSBtYXAgb2YgYWRkaXRpb25hbCBkYXRhIHlvdSBjYW4gY29uZmlndXJlIGluIHlvdXIge0BsaW5rIFJvdXRlfS5cbiAqXG4gKiBZb3UgY2FuIGluamVjdCBgUm91dGVEYXRhYCBpbnRvIHRoZSBjb25zdHJ1Y3RvciBvZiBhIGNvbXBvbmVudCB0byB1c2UgaXQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBWaWV3fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7Um91dGVyLCBST1VURVJfRElSRUNUSVZFUywgcm91dGVyQmluZGluZ3MsIFJvdXRlQ29uZmlnfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBAVmlldyh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHtwYXRoOiAnL3VzZXIvOmlkJywgY29tcG9uZW50OiBVc2VyQ21wLCBhczogJ1VzZXJDbXAnLCBkYXRhOiB7aXNBZG1pbjogdHJ1ZX19LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7fVxuICpcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBAVmlldyh7IHRlbXBsYXRlOiAndXNlcjoge3tpc0FkbWlufX0nIH0pXG4gKiBjbGFzcyBVc2VyQ21wIHtcbiAqICAgc3RyaW5nOiBpc0FkbWluO1xuICogICBjb25zdHJ1Y3RvcihkYXRhOiBSb3V0ZURhdGEpIHtcbiAqICAgICB0aGlzLmlzQWRtaW4gPSBkYXRhLmdldCgnaXNBZG1pbicpO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgcm91dGVyQmluZGluZ3MoQXBwQ21wKSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlRGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSA9IENPTlNUX0VYUFIoe30pKSB7fVxuXG4gIGdldChrZXk6IHN0cmluZyk6IGFueSB7IHJldHVybiBub3JtYWxpemVCbGFuayhTdHJpbmdNYXBXcmFwcGVyLmdldCh0aGlzLmRhdGEsIGtleSkpOyB9XG59XG5cbmV4cG9ydCB2YXIgQkxBTktfUk9VVEVfREFUQSA9IG5ldyBSb3V0ZURhdGEoKTtcblxuLyoqXG4gKiBgSW5zdHJ1Y3Rpb25gIGlzIGEgdHJlZSBvZiB7QGxpbmsgQ29tcG9uZW50SW5zdHJ1Y3Rpb259cyB3aXRoIGFsbCB0aGUgaW5mb3JtYXRpb24gbmVlZGVkXG4gKiB0byB0cmFuc2l0aW9uIGVhY2ggY29tcG9uZW50IGluIHRoZSBhcHAgdG8gYSBnaXZlbiByb3V0ZSwgaW5jbHVkaW5nIGFsbCBhdXhpbGlhcnkgcm91dGVzLlxuICpcbiAqIGBJbnN0cnVjdGlvbmBzIGNhbiBiZSBjcmVhdGVkIHVzaW5nIHtAbGluayBSb3V0ZXIjZ2VuZXJhdGV9LCBhbmQgY2FuIGJlIHVzZWQgdG9cbiAqIHBlcmZvcm0gcm91dGUgY2hhbmdlcyB3aXRoIHtAbGluayBSb3V0ZXIjbmF2aWdhdGVCeUluc3RydWN0aW9ufS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtSb3V0ZXIsIFJPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgY29uc3RydWN0b3Iocm91dGVyOiBSb3V0ZXIpIHtcbiAqICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSByb3V0ZXIuZ2VuZXJhdGUoWycvTXlSb3V0ZSddKTtcbiAqICAgICByb3V0ZXIubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFJPVVRFUl9QUk9WSURFUlMpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwdWJsaWMgY2hpbGQ6IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICBwdWJsaWMgYXV4SW5zdHJ1Y3Rpb246IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0pIHt9XG5cbiAgZ2V0IHVybFBhdGgoKTogc3RyaW5nIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkgPyB0aGlzLmNvbXBvbmVudC51cmxQYXRoIDogJyc7IH1cblxuICBnZXQgdXJsUGFyYW1zKCk6IHN0cmluZ1tdIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkgPyB0aGlzLmNvbXBvbmVudC51cmxQYXJhbXMgOiBbXTsgfVxuXG4gIGdldCBzcGVjaWZpY2l0eSgpOiBzdHJpbmcge1xuICAgIHZhciB0b3RhbCA9ICcnO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLmNvbXBvbmVudC5zcGVjaWZpY2l0eTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSkge1xuICAgICAgdG90YWwgKz0gdGhpcy5jaGlsZC5zcGVjaWZpY2l0eTtcbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsO1xuICB9XG5cbiAgYWJzdHJhY3QgcmVzb2x2ZUNvbXBvbmVudCgpOiBQcm9taXNlPENvbXBvbmVudEluc3RydWN0aW9uPjtcblxuICAvKipcbiAgICogY29udmVydHMgdGhlIGluc3RydWN0aW9uIGludG8gYSBVUkwgc3RyaW5nXG4gICAqL1xuICB0b1Jvb3RVcmwoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudG9VcmxQYXRoKCkgKyB0aGlzLnRvVXJsUXVlcnkoKTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RvTm9uUm9vdFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQoKSArXG4gICAgICAgICAgIChpc1ByZXNlbnQodGhpcy5jaGlsZCkgPyB0aGlzLmNoaWxkLl90b05vblJvb3RVcmwoKSA6ICcnKTtcbiAgfVxuXG4gIHRvVXJsUXVlcnkoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudXJsUGFyYW1zLmxlbmd0aCA+IDAgPyAoJz8nICsgdGhpcy51cmxQYXJhbXMuam9pbignJicpKSA6ICcnOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgaW5zdHJ1Y3Rpb24gdGhhdCBzaGFyZXMgdGhlIHN0YXRlIG9mIHRoZSBleGlzdGluZyBpbnN0cnVjdGlvbiwgYnV0IHdpdGhcbiAgICogdGhlIGdpdmVuIGNoaWxkIHtAbGluayBJbnN0cnVjdGlvbn0gcmVwbGFjaW5nIHRoZSBleGlzdGluZyBjaGlsZC5cbiAgICovXG4gIHJlcGxhY2VDaGlsZChjaGlsZDogSW5zdHJ1Y3Rpb24pOiBJbnN0cnVjdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBSZXNvbHZlZEluc3RydWN0aW9uKHRoaXMuY29tcG9uZW50LCBjaGlsZCwgdGhpcy5hdXhJbnN0cnVjdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIGZpbmFsIFVSTCBmb3IgdGhlIGluc3RydWN0aW9uIGlzIGBgXG4gICAqL1xuICB0b1VybFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmxQYXRoICsgdGhpcy5fc3RyaW5naWZ5QXV4KCkgK1xuICAgICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9Ob25Sb290VXJsKCkgOiAnJyk7XG4gIH1cblxuICAvLyBkZWZhdWx0IGluc3RydWN0aW9ucyBvdmVycmlkZSB0aGVzZVxuICB0b0xpbmtVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmxQYXRoICsgdGhpcy5fc3RyaW5naWZ5QXV4KCkgK1xuICAgICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9MaW5rVXJsKCkgOiAnJyk7XG4gIH1cblxuICAvLyB0aGlzIGlzIHRoZSBub24tcm9vdCB2ZXJzaW9uIChjYWxsZWQgcmVjdXJzaXZlbHkpXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RvTGlua1VybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQoKSArXG4gICAgICAgICAgIChpc1ByZXNlbnQodGhpcy5jaGlsZCkgPyB0aGlzLmNoaWxkLl90b0xpbmtVcmwoKSA6ICcnKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXhQcmVmaXhlZCgpOiBzdHJpbmcge1xuICAgIHZhciBwcmltYXJ5ID0gdGhpcy5fc3RyaW5naWZ5UGF0aE1hdHJpeEF1eCgpO1xuICAgIGlmIChwcmltYXJ5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHByaW1hcnkgPSAnLycgKyBwcmltYXJ5O1xuICAgIH1cbiAgICByZXR1cm4gcHJpbWFyeTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeU1hdHJpeFBhcmFtcygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVybFBhcmFtcy5sZW5ndGggPiAwID8gKCc7JyArIHRoaXMudXJsUGFyYW1zLmpvaW4oJzsnKSkgOiAnJztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgoKTogc3RyaW5nIHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudXJsUGF0aCArIHRoaXMuX3N0cmluZ2lmeU1hdHJpeFBhcmFtcygpICsgdGhpcy5fc3RyaW5naWZ5QXV4KCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdHJpbmdpZnlBdXgoKTogc3RyaW5nIHtcbiAgICB2YXIgcm91dGVzID0gW107XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMuYXV4SW5zdHJ1Y3Rpb24sIChhdXhJbnN0cnVjdGlvbiwgXykgPT4ge1xuICAgICAgcm91dGVzLnB1c2goYXV4SW5zdHJ1Y3Rpb24uX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgoKSk7XG4gICAgfSk7XG4gICAgaWYgKHJvdXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gJygnICsgcm91dGVzLmpvaW4oJy8vJykgKyAnKSc7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5cbi8qKlxuICogYSByZXNvbHZlZCBpbnN0cnVjdGlvbiBoYXMgYW4gb3V0bGV0IGluc3RydWN0aW9uIGZvciBpdHNlbGYsIGJ1dCBtYXliZSBub3QgZm9yLi4uXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZEluc3RydWN0aW9uIGV4dGVuZHMgSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBjaGlsZDogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgIGF1eEluc3RydWN0aW9uOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259KSB7XG4gICAgc3VwZXIoY29tcG9uZW50LCBjaGlsZCwgYXV4SW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgcmVzb2x2ZUNvbXBvbmVudCgpOiBQcm9taXNlPENvbXBvbmVudEluc3RydWN0aW9uPiB7XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUodGhpcy5jb21wb25lbnQpO1xuICB9XG59XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgcmVzb2x2ZWQgZGVmYXVsdCByb3V0ZVxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdEluc3RydWN0aW9uIGV4dGVuZHMgSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBjaGlsZDogRGVmYXVsdEluc3RydWN0aW9uKSB7XG4gICAgc3VwZXIoY29tcG9uZW50LCBjaGlsZCwge30pO1xuICB9XG5cbiAgcmVzb2x2ZUNvbXBvbmVudCgpOiBQcm9taXNlPENvbXBvbmVudEluc3RydWN0aW9uPiB7XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUodGhpcy5jb21wb25lbnQpO1xuICB9XG5cbiAgdG9MaW5rVXJsKCk6IHN0cmluZyB7IHJldHVybiAnJzsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RvTGlua1VybCgpOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cbn1cblxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBjb21wb25lbnQgdGhhdCBtYXkgbmVlZCB0byBkbyBzb21lIHJlZGlyZWN0aW9uIG9yIGxhenkgbG9hZGluZyBhdCBhIGxhdGVyIHRpbWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24gZXh0ZW5kcyBJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Jlc29sdmVyOiAoKSA9PiBQcm9taXNlPEluc3RydWN0aW9uPiwgcHJpdmF0ZSBfdXJsUGF0aDogc3RyaW5nID0gJycsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3VybFBhcmFtczogc3RyaW5nW10gPSBDT05TVF9FWFBSKFtdKSkge1xuICAgIHN1cGVyKG51bGwsIG51bGwsIHt9KTtcbiAgfVxuXG4gIGdldCB1cmxQYXRoKCk6IHN0cmluZyB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudC51cmxQYXRoO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3VybFBhdGgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdXJsUGF0aDtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgZ2V0IHVybFBhcmFtcygpOiBzdHJpbmdbXSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudC51cmxQYXJhbXM7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fdXJsUGFyYW1zKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3VybFBhcmFtcztcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmVzb2x2ZUNvbXBvbmVudCgpOiBQcm9taXNlPENvbXBvbmVudEluc3RydWN0aW9uPiB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuY29tcG9uZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVyKCkudGhlbigocmVzb2x1dGlvbjogSW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgIHRoaXMuY2hpbGQgPSByZXNvbHV0aW9uLmNoaWxkO1xuICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50ID0gcmVzb2x1dGlvbi5jb21wb25lbnQ7XG4gICAgfSk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgUmVkaXJlY3RJbnN0cnVjdGlvbiBleHRlbmRzIFJlc29sdmVkSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBjaGlsZDogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgIGF1eEluc3RydWN0aW9uOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259LCBwcml2YXRlIF9zcGVjaWZpY2l0eTogc3RyaW5nKSB7XG4gICAgc3VwZXIoY29tcG9uZW50LCBjaGlsZCwgYXV4SW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgZ2V0IHNwZWNpZmljaXR5KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9zcGVjaWZpY2l0eTsgfVxufVxuXG5cbi8qKlxuICogQSBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25gIHJlcHJlc2VudHMgdGhlIHJvdXRlIHN0YXRlIGZvciBhIHNpbmdsZSBjb21wb25lbnQuIEFuIGBJbnN0cnVjdGlvbmAgaXNcbiAqIGNvbXBvc2VkIG9mIGEgdHJlZSBvZiB0aGVzZSBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25gcy5cbiAqXG4gKiBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25zYCBpcyBhIHB1YmxpYyBBUEkuIEluc3RhbmNlcyBvZiBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25gIGFyZSBwYXNzZWRcbiAqIHRvIHJvdXRlIGxpZmVjeWNsZSBob29rcywgbGlrZSB7QGxpbmsgQ2FuQWN0aXZhdGV9LlxuICpcbiAqIGBDb21wb25lbnRJbnN0cnVjdGlvbmBzIGFyZSBbaGFzaCBjb25zZWRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hhc2hfY29uc2luZykuIFlvdSBzaG91bGRcbiAqIG5ldmVyIGNvbnN0cnVjdCBvbmUgeW91cnNlbGYgd2l0aCBcIm5ldy5cIiBJbnN0ZWFkLCByZWx5IG9uIHtAbGluayBSb3V0ZXIvUm91dGVSZWNvZ25pemVyfSB0b1xuICogY29uc3RydWN0IGBDb21wb25lbnRJbnN0cnVjdGlvbmBzLlxuICpcbiAqIFlvdSBzaG91bGQgbm90IG1vZGlmeSB0aGlzIG9iamVjdC4gSXQgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgaW1tdXRhYmxlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50SW5zdHJ1Y3Rpb24ge1xuICByZXVzZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwdWJsaWMgcm91dGVEYXRhOiBSb3V0ZURhdGE7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHVybFBhdGg6IHN0cmluZywgcHVibGljIHVybFBhcmFtczogc3RyaW5nW10sIGRhdGE6IFJvdXRlRGF0YSxcbiAgICAgICAgICAgICAgcHVibGljIGNvbXBvbmVudFR5cGUsIHB1YmxpYyB0ZXJtaW5hbDogYm9vbGVhbiwgcHVibGljIHNwZWNpZmljaXR5OiBzdHJpbmcsXG4gICAgICAgICAgICAgIHB1YmxpYyBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gbnVsbCkge1xuICAgIHRoaXMucm91dGVEYXRhID0gaXNQcmVzZW50KGRhdGEpID8gZGF0YSA6IEJMQU5LX1JPVVRFX0RBVEE7XG4gIH1cbn1cbiJdfQ==