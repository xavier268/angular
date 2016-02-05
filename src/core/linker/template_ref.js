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
var di_1 = require('angular2/src/core/di');
/**
 * Represents an Embedded Template that can be used to instantiate Embedded Views.
 *
 * You can access a `TemplateRef`, in two ways. Via a directive placed on a `<template>` element (or
 * directive prefixed with `*`) and have the `TemplateRef` for this Embedded View injected into the
 * constructor of the directive using the `TemplateRef` Token. Alternatively you can query for the
 * `TemplateRef` from a Component or a Directive via {@link Query}.
 *
 * To instantiate Embedded Views based on a Template, use
 * {@link ViewContainerRef#createEmbeddedView}, which will create the View and attach it to the
 * View Container.
 */
var TemplateRef = (function () {
    function TemplateRef() {
    }
    Object.defineProperty(TemplateRef.prototype, "elementRef", {
        /**
         * The location in the View where the Embedded View logically belongs to.
         *
         * The data-binding and injection contexts of Embedded Views created from this `TemplateRef`
         * inherit from the contexts of this location.
         *
         * Typically new Embedded Views are attached to the View Container of this location, but in
         * advanced use-cases, the View can be attached to a different container while keeping the
         * data-binding and injection context from the original location.
         *
         */
        // TODO(i): rename to anchor or location
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    TemplateRef = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], TemplateRef);
    return TemplateRef;
})();
exports.TemplateRef = TemplateRef;
var TemplateRef_ = (function (_super) {
    __extends(TemplateRef_, _super);
    function TemplateRef_(_elementRef) {
        _super.call(this);
        this._elementRef = _elementRef;
    }
    Object.defineProperty(TemplateRef_.prototype, "elementRef", {
        get: function () { return this._elementRef; },
        enumerable: true,
        configurable: true
    });
    return TemplateRef_;
})(TemplateRef);
exports.TemplateRef_ = TemplateRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3RlbXBsYXRlX3JlZi50cyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVJlZiIsIlRlbXBsYXRlUmVmLmNvbnN0cnVjdG9yIiwiVGVtcGxhdGVSZWYuZWxlbWVudFJlZiIsIlRlbXBsYXRlUmVmXyIsIlRlbXBsYXRlUmVmXy5jb25zdHJ1Y3RvciIsIlRlbXBsYXRlUmVmXy5lbGVtZW50UmVmIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBRWhEOzs7Ozs7Ozs7OztHQVdHO0FBQ0g7SUFBQUE7SUFlQUMsQ0FBQ0E7SUFEQ0Qsc0JBQUlBLG1DQUFVQTtRQVpkQTs7Ozs7Ozs7OztXQVVHQTtRQUNIQSx3Q0FBd0NBO2FBQ3hDQSxjQUErQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBRjtJQWQvQ0E7UUFBQ0EsZUFBVUEsRUFBRUE7O29CQWVaQTtJQUFEQSxrQkFBQ0E7QUFBREEsQ0FBQ0EsQUFmRCxJQWVDO0FBZHFCLG1CQUFXLGNBY2hDLENBQUE7QUFFRDtJQUFrQ0csZ0NBQVdBO0lBQzNDQSxzQkFBb0JBLFdBQXdCQTtRQUFJQyxpQkFBT0EsQ0FBQ0E7UUFBcENBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFhQTtJQUFhQSxDQUFDQTtJQUUxREQsc0JBQUlBLG9DQUFVQTthQUFkQSxjQUFnQ0UsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBRjtJQUM1REEsbUJBQUNBO0FBQURBLENBQUNBLEFBSkQsRUFBa0MsV0FBVyxFQUk1QztBQUpZLG9CQUFZLGVBSXhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0VsZW1lbnRSZWYsIEVsZW1lbnRSZWZffSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gRW1iZWRkZWQgVGVtcGxhdGUgdGhhdCBjYW4gYmUgdXNlZCB0byBpbnN0YW50aWF0ZSBFbWJlZGRlZCBWaWV3cy5cbiAqXG4gKiBZb3UgY2FuIGFjY2VzcyBhIGBUZW1wbGF0ZVJlZmAsIGluIHR3byB3YXlzLiBWaWEgYSBkaXJlY3RpdmUgcGxhY2VkIG9uIGEgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQgKG9yXG4gKiBkaXJlY3RpdmUgcHJlZml4ZWQgd2l0aCBgKmApIGFuZCBoYXZlIHRoZSBgVGVtcGxhdGVSZWZgIGZvciB0aGlzIEVtYmVkZGVkIFZpZXcgaW5qZWN0ZWQgaW50byB0aGVcbiAqIGNvbnN0cnVjdG9yIG9mIHRoZSBkaXJlY3RpdmUgdXNpbmcgdGhlIGBUZW1wbGF0ZVJlZmAgVG9rZW4uIEFsdGVybmF0aXZlbHkgeW91IGNhbiBxdWVyeSBmb3IgdGhlXG4gKiBgVGVtcGxhdGVSZWZgIGZyb20gYSBDb21wb25lbnQgb3IgYSBEaXJlY3RpdmUgdmlhIHtAbGluayBRdWVyeX0uXG4gKlxuICogVG8gaW5zdGFudGlhdGUgRW1iZWRkZWQgVmlld3MgYmFzZWQgb24gYSBUZW1wbGF0ZSwgdXNlXG4gKiB7QGxpbmsgVmlld0NvbnRhaW5lclJlZiNjcmVhdGVFbWJlZGRlZFZpZXd9LCB3aGljaCB3aWxsIGNyZWF0ZSB0aGUgVmlldyBhbmQgYXR0YWNoIGl0IHRvIHRoZVxuICogVmlldyBDb250YWluZXIuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUZW1wbGF0ZVJlZiB7XG4gIC8qKlxuICAgKiBUaGUgbG9jYXRpb24gaW4gdGhlIFZpZXcgd2hlcmUgdGhlIEVtYmVkZGVkIFZpZXcgbG9naWNhbGx5IGJlbG9uZ3MgdG8uXG4gICAqXG4gICAqIFRoZSBkYXRhLWJpbmRpbmcgYW5kIGluamVjdGlvbiBjb250ZXh0cyBvZiBFbWJlZGRlZCBWaWV3cyBjcmVhdGVkIGZyb20gdGhpcyBgVGVtcGxhdGVSZWZgXG4gICAqIGluaGVyaXQgZnJvbSB0aGUgY29udGV4dHMgb2YgdGhpcyBsb2NhdGlvbi5cbiAgICpcbiAgICogVHlwaWNhbGx5IG5ldyBFbWJlZGRlZCBWaWV3cyBhcmUgYXR0YWNoZWQgdG8gdGhlIFZpZXcgQ29udGFpbmVyIG9mIHRoaXMgbG9jYXRpb24sIGJ1dCBpblxuICAgKiBhZHZhbmNlZCB1c2UtY2FzZXMsIHRoZSBWaWV3IGNhbiBiZSBhdHRhY2hlZCB0byBhIGRpZmZlcmVudCBjb250YWluZXIgd2hpbGUga2VlcGluZyB0aGVcbiAgICogZGF0YS1iaW5kaW5nIGFuZCBpbmplY3Rpb24gY29udGV4dCBmcm9tIHRoZSBvcmlnaW5hbCBsb2NhdGlvbi5cbiAgICpcbiAgICovXG4gIC8vIFRPRE8oaSk6IHJlbmFtZSB0byBhbmNob3Igb3IgbG9jYXRpb25cbiAgZ2V0IGVsZW1lbnRSZWYoKTogRWxlbWVudFJlZiB7IHJldHVybiBudWxsOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVJlZl8gZXh0ZW5kcyBUZW1wbGF0ZVJlZiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWZfKSB7IHN1cGVyKCk7IH1cblxuICBnZXQgZWxlbWVudFJlZigpOiBFbGVtZW50UmVmXyB7IHJldHVybiB0aGlzLl9lbGVtZW50UmVmOyB9XG59XG4iXX0=