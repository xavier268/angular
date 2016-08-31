/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, afterEach, beforeEach, ddescribe, describe, expect, iit, inject, it, xit} from '@angular/core/testing/testing_internal';
import {Date, DateWrapper, isBlank, isPresent, stringify} from '@angular/facade/src/lang';
import {MeasureValues, Metric, Options, ReflectiveInjector, Reporter, Sampler, Validator, WebDriverAdapter} from 'benchpress/common';

export function main() {
  var EMPTY_EXECUTE = () => {};

  describe('sampler', () => {
    var sampler: Sampler;

    function createSampler({driver, metric, reporter, validator, prepare, execute}: {
      driver?: any,
      metric?: Metric,
      reporter?: Reporter,
      validator?: Validator,
      prepare?: any,
      execute?: any
    } = {}) {
      var time = 1000;
      if (isBlank(metric)) {
        metric = new MockMetric([]);
      }
      if (isBlank(reporter)) {
        reporter = new MockReporter([]);
      }
      if (isBlank(driver)) {
        driver = new MockDriverAdapter([]);
      }
      var providers = [
        Options.DEFAULT_PROVIDERS, Sampler.PROVIDERS, {provide: Metric, useValue: metric},
        {provide: Reporter, useValue: reporter}, {provide: WebDriverAdapter, useValue: driver},
        {provide: Options.EXECUTE, useValue: execute}, {provide: Validator, useValue: validator},
        {provide: Options.NOW, useValue: () => DateWrapper.fromMillis(time++)}
      ];
      if (isPresent(prepare)) {
        providers.push({provide: Options.PREPARE, useValue: prepare});
      }

      sampler = ReflectiveInjector.resolveAndCreate(providers).get(Sampler);
    }

    it('should call the prepare and execute callbacks using WebDriverAdapter.waitFor',
       inject([AsyncTestCompleter], (async) => {
         var log = [];
         var count = 0;
         var driver = new MockDriverAdapter([], (callback) => {
           var result = callback();
           log.push(result);
           return Promise.resolve(result);
         });
         createSampler({
           driver: driver,
           validator: createCountingValidator(2),
           prepare: () => { return count++; },
           execute: () => { return count++; }
         });
         sampler.sample().then((_) => {
           expect(count).toBe(4);
           expect(log).toEqual([0, 1, 2, 3]);
           async.done();
         });

       }));

    it('should call prepare, beginMeasure, execute, endMeasure for every iteration',
       inject([AsyncTestCompleter], (async) => {
         var workCount = 0;
         var log = [];
         createSampler({
           metric: createCountingMetric(log),
           validator: createCountingValidator(2),
           prepare: () => { log.push(`p${workCount++}`); },
           execute: () => { log.push(`w${workCount++}`); }
         });
         sampler.sample().then((_) => {
           expect(log).toEqual([
             'p0',
             ['beginMeasure'],
             'w1',
             ['endMeasure', false, {'script': 0}],
             'p2',
             ['beginMeasure'],
             'w3',
             ['endMeasure', false, {'script': 1}],
           ]);
           async.done();
         });
       }));

    it('should call execute, endMeasure for every iteration if there is no prepare callback',
       inject([AsyncTestCompleter], (async) => {
         var log = [];
         var workCount = 0;
         createSampler({
           metric: createCountingMetric(log),
           validator: createCountingValidator(2),
           execute: () => { log.push(`w${workCount++}`); },
           prepare: null
         });
         sampler.sample().then((_) => {
           expect(log).toEqual([
             ['beginMeasure'],
             'w0',
             ['endMeasure', true, {'script': 0}],
             'w1',
             ['endMeasure', true, {'script': 1}],
           ]);
           async.done();
         });
       }));

    it('should only collect metrics for execute and ignore metrics from prepare',
       inject([AsyncTestCompleter], (async) => {
         var scriptTime = 0;
         var iterationCount = 1;
         createSampler({
           validator: createCountingValidator(2),
           metric: new MockMetric(
               [],
               () => {
                 var result = Promise.resolve({'script': scriptTime});
                 scriptTime = 0;
                 return result;
               }),
           prepare: () => { scriptTime = 1 * iterationCount; },
           execute: () => {
             scriptTime = 10 * iterationCount;
             iterationCount++;
           }
         });
         sampler.sample().then((state) => {
           expect(state.completeSample.length).toBe(2);
           expect(state.completeSample[0]).toEqual(mv(0, 1000, {'script': 10}));
           expect(state.completeSample[1]).toEqual(mv(1, 1001, {'script': 20}));
           async.done();
         });
       }));

    it('should call the validator for every execution and store the valid sample',
       inject([AsyncTestCompleter], (async) => {
         var log = [];
         var validSample = [{}];

         createSampler({
           metric: createCountingMetric(),
           validator: createCountingValidator(2, validSample, log),
           execute: EMPTY_EXECUTE
         });
         sampler.sample().then((state) => {
           expect(state.validSample).toBe(validSample);
           // TODO(tbosch): Why does this fail??
           // expect(log).toEqual([
           //   ['validate', [{'script': 0}], null],
           //   ['validate', [{'script': 0}, {'script': 1}], validSample]
           // ]);

           expect(log.length).toBe(2);
           expect(log[0]).toEqual(['validate', [mv(0, 1000, {'script': 0})], null]);
           expect(log[1]).toEqual(
               ['validate', [mv(0, 1000, {'script': 0}), mv(1, 1001, {'script': 1})], validSample]);

           async.done();
         });
       }));

    it('should report the metric values', inject([AsyncTestCompleter], (async) => {
         var log = [];
         var validSample = [{}];
         createSampler({
           validator: createCountingValidator(2, validSample),
           metric: createCountingMetric(),
           reporter: new MockReporter(log),
           execute: EMPTY_EXECUTE
         });
         sampler.sample().then((_) => {
           // TODO(tbosch): Why does this fail??
           // expect(log).toEqual([
           //   ['reportMeasureValues', 0, {'script': 0}],
           //   ['reportMeasureValues', 1, {'script': 1}],
           //   ['reportSample', [{'script': 0}, {'script': 1}], validSample]
           // ]);
           expect(log.length).toBe(3);
           expect(log[0]).toEqual(['reportMeasureValues', mv(0, 1000, {'script': 0})]);
           expect(log[1]).toEqual(['reportMeasureValues', mv(1, 1001, {'script': 1})]);
           expect(log[2]).toEqual([
             'reportSample', [mv(0, 1000, {'script': 0}), mv(1, 1001, {'script': 1})], validSample
           ]);

           async.done();
         });
       }));

  });
}

function mv(runIndex, time, values) {
  return new MeasureValues(runIndex, DateWrapper.fromMillis(time), values);
}

function createCountingValidator(count, validSample = null, log = null) {
  return new MockValidator(log, (completeSample) => {
    count--;
    if (count === 0) {
      return isPresent(validSample) ? validSample : completeSample;
    } else {
      return null;
    }
  });
}

function createCountingMetric(log = null) {
  var scriptTime = 0;
  return new MockMetric(log, () => { return {'script': scriptTime++}; });
}

class MockDriverAdapter extends WebDriverAdapter {
  /** @internal */
  private _log: any[];
  private _waitFor: Function;
  constructor(log = null, waitFor = null) {
    super();
    if (isBlank(log)) {
      log = [];
    }
    this._log = log;
    this._waitFor = waitFor;
  }
  waitFor(callback: Function): Promise<any> {
    if (isPresent(this._waitFor)) {
      return this._waitFor(callback);
    } else {
      return Promise.resolve(callback());
    }
  }
}


class MockValidator extends Validator {
  /** @internal */
  private _log: any[];
  constructor(log = null, private _validate: Function = null) {
    super();
    if (isBlank(log)) {
      log = [];
    }
    this._log = log;
  }
  validate(completeSample: MeasureValues[]): MeasureValues[] {
    var stableSample = isPresent(this._validate) ? this._validate(completeSample) : completeSample;
    this._log.push(['validate', completeSample, stableSample]);
    return stableSample;
  }
}

class MockMetric extends Metric {
  /** @internal */
  private _log: any[];
  constructor(log = null, private _endMeasure: Function = null) {
    super();
    if (isBlank(log)) {
      log = [];
    }
    this._log = log;
  }
  beginMeasure() {
    this._log.push(['beginMeasure']);
    return Promise.resolve(null);
  }
  endMeasure(restart) {
    var measureValues = isPresent(this._endMeasure) ? this._endMeasure() : {};
    this._log.push(['endMeasure', restart, measureValues]);
    return Promise.resolve(measureValues);
  }
}

class MockReporter extends Reporter {
  /** @internal */
  private _log: any[];
  constructor(log = null) {
    super();
    if (isBlank(log)) {
      log = [];
    }
    this._log = log;
  }
  reportMeasureValues(values): Promise<any> {
    this._log.push(['reportMeasureValues', values]);
    return Promise.resolve(null);
  }
  reportSample(completeSample, validSample): Promise<any> {
    this._log.push(['reportSample', completeSample, validSample]);
    return Promise.resolve(null);
  }
}
