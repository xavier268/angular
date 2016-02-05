'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
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
var RouteParams = (function () {
    function RouteParams(params) {
        this.params = params;
    }
    RouteParams.prototype.get = function (param) { return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.params, param)); };
    RouteParams = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [Object])
    ], RouteParams);
    return RouteParams;
})();
exports.RouteParams = RouteParams;
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
var RouteData = (function () {
    function RouteData(data) {
        if (data === void 0) { data = lang_1.CONST_EXPR({}); }
        this.data = data;
    }
    RouteData.prototype.get = function (key) { return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.data, key)); };
    return RouteData;
})();
exports.RouteData = RouteData;
exports.BLANK_ROUTE_DATA = new RouteData();
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
var Instruction = (function () {
    function Instruction(component, child, auxInstruction) {
        this.component = component;
        this.child = child;
        this.auxInstruction = auxInstruction;
    }
    Object.defineProperty(Instruction.prototype, "urlPath", {
        get: function () { return lang_1.isPresent(this.component) ? this.component.urlPath : ''; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Instruction.prototype, "urlParams", {
        get: function () { return lang_1.isPresent(this.component) ? this.component.urlParams : []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Instruction.prototype, "specificity", {
        get: function () {
            var total = '';
            if (lang_1.isPresent(this.component)) {
                total += this.component.specificity;
            }
            if (lang_1.isPresent(this.child)) {
                total += this.child.specificity;
            }
            return total;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * converts the instruction into a URL string
     */
    Instruction.prototype.toRootUrl = function () { return this.toUrlPath() + this.toUrlQuery(); };
    /** @internal */
    Instruction.prototype._toNonRootUrl = function () {
        return this._stringifyPathMatrixAuxPrefixed() +
            (lang_1.isPresent(this.child) ? this.child._toNonRootUrl() : '');
    };
    Instruction.prototype.toUrlQuery = function () { return this.urlParams.length > 0 ? ('?' + this.urlParams.join('&')) : ''; };
    /**
     * Returns a new instruction that shares the state of the existing instruction, but with
     * the given child {@link Instruction} replacing the existing child.
     */
    Instruction.prototype.replaceChild = function (child) {
        return new ResolvedInstruction(this.component, child, this.auxInstruction);
    };
    /**
     * If the final URL for the instruction is ``
     */
    Instruction.prototype.toUrlPath = function () {
        return this.urlPath + this._stringifyAux() +
            (lang_1.isPresent(this.child) ? this.child._toNonRootUrl() : '');
    };
    // default instructions override these
    Instruction.prototype.toLinkUrl = function () {
        return this.urlPath + this._stringifyAux() +
            (lang_1.isPresent(this.child) ? this.child._toLinkUrl() : '');
    };
    // this is the non-root version (called recursively)
    /** @internal */
    Instruction.prototype._toLinkUrl = function () {
        return this._stringifyPathMatrixAuxPrefixed() +
            (lang_1.isPresent(this.child) ? this.child._toLinkUrl() : '');
    };
    /** @internal */
    Instruction.prototype._stringifyPathMatrixAuxPrefixed = function () {
        var primary = this._stringifyPathMatrixAux();
        if (primary.length > 0) {
            primary = '/' + primary;
        }
        return primary;
    };
    /** @internal */
    Instruction.prototype._stringifyMatrixParams = function () {
        return this.urlParams.length > 0 ? (';' + this.urlParams.join(';')) : '';
    };
    /** @internal */
    Instruction.prototype._stringifyPathMatrixAux = function () {
        if (lang_1.isBlank(this.component)) {
            return '';
        }
        return this.urlPath + this._stringifyMatrixParams() + this._stringifyAux();
    };
    /** @internal */
    Instruction.prototype._stringifyAux = function () {
        var routes = [];
        collection_1.StringMapWrapper.forEach(this.auxInstruction, function (auxInstruction, _) {
            routes.push(auxInstruction._stringifyPathMatrixAux());
        });
        if (routes.length > 0) {
            return '(' + routes.join('//') + ')';
        }
        return '';
    };
    return Instruction;
})();
exports.Instruction = Instruction;
/**
 * a resolved instruction has an outlet instruction for itself, but maybe not for...
 */
var ResolvedInstruction = (function (_super) {
    __extends(ResolvedInstruction, _super);
    function ResolvedInstruction(component, child, auxInstruction) {
        _super.call(this, component, child, auxInstruction);
    }
    ResolvedInstruction.prototype.resolveComponent = function () {
        return async_1.PromiseWrapper.resolve(this.component);
    };
    return ResolvedInstruction;
})(Instruction);
exports.ResolvedInstruction = ResolvedInstruction;
/**
 * Represents a resolved default route
 */
var DefaultInstruction = (function (_super) {
    __extends(DefaultInstruction, _super);
    function DefaultInstruction(component, child) {
        _super.call(this, component, child, {});
    }
    DefaultInstruction.prototype.resolveComponent = function () {
        return async_1.PromiseWrapper.resolve(this.component);
    };
    DefaultInstruction.prototype.toLinkUrl = function () { return ''; };
    /** @internal */
    DefaultInstruction.prototype._toLinkUrl = function () { return ''; };
    return DefaultInstruction;
})(Instruction);
exports.DefaultInstruction = DefaultInstruction;
/**
 * Represents a component that may need to do some redirection or lazy loading at a later time.
 */
var UnresolvedInstruction = (function (_super) {
    __extends(UnresolvedInstruction, _super);
    function UnresolvedInstruction(_resolver, _urlPath, _urlParams) {
        if (_urlPath === void 0) { _urlPath = ''; }
        if (_urlParams === void 0) { _urlParams = lang_1.CONST_EXPR([]); }
        _super.call(this, null, null, {});
        this._resolver = _resolver;
        this._urlPath = _urlPath;
        this._urlParams = _urlParams;
    }
    Object.defineProperty(UnresolvedInstruction.prototype, "urlPath", {
        get: function () {
            if (lang_1.isPresent(this.component)) {
                return this.component.urlPath;
            }
            if (lang_1.isPresent(this._urlPath)) {
                return this._urlPath;
            }
            return '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UnresolvedInstruction.prototype, "urlParams", {
        get: function () {
            if (lang_1.isPresent(this.component)) {
                return this.component.urlParams;
            }
            if (lang_1.isPresent(this._urlParams)) {
                return this._urlParams;
            }
            return [];
        },
        enumerable: true,
        configurable: true
    });
    UnresolvedInstruction.prototype.resolveComponent = function () {
        var _this = this;
        if (lang_1.isPresent(this.component)) {
            return async_1.PromiseWrapper.resolve(this.component);
        }
        return this._resolver().then(function (resolution) {
            _this.child = resolution.child;
            return _this.component = resolution.component;
        });
    };
    return UnresolvedInstruction;
})(Instruction);
exports.UnresolvedInstruction = UnresolvedInstruction;
var RedirectInstruction = (function (_super) {
    __extends(RedirectInstruction, _super);
    function RedirectInstruction(component, child, auxInstruction, _specificity) {
        _super.call(this, component, child, auxInstruction);
        this._specificity = _specificity;
    }
    Object.defineProperty(RedirectInstruction.prototype, "specificity", {
        get: function () { return this._specificity; },
        enumerable: true,
        configurable: true
    });
    return RedirectInstruction;
})(ResolvedInstruction);
exports.RedirectInstruction = RedirectInstruction;
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
var ComponentInstruction = (function () {
    function ComponentInstruction(urlPath, urlParams, data, componentType, terminal, specificity, params) {
        if (params === void 0) { params = null; }
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this.componentType = componentType;
        this.terminal = terminal;
        this.specificity = specificity;
        this.params = params;
        this.reuse = false;
        this.routeData = lang_1.isPresent(data) ? data : exports.BLANK_ROUTE_DATA;
    }
    return ComponentInstruction;
})();
exports.ComponentInstruction = ComponentInstruction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2luc3RydWN0aW9uLnRzIl0sIm5hbWVzIjpbIlJvdXRlUGFyYW1zIiwiUm91dGVQYXJhbXMuY29uc3RydWN0b3IiLCJSb3V0ZVBhcmFtcy5nZXQiLCJSb3V0ZURhdGEiLCJSb3V0ZURhdGEuY29uc3RydWN0b3IiLCJSb3V0ZURhdGEuZ2V0IiwiSW5zdHJ1Y3Rpb24iLCJJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIkluc3RydWN0aW9uLnVybFBhdGgiLCJJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkluc3RydWN0aW9uLnRvUm9vdFVybCIsIkluc3RydWN0aW9uLl90b05vblJvb3RVcmwiLCJJbnN0cnVjdGlvbi50b1VybFF1ZXJ5IiwiSW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkIiwiSW5zdHJ1Y3Rpb24udG9VcmxQYXRoIiwiSW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiSW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIkluc3RydWN0aW9uLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5TWF0cml4UGFyYW1zIiwiSW5zdHJ1Y3Rpb24uX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5QXV4IiwiUmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJSZXNvbHZlZEluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24iLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24ucmVzb2x2ZUNvbXBvbmVudCIsIkRlZmF1bHRJbnN0cnVjdGlvbi50b0xpbmtVcmwiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi51cmxQYXRoIiwiVW5yZXNvbHZlZEluc3RydWN0aW9uLnVybFBhcmFtcyIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi5yZXNvbHZlQ29tcG9uZW50IiwiUmVkaXJlY3RJbnN0cnVjdGlvbiIsIlJlZGlyZWN0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJSZWRpcmVjdEluc3RydWN0aW9uLnNwZWNpZmljaXR5IiwiQ29tcG9uZW50SW5zdHJ1Y3Rpb24iLCJDb21wb25lbnRJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQkFBNkQsZ0NBQWdDLENBQUMsQ0FBQTtBQUM5RixxQkFBbUUsMEJBQTBCLENBQUMsQ0FBQTtBQUM5RixzQkFBc0MsMkJBQTJCLENBQUMsQ0FBQTtBQUNsRSxxQkFBeUIsZUFBZSxDQUFDLENBQUE7QUFHekM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNkJHO0FBQ0g7SUFFRUEscUJBQW1CQSxNQUErQkE7UUFBL0JDLFdBQU1BLEdBQU5BLE1BQU1BLENBQXlCQTtJQUFHQSxDQUFDQTtJQUV0REQseUJBQUdBLEdBQUhBLFVBQUlBLEtBQWFBLElBQVlFLE1BQU1BLENBQUNBLHFCQUFjQSxDQUFDQSw2QkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBSmpHRjtRQUFDQSxpQkFBVUEsRUFBRUE7O29CQUtaQTtJQUFEQSxrQkFBQ0E7QUFBREEsQ0FBQ0EsQUFMRCxJQUtDO0FBSlksbUJBQVcsY0FJdkIsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSDtJQUNFRyxtQkFBbUJBLElBQTJDQTtRQUFsREMsb0JBQWtEQSxH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RUFBRUEsS0FBS0EsRUFBRUEsY0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFEd0JBLGlCQUFZQSxHQUFaQSxZQUFZQSxDQUFRQTtJQUV0RkEsQ0FBQ0E7SUFFREQsc0JBQUlBLDRDQUFXQTthQUFmQSxjQUE0QkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBRjtJQUN6REEsMEJBQUNBO0FBQURBLENBQUNBLEFBUEQsRUFBeUMsbUJBQW1CLEVBTzNEO0FBUFksMkJBQW1CLHNCQU8vQixDQUFBO0FBR0Q7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0g7SUFJRUcsOEJBQW1CQSxPQUFlQSxFQUFTQSxTQUFtQkEsRUFBRUEsSUFBZUEsRUFDNURBLGFBQWFBLEVBQVNBLFFBQWlCQSxFQUFTQSxXQUFtQkEsRUFDbkVBLE1BQW1DQTtRQUExQ0Msc0JBQTBDQSxHQUExQ0EsYUFBMENBO1FBRm5DQSxZQUFPQSxHQUFQQSxPQUFPQSxDQUFRQTtRQUFTQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtRQUMzQ0Esa0JBQWFBLEdBQWJBLGFBQWFBLENBQUFBO1FBQVNBLGFBQVFBLEdBQVJBLFFBQVFBLENBQVNBO1FBQVNBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFRQTtRQUNuRUEsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBNkJBO1FBTHREQSxVQUFLQSxHQUFZQSxLQUFLQSxDQUFDQTtRQU1yQkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLEdBQUdBLHdCQUFnQkEsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBQ0hELDJCQUFDQTtBQUFEQSxDQUFDQSxBQVRELElBU0M7QUFUWSw0QkFBb0IsdUJBU2hDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01hcCwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgbm9ybWFsaXplQmxhbmssIFR5cGUsIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2UsIFByb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cblxuLyoqXG4gKiBgUm91dGVQYXJhbXNgIGlzIGFuIGltbXV0YWJsZSBtYXAgb2YgcGFyYW1ldGVycyBmb3IgdGhlIGdpdmVuIHJvdXRlXG4gKiBiYXNlZCBvbiB0aGUgdXJsIG1hdGNoZXIgYW5kIG9wdGlvbmFsIHBhcmFtZXRlcnMgZm9yIHRoYXQgcm91dGUuXG4gKlxuICogWW91IGNhbiBpbmplY3QgYFJvdXRlUGFyYW1zYCBpbnRvIHRoZSBjb25zdHJ1Y3RvciBvZiBhIGNvbXBvbmVudCB0byB1c2UgaXQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7Um91dGVyLCBST1VURVJfRElSRUNUSVZFUywgUk9VVEVSX1BST1ZJREVSUywgUm91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHtwYXRoOiAnL3VzZXIvOmlkJywgY29tcG9uZW50OiBVc2VyQ21wLCBhczogJ1VzZXJDbXAnfSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge31cbiAqXG4gKiBAQ29tcG9uZW50KHsgdGVtcGxhdGU6ICd1c2VyOiB7e2lkfX0nIH0pXG4gKiBjbGFzcyBVc2VyQ21wIHtcbiAqICAgaWQ6IHN0cmluZztcbiAqICAgY29uc3RydWN0b3IocGFyYW1zOiBSb3V0ZVBhcmFtcykge1xuICogICAgIHRoaXMuaWQgPSBwYXJhbXMuZ2V0KCdpZCcpO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgUk9VVEVSX1BST1ZJREVSUyk7XG4gKiBgYGBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvdXRlUGFyYW1zIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHt9XG5cbiAgZ2V0KHBhcmFtOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gbm9ybWFsaXplQmxhbmsoU3RyaW5nTWFwV3JhcHBlci5nZXQodGhpcy5wYXJhbXMsIHBhcmFtKSk7IH1cbn1cblxuLyoqXG4gKiBgUm91dGVEYXRhYCBpcyBhbiBpbW11dGFibGUgbWFwIG9mIGFkZGl0aW9uYWwgZGF0YSB5b3UgY2FuIGNvbmZpZ3VyZSBpbiB5b3VyIHtAbGluayBSb3V0ZX0uXG4gKlxuICogWW91IGNhbiBpbmplY3QgYFJvdXRlRGF0YWAgaW50byB0aGUgY29uc3RydWN0b3Igb2YgYSBjb21wb25lbnQgdG8gdXNlIGl0LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgVmlld30gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge1JvdXRlciwgUk9VVEVSX0RJUkVDVElWRVMsIHJvdXRlckJpbmRpbmdzLCBSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogQFZpZXcoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7cGF0aDogJy91c2VyLzppZCcsIGNvbXBvbmVudDogVXNlckNtcCwgYXM6ICdVc2VyQ21wJywgZGF0YToge2lzQWRtaW46IHRydWV9fSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge31cbiAqXG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogQFZpZXcoeyB0ZW1wbGF0ZTogJ3VzZXI6IHt7aXNBZG1pbn19JyB9KVxuICogY2xhc3MgVXNlckNtcCB7XG4gKiAgIHN0cmluZzogaXNBZG1pbjtcbiAqICAgY29uc3RydWN0b3IoZGF0YTogUm91dGVEYXRhKSB7XG4gKiAgICAgdGhpcy5pc0FkbWluID0gZGF0YS5nZXQoJ2lzQWRtaW4nKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIHJvdXRlckJpbmRpbmdzKEFwcENtcCkpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZURhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGF0YToge1trZXk6IHN0cmluZ106IGFueX0gPSBDT05TVF9FWFBSKHt9KSkge31cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gbm9ybWFsaXplQmxhbmsoU3RyaW5nTWFwV3JhcHBlci5nZXQodGhpcy5kYXRhLCBrZXkpKTsgfVxufVxuXG5leHBvcnQgdmFyIEJMQU5LX1JPVVRFX0RBVEEgPSBuZXcgUm91dGVEYXRhKCk7XG5cbi8qKlxuICogYEluc3RydWN0aW9uYCBpcyBhIHRyZWUgb2Yge0BsaW5rIENvbXBvbmVudEluc3RydWN0aW9ufXMgd2l0aCBhbGwgdGhlIGluZm9ybWF0aW9uIG5lZWRlZFxuICogdG8gdHJhbnNpdGlvbiBlYWNoIGNvbXBvbmVudCBpbiB0aGUgYXBwIHRvIGEgZ2l2ZW4gcm91dGUsIGluY2x1ZGluZyBhbGwgYXV4aWxpYXJ5IHJvdXRlcy5cbiAqXG4gKiBgSW5zdHJ1Y3Rpb25gcyBjYW4gYmUgY3JlYXRlZCB1c2luZyB7QGxpbmsgUm91dGVyI2dlbmVyYXRlfSwgYW5kIGNhbiBiZSB1c2VkIHRvXG4gKiBwZXJmb3JtIHJvdXRlIGNoYW5nZXMgd2l0aCB7QGxpbmsgUm91dGVyI25hdmlnYXRlQnlJbnN0cnVjdGlvbn0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7Um91dGVyLCBST1VURVJfRElSRUNUSVZFUywgUk9VVEVSX1BST1ZJREVSUywgUm91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIGNvbnN0cnVjdG9yKHJvdXRlcjogUm91dGVyKSB7XG4gKiAgICAgdmFyIGluc3RydWN0aW9uID0gcm91dGVyLmdlbmVyYXRlKFsnL015Um91dGUnXSk7XG4gKiAgICAgcm91dGVyLm5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbik7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBST1VURVJfUFJPVklERVJTKTtcbiAqIGBgYFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgcHVibGljIGNoaWxkOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgcHVibGljIGF1eEluc3RydWN0aW9uOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259KSB7fVxuXG4gIGdldCB1cmxQYXRoKCk6IHN0cmluZyB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gdGhpcy5jb21wb25lbnQudXJsUGF0aCA6ICcnOyB9XG5cbiAgZ2V0IHVybFBhcmFtcygpOiBzdHJpbmdbXSB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gdGhpcy5jb21wb25lbnQudXJsUGFyYW1zIDogW107IH1cblxuICBnZXQgc3BlY2lmaWNpdHkoKTogc3RyaW5nIHtcbiAgICB2YXIgdG90YWwgPSAnJztcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgdG90YWwgKz0gdGhpcy5jb21wb25lbnQuc3BlY2lmaWNpdHk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jaGlsZCkpIHtcbiAgICAgIHRvdGFsICs9IHRoaXMuY2hpbGQuc3BlY2lmaWNpdHk7XG4gICAgfVxuICAgIHJldHVybiB0b3RhbDtcbiAgfVxuXG4gIGFic3RyYWN0IHJlc29sdmVDb21wb25lbnQoKTogUHJvbWlzZTxDb21wb25lbnRJbnN0cnVjdGlvbj47XG5cbiAgLyoqXG4gICAqIGNvbnZlcnRzIHRoZSBpbnN0cnVjdGlvbiBpbnRvIGEgVVJMIHN0cmluZ1xuICAgKi9cbiAgdG9Sb290VXJsKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnRvVXJsUGF0aCgpICsgdGhpcy50b1VybFF1ZXJ5KCk7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF90b05vblJvb3RVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyaW5naWZ5UGF0aE1hdHJpeEF1eFByZWZpeGVkKCkgK1xuICAgICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9Ob25Sb290VXJsKCkgOiAnJyk7XG4gIH1cblxuICB0b1VybFF1ZXJ5KCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnVybFBhcmFtcy5sZW5ndGggPiAwID8gKCc/JyArIHRoaXMudXJsUGFyYW1zLmpvaW4oJyYnKSkgOiAnJzsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IGluc3RydWN0aW9uIHRoYXQgc2hhcmVzIHRoZSBzdGF0ZSBvZiB0aGUgZXhpc3RpbmcgaW5zdHJ1Y3Rpb24sIGJ1dCB3aXRoXG4gICAqIHRoZSBnaXZlbiBjaGlsZCB7QGxpbmsgSW5zdHJ1Y3Rpb259IHJlcGxhY2luZyB0aGUgZXhpc3RpbmcgY2hpbGQuXG4gICAqL1xuICByZXBsYWNlQ2hpbGQoY2hpbGQ6IEluc3RydWN0aW9uKTogSW5zdHJ1Y3Rpb24ge1xuICAgIHJldHVybiBuZXcgUmVzb2x2ZWRJbnN0cnVjdGlvbih0aGlzLmNvbXBvbmVudCwgY2hpbGQsIHRoaXMuYXV4SW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSBmaW5hbCBVUkwgZm9yIHRoZSBpbnN0cnVjdGlvbiBpcyBgYFxuICAgKi9cbiAgdG9VcmxQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudXJsUGF0aCArIHRoaXMuX3N0cmluZ2lmeUF1eCgpICtcbiAgICAgICAgICAgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSA/IHRoaXMuY2hpbGQuX3RvTm9uUm9vdFVybCgpIDogJycpO1xuICB9XG5cbiAgLy8gZGVmYXVsdCBpbnN0cnVjdGlvbnMgb3ZlcnJpZGUgdGhlc2VcbiAgdG9MaW5rVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudXJsUGF0aCArIHRoaXMuX3N0cmluZ2lmeUF1eCgpICtcbiAgICAgICAgICAgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSA/IHRoaXMuY2hpbGQuX3RvTGlua1VybCgpIDogJycpO1xuICB9XG5cbiAgLy8gdGhpcyBpcyB0aGUgbm9uLXJvb3QgdmVyc2lvbiAoY2FsbGVkIHJlY3Vyc2l2ZWx5KVxuICAvKiogQGludGVybmFsICovXG4gIF90b0xpbmtVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyaW5naWZ5UGF0aE1hdHJpeEF1eFByZWZpeGVkKCkgK1xuICAgICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9MaW5rVXJsKCkgOiAnJyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQoKTogc3RyaW5nIHtcbiAgICB2YXIgcHJpbWFyeSA9IHRoaXMuX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgoKTtcbiAgICBpZiAocHJpbWFyeS5sZW5ndGggPiAwKSB7XG4gICAgICBwcmltYXJ5ID0gJy8nICsgcHJpbWFyeTtcbiAgICB9XG4gICAgcmV0dXJuIHByaW1hcnk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdHJpbmdpZnlNYXRyaXhQYXJhbXMoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmxQYXJhbXMubGVuZ3RoID4gMCA/ICgnOycgKyB0aGlzLnVybFBhcmFtcy5qb2luKCc7JykpIDogJyc7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdHJpbmdpZnlQYXRoTWF0cml4QXV4KCk6IHN0cmluZyB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnVybFBhdGggKyB0aGlzLl9zdHJpbmdpZnlNYXRyaXhQYXJhbXMoKSArIHRoaXMuX3N0cmluZ2lmeUF1eCgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaW5naWZ5QXV4KCk6IHN0cmluZyB7XG4gICAgdmFyIHJvdXRlcyA9IFtdO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh0aGlzLmF1eEluc3RydWN0aW9uLCAoYXV4SW5zdHJ1Y3Rpb24sIF8pID0+IHtcbiAgICAgIHJvdXRlcy5wdXNoKGF1eEluc3RydWN0aW9uLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4KCkpO1xuICAgIH0pO1xuICAgIGlmIChyb3V0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuICcoJyArIHJvdXRlcy5qb2luKCcvLycpICsgJyknO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuXG4vKipcbiAqIGEgcmVzb2x2ZWQgaW5zdHJ1Y3Rpb24gaGFzIGFuIG91dGxldCBpbnN0cnVjdGlvbiBmb3IgaXRzZWxmLCBidXQgbWF5YmUgbm90IGZvci4uLlxuICovXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRJbnN0cnVjdGlvbiBleHRlbmRzIEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IoY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgY2hpbGQ6IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICBhdXhJbnN0cnVjdGlvbjoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSkge1xuICAgIHN1cGVyKGNvbXBvbmVudCwgY2hpbGQsIGF1eEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIHJlc29sdmVDb21wb25lbnQoKTogUHJvbWlzZTxDb21wb25lbnRJbnN0cnVjdGlvbj4ge1xuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuY29tcG9uZW50KTtcbiAgfVxufVxuXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHJlc29sdmVkIGRlZmF1bHQgcm91dGVcbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRJbnN0cnVjdGlvbiBleHRlbmRzIEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IoY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgY2hpbGQ6IERlZmF1bHRJbnN0cnVjdGlvbikge1xuICAgIHN1cGVyKGNvbXBvbmVudCwgY2hpbGQsIHt9KTtcbiAgfVxuXG4gIHJlc29sdmVDb21wb25lbnQoKTogUHJvbWlzZTxDb21wb25lbnRJbnN0cnVjdGlvbj4ge1xuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuY29tcG9uZW50KTtcbiAgfVxuXG4gIHRvTGlua1VybCgpOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF90b0xpbmtVcmwoKTogc3RyaW5nIHsgcmV0dXJuICcnOyB9XG59XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgY29tcG9uZW50IHRoYXQgbWF5IG5lZWQgdG8gZG8gc29tZSByZWRpcmVjdGlvbiBvciBsYXp5IGxvYWRpbmcgYXQgYSBsYXRlciB0aW1lLlxuICovXG5leHBvcnQgY2xhc3MgVW5yZXNvbHZlZEluc3RydWN0aW9uIGV4dGVuZHMgSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZXNvbHZlcjogKCkgPT4gUHJvbWlzZTxJbnN0cnVjdGlvbj4sIHByaXZhdGUgX3VybFBhdGg6IHN0cmluZyA9ICcnLFxuICAgICAgICAgICAgICBwcml2YXRlIF91cmxQYXJhbXM6IHN0cmluZ1tdID0gQ09OU1RfRVhQUihbXSkpIHtcbiAgICBzdXBlcihudWxsLCBudWxsLCB7fSk7XG4gIH1cblxuICBnZXQgdXJsUGF0aCgpOiBzdHJpbmcge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wb25lbnQudXJsUGF0aDtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl91cmxQYXRoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3VybFBhdGg7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGdldCB1cmxQYXJhbXMoKTogc3RyaW5nW10ge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wb25lbnQudXJsUGFyYW1zO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3VybFBhcmFtcykpIHtcbiAgICAgIHJldHVybiB0aGlzLl91cmxQYXJhbXM7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJlc29sdmVDb21wb25lbnQoKTogUHJvbWlzZTxDb21wb25lbnRJbnN0cnVjdGlvbj4ge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLmNvbXBvbmVudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZXNvbHZlcigpLnRoZW4oKHJlc29sdXRpb246IEluc3RydWN0aW9uKSA9PiB7XG4gICAgICB0aGlzLmNoaWxkID0gcmVzb2x1dGlvbi5jaGlsZDtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudCA9IHJlc29sdXRpb24uY29tcG9uZW50O1xuICAgIH0pO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFJlZGlyZWN0SW5zdHJ1Y3Rpb24gZXh0ZW5kcyBSZXNvbHZlZEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IoY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgY2hpbGQ6IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICBhdXhJbnN0cnVjdGlvbjoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSwgcHJpdmF0ZSBfc3BlY2lmaWNpdHk6IHN0cmluZykge1xuICAgIHN1cGVyKGNvbXBvbmVudCwgY2hpbGQsIGF1eEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIGdldCBzcGVjaWZpY2l0eSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fc3BlY2lmaWNpdHk7IH1cbn1cblxuXG4vKipcbiAqIEEgYENvbXBvbmVudEluc3RydWN0aW9uYCByZXByZXNlbnRzIHRoZSByb3V0ZSBzdGF0ZSBmb3IgYSBzaW5nbGUgY29tcG9uZW50LiBBbiBgSW5zdHJ1Y3Rpb25gIGlzXG4gKiBjb21wb3NlZCBvZiBhIHRyZWUgb2YgdGhlc2UgYENvbXBvbmVudEluc3RydWN0aW9uYHMuXG4gKlxuICogYENvbXBvbmVudEluc3RydWN0aW9uc2AgaXMgYSBwdWJsaWMgQVBJLiBJbnN0YW5jZXMgb2YgYENvbXBvbmVudEluc3RydWN0aW9uYCBhcmUgcGFzc2VkXG4gKiB0byByb3V0ZSBsaWZlY3ljbGUgaG9va3MsIGxpa2Uge0BsaW5rIENhbkFjdGl2YXRlfS5cbiAqXG4gKiBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25gcyBhcmUgW2hhc2ggY29uc2VkXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IYXNoX2NvbnNpbmcpLiBZb3Ugc2hvdWxkXG4gKiBuZXZlciBjb25zdHJ1Y3Qgb25lIHlvdXJzZWxmIHdpdGggXCJuZXcuXCIgSW5zdGVhZCwgcmVseSBvbiB7QGxpbmsgUm91dGVyL1JvdXRlUmVjb2duaXplcn0gdG9cbiAqIGNvbnN0cnVjdCBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25gcy5cbiAqXG4gKiBZb3Ugc2hvdWxkIG5vdCBtb2RpZnkgdGhpcyBvYmplY3QuIEl0IHNob3VsZCBiZSB0cmVhdGVkIGFzIGltbXV0YWJsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudEluc3RydWN0aW9uIHtcbiAgcmV1c2U6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHVibGljIHJvdXRlRGF0YTogUm91dGVEYXRhO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB1cmxQYXRoOiBzdHJpbmcsIHB1YmxpYyB1cmxQYXJhbXM6IHN0cmluZ1tdLCBkYXRhOiBSb3V0ZURhdGEsXG4gICAgICAgICAgICAgIHB1YmxpYyBjb21wb25lbnRUeXBlLCBwdWJsaWMgdGVybWluYWw6IGJvb2xlYW4sIHB1YmxpYyBzcGVjaWZpY2l0eTogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSA9IG51bGwpIHtcbiAgICB0aGlzLnJvdXRlRGF0YSA9IGlzUHJlc2VudChkYXRhKSA/IGRhdGEgOiBCTEFOS19ST1VURV9EQVRBO1xuICB9XG59XG4iXX0=