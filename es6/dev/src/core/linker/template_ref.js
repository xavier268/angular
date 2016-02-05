var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
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
export let TemplateRef = class {
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
    get elementRef() { return null; }
};
TemplateRef = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], TemplateRef);
export class TemplateRef_ extends TemplateRef {
    constructor(_elementRef) {
        super();
        this._elementRef = _elementRef;
    }
    get elementRef() { return this._elementRef; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3RlbXBsYXRlX3JlZi50cyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVJlZiIsIlRlbXBsYXRlUmVmLmVsZW1lbnRSZWYiLCJUZW1wbGF0ZVJlZl8iLCJUZW1wbGF0ZVJlZl8uY29uc3RydWN0b3IiLCJUZW1wbGF0ZVJlZl8uZWxlbWVudFJlZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQ08sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7QUFFL0M7Ozs7Ozs7Ozs7O0dBV0c7QUFDSDtJQUVFQTs7Ozs7Ozs7OztPQVVHQTtJQUNIQSx3Q0FBd0NBO0lBQ3hDQSxJQUFJQSxVQUFVQSxLQUFpQkMsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDL0NELENBQUNBO0FBZkQ7SUFBQyxVQUFVLEVBQUU7O2dCQWVaO0FBRUQsa0NBQWtDLFdBQVc7SUFDM0NFLFlBQW9CQSxXQUF3QkE7UUFBSUMsT0FBT0EsQ0FBQ0E7UUFBcENBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFhQTtJQUFhQSxDQUFDQTtJQUUxREQsSUFBSUEsVUFBVUEsS0FBa0JFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO0FBQzVERixDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFbGVtZW50UmVmLCBFbGVtZW50UmVmX30gZnJvbSAnLi9lbGVtZW50X3JlZic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIEVtYmVkZGVkIFRlbXBsYXRlIHRoYXQgY2FuIGJlIHVzZWQgdG8gaW5zdGFudGlhdGUgRW1iZWRkZWQgVmlld3MuXG4gKlxuICogWW91IGNhbiBhY2Nlc3MgYSBgVGVtcGxhdGVSZWZgLCBpbiB0d28gd2F5cy4gVmlhIGEgZGlyZWN0aXZlIHBsYWNlZCBvbiBhIGA8dGVtcGxhdGU+YCBlbGVtZW50IChvclxuICogZGlyZWN0aXZlIHByZWZpeGVkIHdpdGggYCpgKSBhbmQgaGF2ZSB0aGUgYFRlbXBsYXRlUmVmYCBmb3IgdGhpcyBFbWJlZGRlZCBWaWV3IGluamVjdGVkIGludG8gdGhlXG4gKiBjb25zdHJ1Y3RvciBvZiB0aGUgZGlyZWN0aXZlIHVzaW5nIHRoZSBgVGVtcGxhdGVSZWZgIFRva2VuLiBBbHRlcm5hdGl2ZWx5IHlvdSBjYW4gcXVlcnkgZm9yIHRoZVxuICogYFRlbXBsYXRlUmVmYCBmcm9tIGEgQ29tcG9uZW50IG9yIGEgRGlyZWN0aXZlIHZpYSB7QGxpbmsgUXVlcnl9LlxuICpcbiAqIFRvIGluc3RhbnRpYXRlIEVtYmVkZGVkIFZpZXdzIGJhc2VkIG9uIGEgVGVtcGxhdGUsIHVzZVxuICoge0BsaW5rIFZpZXdDb250YWluZXJSZWYjY3JlYXRlRW1iZWRkZWRWaWV3fSwgd2hpY2ggd2lsbCBjcmVhdGUgdGhlIFZpZXcgYW5kIGF0dGFjaCBpdCB0byB0aGVcbiAqIFZpZXcgQ29udGFpbmVyLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVGVtcGxhdGVSZWYge1xuICAvKipcbiAgICogVGhlIGxvY2F0aW9uIGluIHRoZSBWaWV3IHdoZXJlIHRoZSBFbWJlZGRlZCBWaWV3IGxvZ2ljYWxseSBiZWxvbmdzIHRvLlxuICAgKlxuICAgKiBUaGUgZGF0YS1iaW5kaW5nIGFuZCBpbmplY3Rpb24gY29udGV4dHMgb2YgRW1iZWRkZWQgVmlld3MgY3JlYXRlZCBmcm9tIHRoaXMgYFRlbXBsYXRlUmVmYFxuICAgKiBpbmhlcml0IGZyb20gdGhlIGNvbnRleHRzIG9mIHRoaXMgbG9jYXRpb24uXG4gICAqXG4gICAqIFR5cGljYWxseSBuZXcgRW1iZWRkZWQgVmlld3MgYXJlIGF0dGFjaGVkIHRvIHRoZSBWaWV3IENvbnRhaW5lciBvZiB0aGlzIGxvY2F0aW9uLCBidXQgaW5cbiAgICogYWR2YW5jZWQgdXNlLWNhc2VzLCB0aGUgVmlldyBjYW4gYmUgYXR0YWNoZWQgdG8gYSBkaWZmZXJlbnQgY29udGFpbmVyIHdoaWxlIGtlZXBpbmcgdGhlXG4gICAqIGRhdGEtYmluZGluZyBhbmQgaW5qZWN0aW9uIGNvbnRleHQgZnJvbSB0aGUgb3JpZ2luYWwgbG9jYXRpb24uXG4gICAqXG4gICAqL1xuICAvLyBUT0RPKGkpOiByZW5hbWUgdG8gYW5jaG9yIG9yIGxvY2F0aW9uXG4gIGdldCBlbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gbnVsbDsgfVxufVxuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVSZWZfIGV4dGVuZHMgVGVtcGxhdGVSZWYge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmXykgeyBzdXBlcigpOyB9XG5cbiAgZ2V0IGVsZW1lbnRSZWYoKTogRWxlbWVudFJlZl8geyByZXR1cm4gdGhpcy5fZWxlbWVudFJlZjsgfVxufVxuIl19