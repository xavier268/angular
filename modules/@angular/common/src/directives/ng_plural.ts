/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, Directive, Host, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';

import {isPresent} from '../facade/lang';
import {NgLocalization, getPluralCategory} from '../localization';

import {SwitchView} from './ng_switch';


/**
 * `ngPlural` is an i18n directive that displays DOM sub-trees that match the switch expression
 * value, or failing that, DOM sub-trees that match the switch expression's pluralization category.
 *
 * To use this directive you must provide a container element that sets the `[ngPlural]` attribute
 * to a
 * switch expression.
 *    - Inner elements defined with an `[ngPluralCase]` attribute will display based on their
 * expression.
 *    - If `[ngPluralCase]` is set to a value starting with `=`, it will only display if the value
 * matches the switch expression exactly.
 *    - Otherwise, the view will be treated as a "category match", and will only display if exact
 * value matches aren't found and the value maps to its category for the defined locale.
 *
 * ```typescript
 * @Component({
 *    selector: 'app',
 *    // best practice is to define the locale at the application level
 *    providers: [{provide: LOCALE_ID, useValue: 'en_US'}]
 * })
 * @View({
 *   template: `
 *     <p>Value = {{value}}</p>
 *     <button (click)="inc()">Increment</button>
 *
 *     <div [ngPlural]="value">
 *       <template ngPluralCase="=0">there is nothing</template>
 *       <template ngPluralCase="=1">there is one</template>
 *       <template ngPluralCase="few">there are a few</template>
 *       <template ngPluralCase="other">there is some number</template>
 *     </div>
 *   `,
 *   directives: [NgPlural, NgPluralCase]
 * })
 * export class App {
 *   value = 'init';
 *
 *   inc() {
 *     this.value = this.value === 'init' ? 0 : this.value + 1;
 *   }
 * }
 *
 * ```
 * @experimental
 */
@Directive({selector: '[ngPlural]'})
export class NgPlural {
  private _switchValue: number;
  private _activeView: SwitchView;
  private _caseViews: {[k: string]: SwitchView} = {};

  constructor(private _localization: NgLocalization) {}

  @Input()
  set ngPlural(value: number) {
    this._switchValue = value;
    this._updateView();
  }

  addCase(value: string, switchView: SwitchView): void { this._caseViews[value] = switchView; }

  /** @internal */
  _updateView(): void {
    this._clearViews();

    var key =
        getPluralCategory(this._switchValue, Object.keys(this._caseViews), this._localization);
    this._activateView(this._caseViews[key]);
  }

  /** @internal */
  _clearViews() {
    if (isPresent(this._activeView)) this._activeView.destroy();
  }

  /** @internal */
  _activateView(view: SwitchView) {
    if (!isPresent(view)) return;
    this._activeView = view;
    this._activeView.create();
  }
}

/**
 * @experimental
 */
@Directive({selector: '[ngPluralCase]'})
export class NgPluralCase {
  constructor(
      @Attribute('ngPluralCase') public value: string, template: TemplateRef<Object>,
      viewContainer: ViewContainerRef, @Host() ngPlural: NgPlural) {
    ngPlural.addCase(value, new SwitchView(viewContainer, template));
  }
}
