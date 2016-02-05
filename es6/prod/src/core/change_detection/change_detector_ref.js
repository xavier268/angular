var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ChangeDetectionStrategy } from './constants';
import { Injectable } from 'angular2/src/core/di';
export let ChangeDetectorRef = class {
};
ChangeDetectorRef = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], ChangeDetectorRef);
export class ChangeDetectorRef_ extends ChangeDetectorRef {
    constructor(_cd) {
        super();
        this._cd = _cd;
    }
    markForCheck() { this._cd.markPathToRootAsCheckOnce(); }
    detach() { this._cd.mode = ChangeDetectionStrategy.Detached; }
    detectChanges() { this._cd.detectChanges(); }
    checkNoChanges() { this._cd.checkNoChanges(); }
    reattach() {
        this._cd.mode = ChangeDetectionStrategy.CheckAlways;
        this.markForCheck();
    }
}
