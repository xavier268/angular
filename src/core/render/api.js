'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var RenderComponentType = (function () {
    function RenderComponentType(id, encapsulation, styles) {
        this.id = id;
        this.encapsulation = encapsulation;
        this.styles = styles;
    }
    return RenderComponentType;
})();
exports.RenderComponentType = RenderComponentType;
var RenderDebugInfo = (function () {
    function RenderDebugInfo(injector, component, providerTokens, locals) {
        this.injector = injector;
        this.component = component;
        this.providerTokens = providerTokens;
        this.locals = locals;
    }
    return RenderDebugInfo;
})();
exports.RenderDebugInfo = RenderDebugInfo;
var Renderer = (function () {
    function Renderer() {
    }
    Renderer = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], Renderer);
    return Renderer;
})();
exports.Renderer = Renderer;
/**
 * Injectable service that provides a low-level interface for modifying the UI.
 *
 * Use this service to bypass Angular's templating and make custom UI changes that can't be
 * expressed declaratively. For example if you need to set a property or an attribute whose name is
 * not statically known, use {@link #setElementProperty} or {@link #setElementAttribute}
 * respectively.
 *
 * If you are implementing a custom renderer, you must implement this interface.
 *
 * The default Renderer implementation is `DomRenderer`. Also available is `WebWorkerRenderer`.
 */
var RootRenderer = (function () {
    function RootRenderer() {
    }
    return RootRenderer;
})();
exports.RootRenderer = RootRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaS50cyJdLCJuYW1lcyI6WyJSZW5kZXJDb21wb25lbnRUeXBlIiwiUmVuZGVyQ29tcG9uZW50VHlwZS5jb25zdHJ1Y3RvciIsIlJlbmRlckRlYnVnSW5mbyIsIlJlbmRlckRlYnVnSW5mby5jb25zdHJ1Y3RvciIsIlJlbmRlcmVyIiwiUmVuZGVyZXIuY29uc3RydWN0b3IiLCJSb290UmVuZGVyZXIiLCJSb290UmVuZGVyZXIuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLG1CQUFtQyxzQkFBc0IsQ0FBQyxDQUFBO0FBRTFEO0lBQ0VBLDZCQUFtQkEsRUFBVUEsRUFBU0EsYUFBZ0NBLEVBQ25EQSxNQUE2QkE7UUFEN0JDLE9BQUVBLEdBQUZBLEVBQUVBLENBQVFBO1FBQVNBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFtQkE7UUFDbkRBLFdBQU1BLEdBQU5BLE1BQU1BLENBQXVCQTtJQUFHQSxDQUFDQTtJQUN0REQsMEJBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUhZLDJCQUFtQixzQkFHL0IsQ0FBQTtBQUVEO0lBQ0VFLHlCQUFtQkEsUUFBa0JBLEVBQVNBLFNBQWNBLEVBQVNBLGNBQXFCQSxFQUN2RUEsTUFBd0JBO1FBRHhCQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFVQTtRQUFTQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFLQTtRQUFTQSxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBT0E7UUFDdkVBLFdBQU1BLEdBQU5BLE1BQU1BLENBQWtCQTtJQUFHQSxDQUFDQTtJQUNqREQsc0JBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUhZLHVCQUFlLGtCQUczQixDQUFBO0FBSUQ7SUFBQUU7SUE2Q0FDLENBQUNBO0lBN0NERDtRQUFDQSxlQUFVQSxFQUFFQTs7aUJBNkNaQTtJQUFEQSxlQUFDQTtBQUFEQSxDQUFDQSxBQTdDRCxJQTZDQztBQTVDcUIsZ0JBQVEsV0E0QzdCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUVIO0lBQUFFO0lBRUFDLENBQUNBO0lBQURELG1CQUFDQTtBQUFEQSxDQUFDQSxBQUZELElBRUM7QUFGcUIsb0JBQVksZUFFakMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtJbmplY3RvciwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5leHBvcnQgY2xhc3MgUmVuZGVyQ29tcG9uZW50VHlwZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpZDogc3RyaW5nLCBwdWJsaWMgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgICAgICAgICAgIHB1YmxpYyBzdHlsZXM6IEFycmF5PHN0cmluZyB8IGFueVtdPikge31cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmRlckRlYnVnSW5mbyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmplY3RvcjogSW5qZWN0b3IsIHB1YmxpYyBjb21wb25lbnQ6IGFueSwgcHVibGljIHByb3ZpZGVyVG9rZW5zOiBhbnlbXSxcbiAgICAgICAgICAgICAgcHVibGljIGxvY2FsczogTWFwPHN0cmluZywgYW55Pikge31cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXJlbnRSZW5kZXJlciB7IHJlbmRlckNvbXBvbmVudChjb21wb25lbnRUeXBlOiBSZW5kZXJDb21wb25lbnRUeXBlKTogUmVuZGVyZXI7IH1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbmRlcmVyIGltcGxlbWVudHMgUGFyZW50UmVuZGVyZXIge1xuICBhYnN0cmFjdCByZW5kZXJDb21wb25lbnQoY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSk6IFJlbmRlcmVyO1xuXG4gIGFic3RyYWN0IHNlbGVjdFJvb3RFbGVtZW50KHNlbGVjdG9yOiBzdHJpbmcpOiBhbnk7XG5cbiAgYWJzdHJhY3QgY3JlYXRlRWxlbWVudChwYXJlbnRFbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZyk6IGFueTtcblxuICBhYnN0cmFjdCBjcmVhdGVWaWV3Um9vdChob3N0RWxlbWVudDogYW55KTogYW55O1xuXG4gIGFic3RyYWN0IGNyZWF0ZVRlbXBsYXRlQW5jaG9yKHBhcmVudEVsZW1lbnQ6IGFueSk6IGFueTtcblxuICBhYnN0cmFjdCBjcmVhdGVUZXh0KHBhcmVudEVsZW1lbnQ6IGFueSwgdmFsdWU6IHN0cmluZyk6IGFueTtcblxuICBhYnN0cmFjdCBwcm9qZWN0Tm9kZXMocGFyZW50RWxlbWVudDogYW55LCBub2RlczogYW55W10pO1xuXG4gIGFic3RyYWN0IGF0dGFjaFZpZXdBZnRlcihub2RlOiBhbnksIHZpZXdSb290Tm9kZXM6IGFueVtdKTtcblxuICBhYnN0cmFjdCBkZXRhY2hWaWV3KHZpZXdSb290Tm9kZXM6IGFueVtdKTtcblxuICBhYnN0cmFjdCBkZXN0cm95Vmlldyhob3N0RWxlbWVudDogYW55LCB2aWV3QWxsTm9kZXM6IGFueVtdKTtcblxuICBhYnN0cmFjdCBsaXN0ZW4ocmVuZGVyRWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IEZ1bmN0aW9uO1xuXG4gIGFic3RyYWN0IGxpc3Rlbkdsb2JhbCh0YXJnZXQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiBGdW5jdGlvbjtcblxuICBhYnN0cmFjdCBzZXRFbGVtZW50UHJvcGVydHkocmVuZGVyRWxlbWVudDogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgcHJvcGVydHlWYWx1ZTogYW55KTtcblxuICBhYnN0cmFjdCBzZXRFbGVtZW50QXR0cmlidXRlKHJlbmRlckVsZW1lbnQ6IGFueSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCBhdHRyaWJ1dGVWYWx1ZTogc3RyaW5nKTtcblxuICAvKipcbiAgICogVXNlZCBvbmx5IGluIGRlYnVnIG1vZGUgdG8gc2VyaWFsaXplIHByb3BlcnR5IGNoYW5nZXMgdG8gY29tbWVudCBub2RlcyxcbiAgICogc3VjaCBhcyA8dGVtcGxhdGU+IHBsYWNlaG9sZGVycy5cbiAgICovXG4gIGFic3RyYWN0IHNldEJpbmRpbmdEZWJ1Z0luZm8ocmVuZGVyRWxlbWVudDogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgcHJvcGVydHlWYWx1ZTogc3RyaW5nKTtcblxuICBhYnN0cmFjdCBzZXRFbGVtZW50RGVidWdJbmZvKHJlbmRlckVsZW1lbnQ6IGFueSwgaW5mbzogUmVuZGVyRGVidWdJbmZvKTtcblxuICBhYnN0cmFjdCBzZXRFbGVtZW50Q2xhc3MocmVuZGVyRWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZywgaXNBZGQ6IGJvb2xlYW4pO1xuXG4gIGFic3RyYWN0IHNldEVsZW1lbnRTdHlsZShyZW5kZXJFbGVtZW50OiBhbnksIHN0eWxlTmFtZTogc3RyaW5nLCBzdHlsZVZhbHVlOiBzdHJpbmcpO1xuXG4gIGFic3RyYWN0IGludm9rZUVsZW1lbnRNZXRob2QocmVuZGVyRWxlbWVudDogYW55LCBtZXRob2ROYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKTtcblxuICBhYnN0cmFjdCBzZXRUZXh0KHJlbmRlck5vZGU6IGFueSwgdGV4dDogc3RyaW5nKTtcbn1cblxuLyoqXG4gKiBJbmplY3RhYmxlIHNlcnZpY2UgdGhhdCBwcm92aWRlcyBhIGxvdy1sZXZlbCBpbnRlcmZhY2UgZm9yIG1vZGlmeWluZyB0aGUgVUkuXG4gKlxuICogVXNlIHRoaXMgc2VydmljZSB0byBieXBhc3MgQW5ndWxhcidzIHRlbXBsYXRpbmcgYW5kIG1ha2UgY3VzdG9tIFVJIGNoYW5nZXMgdGhhdCBjYW4ndCBiZVxuICogZXhwcmVzc2VkIGRlY2xhcmF0aXZlbHkuIEZvciBleGFtcGxlIGlmIHlvdSBuZWVkIHRvIHNldCBhIHByb3BlcnR5IG9yIGFuIGF0dHJpYnV0ZSB3aG9zZSBuYW1lIGlzXG4gKiBub3Qgc3RhdGljYWxseSBrbm93biwgdXNlIHtAbGluayAjc2V0RWxlbWVudFByb3BlcnR5fSBvciB7QGxpbmsgI3NldEVsZW1lbnRBdHRyaWJ1dGV9XG4gKiByZXNwZWN0aXZlbHkuXG4gKlxuICogSWYgeW91IGFyZSBpbXBsZW1lbnRpbmcgYSBjdXN0b20gcmVuZGVyZXIsIHlvdSBtdXN0IGltcGxlbWVudCB0aGlzIGludGVyZmFjZS5cbiAqXG4gKiBUaGUgZGVmYXVsdCBSZW5kZXJlciBpbXBsZW1lbnRhdGlvbiBpcyBgRG9tUmVuZGVyZXJgLiBBbHNvIGF2YWlsYWJsZSBpcyBgV2ViV29ya2VyUmVuZGVyZXJgLlxuICovXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSb290UmVuZGVyZXIgaW1wbGVtZW50cyBQYXJlbnRSZW5kZXJlciB7XG4gIGFic3RyYWN0IHJlbmRlckNvbXBvbmVudChjb21wb25lbnRUeXBlOiBSZW5kZXJDb21wb25lbnRUeXBlKTogUmVuZGVyZXI7XG59XG4iXX0=