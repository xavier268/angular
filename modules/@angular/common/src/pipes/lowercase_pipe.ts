/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {isBlank, isString} from '../facade/lang';
import {InvalidPipeArgumentError} from './invalid_pipe_argument_error';


/**
 * Transforms text to lowercase.
 *
 * ### Example
 *
 * {@example core/pipes/ts/lowerupper_pipe/lowerupper_pipe_example.ts region='LowerUpperPipe'}
 *
 * @stable
 */
@Pipe({name: 'lowercase'})
export class LowerCasePipe implements PipeTransform {
  transform(value: string): string {
    if (isBlank(value)) return value;
    if (!isString(value)) {
      throw new InvalidPipeArgumentError(LowerCasePipe, value);
    }
    return value.toLowerCase();
  }
}
