/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OpaqueToken} from '@angular/core/src/di';
import {ListWrapper, StringMapWrapper} from '@angular/facade/src/collection';
import {Math, NumberWrapper, StringWrapper, isBlank, isPresent} from '@angular/facade/src/lang';

import {Options} from '../common_options';
import {Metric} from '../metric';
import {PerfLogFeatures, WebDriverExtension} from '../web_driver_extension';


/**
 * A metric that reads out the performance log
 */
export class PerflogMetric extends Metric {
  // TODO(tbosch): use static values when our transpiler supports them
  static get PROVIDERS(): any[] { return _PROVIDERS; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get SET_TIMEOUT(): OpaqueToken { return _SET_TIMEOUT; }

  /** @internal */
  private _remainingEvents: Array<{[key: string]: any}>;
  /** @internal */
  private _measureCount: number;
  /** @internal */
  private _perfLogFeatures: PerfLogFeatures;


  /**
   * @param driverExtension
   * @param setTimeout
   * @param microMetrics Name and description of metrics provided via console.time / console.timeEnd
   **/
  constructor(
      /** @internal */
      private _driverExtension: WebDriverExtension,
      /** @internal */
      private _setTimeout: Function,
      /** @internal */
      private _microMetrics: {[key: string]: any},
      /** @internal */
      private _forceGc: boolean,
      /** @internal */
      private _captureFrames: boolean,
      /** @internal */
      private _receivedData: boolean,
      /** @internal */
      private _requestCount: boolean) {
    super();

    this._remainingEvents = [];
    this._measureCount = 0;
    this._perfLogFeatures = _driverExtension.perfLogFeatures();
    if (!this._perfLogFeatures.userTiming) {
      // User timing is needed for navigationStart.
      this._receivedData = false;
      this._requestCount = false;
    }
  }

  describe(): {[key: string]: any} {
    var res = {
      'scriptTime': 'script execution time in ms, including gc and render',
      'pureScriptTime': 'script execution time in ms, without gc nor render'
    };
    if (this._perfLogFeatures.render) {
      res['renderTime'] = 'render time in ms';
    }
    if (this._perfLogFeatures.gc) {
      res['gcTime'] = 'gc time in ms';
      res['gcAmount'] = 'gc amount in kbytes';
      res['majorGcTime'] = 'time of major gcs in ms';
      if (this._forceGc) {
        res['forcedGcTime'] = 'forced gc time in ms';
        res['forcedGcAmount'] = 'forced gc amount in kbytes';
      }
    }
    if (this._receivedData) {
      res['receivedData'] = 'encoded bytes received since navigationStart';
    }
    if (this._requestCount) {
      res['requestCount'] = 'count of requests sent since navigationStart';
    }
    if (this._captureFrames) {
      if (!this._perfLogFeatures.frameCapture) {
        var warningMsg = 'WARNING: Metric requested, but not supported by driver';
        // using dot syntax for metric name to keep them grouped together in console reporter
        res['frameTime.mean'] = warningMsg;
        res['frameTime.worst'] = warningMsg;
        res['frameTime.best'] = warningMsg;
        res['frameTime.smooth'] = warningMsg;
      } else {
        res['frameTime.mean'] = 'mean frame time in ms (target: 16.6ms for 60fps)';
        res['frameTime.worst'] = 'worst frame time in ms';
        res['frameTime.best'] = 'best frame time in ms';
        res['frameTime.smooth'] = 'percentage of frames that hit 60fps';
      }
    }
    StringMapWrapper.forEach(
        this._microMetrics, (desc, name) => { StringMapWrapper.set(res, name, desc); });
    return res;
  }

  beginMeasure(): Promise<any> {
    var resultPromise = Promise.resolve(null);
    if (this._forceGc) {
      resultPromise = resultPromise.then((_) => this._driverExtension.gc());
    }
    return resultPromise.then((_) => this._beginMeasure());
  }

  endMeasure(restart: boolean): Promise<{[key: string]: any}> {
    if (this._forceGc) {
      return this._endPlainMeasureAndMeasureForceGc(restart);
    } else {
      return this._endMeasure(restart);
    }
  }

  /** @internal */
  private _endPlainMeasureAndMeasureForceGc(restartMeasure: boolean) {
    return this._endMeasure(true).then((measureValues) => {
      // disable frame capture for measurements during forced gc
      var originalFrameCaptureValue = this._captureFrames;
      this._captureFrames = false;
      return this._driverExtension.gc()
          .then((_) => this._endMeasure(restartMeasure))
          .then((forceGcMeasureValues) => {
            this._captureFrames = originalFrameCaptureValue;
            StringMapWrapper.set(measureValues, 'forcedGcTime', forceGcMeasureValues['gcTime']);
            StringMapWrapper.set(measureValues, 'forcedGcAmount', forceGcMeasureValues['gcAmount']);
            return measureValues;
          });
    });
  }

  /** @internal */
  private _beginMeasure(): Promise<any> {
    return this._driverExtension.timeBegin(this._markName(this._measureCount++));
  }

  /** @internal */
  private _endMeasure(restart: boolean): Promise<{[key: string]: any}> {
    var markName = this._markName(this._measureCount - 1);
    var nextMarkName = restart ? this._markName(this._measureCount++) : null;
    return this._driverExtension.timeEnd(markName, nextMarkName)
        .then((_) => this._readUntilEndMark(markName));
  }

  /** @internal */
  private _readUntilEndMark(markName: string, loopCount: number = 0, startEvent = null) {
    if (loopCount > _MAX_RETRY_COUNT) {
      throw new Error(`Tried too often to get the ending mark: ${loopCount}`);
    }
    return this._driverExtension.readPerfLog().then((events) => {
      this._addEvents(events);
      var result = this._aggregateEvents(this._remainingEvents, markName);
      if (isPresent(result)) {
        this._remainingEvents = events;
        return result;
      }
      var resolve: (result: any) => void;
      var promise = new Promise(res => { resolve = res; });
      this._setTimeout(() => resolve(this._readUntilEndMark(markName, loopCount + 1)), 100);
      return promise;
    });
  }

  /** @internal */
  private _addEvents(events: {[key: string]: string}[]) {
    var needSort = false;
    events.forEach(event => {
      if (StringWrapper.equals(event['ph'], 'X')) {
        needSort = true;
        var startEvent = {};
        var endEvent = {};
        StringMapWrapper.forEach(event, (value, prop) => {
          startEvent[prop] = value;
          endEvent[prop] = value;
        });
        startEvent['ph'] = 'B';
        endEvent['ph'] = 'E';
        endEvent['ts'] = startEvent['ts'] + startEvent['dur'];
        this._remainingEvents.push(startEvent);
        this._remainingEvents.push(endEvent);
      } else {
        this._remainingEvents.push(event);
      }
    });
    if (needSort) {
      // Need to sort because of the ph==='X' events
      ListWrapper.sort(this._remainingEvents, (a, b) => {
        var diff = a['ts'] - b['ts'];
        return diff > 0 ? 1 : diff < 0 ? -1 : 0;
      });
    }
  }

  /** @internal */
  private _aggregateEvents(events: Array<{[key: string]: any}>, markName): {[key: string]: any} {
    var result = {'scriptTime': 0, 'pureScriptTime': 0};
    if (this._perfLogFeatures.gc) {
      result['gcTime'] = 0;
      result['majorGcTime'] = 0;
      result['gcAmount'] = 0;
    }
    if (this._perfLogFeatures.render) {
      result['renderTime'] = 0;
    }
    if (this._captureFrames) {
      result['frameTime.mean'] = 0;
      result['frameTime.best'] = 0;
      result['frameTime.worst'] = 0;
      result['frameTime.smooth'] = 0;
    }
    StringMapWrapper.forEach(this._microMetrics, (desc, name) => { result[name] = 0; });
    if (this._receivedData) {
      result['receivedData'] = 0;
    }
    if (this._requestCount) {
      result['requestCount'] = 0;
    }

    var markStartEvent = null;
    var markEndEvent = null;
    var gcTimeInScript = 0;
    var renderTimeInScript = 0;

    var frameTimestamps = [];
    var frameTimes = [];
    var frameCaptureStartEvent = null;
    var frameCaptureEndEvent = null;

    var intervalStarts: {[key: string]: any} = {};
    var intervalStartCount: {[key: string]: number} = {};
    events.forEach((event) => {
      var ph = event['ph'];
      var name = event['name'];
      var microIterations = 1;
      var microIterationsMatch = name.match(_MICRO_ITERATIONS_REGEX);
      if (isPresent(microIterationsMatch)) {
        name = microIterationsMatch[1];
        microIterations = NumberWrapper.parseInt(microIterationsMatch[2], 10);
      }

      if (StringWrapper.equals(ph, 'b') && StringWrapper.equals(name, markName)) {
        markStartEvent = event;
      } else if (StringWrapper.equals(ph, 'e') && StringWrapper.equals(name, markName)) {
        markEndEvent = event;
      }

      let isInstant = StringWrapper.equals(ph, 'I') || StringWrapper.equals(ph, 'i');
      if (this._requestCount && StringWrapper.equals(name, 'sendRequest')) {
        result['requestCount'] += 1;
      } else if (this._receivedData && StringWrapper.equals(name, 'receivedData') && isInstant) {
        result['receivedData'] += event['args']['encodedDataLength'];
      } else if (StringWrapper.equals(name, 'navigationStart')) {
        // We count data + requests since the last navigationStart
        // (there might be chrome extensions loaded by selenium before our page, so there
        // will likely be more than one navigationStart).
        if (this._receivedData) {
          result['receivedData'] = 0;
        }
        if (this._requestCount) {
          result['requestCount'] = 0;
        }
      }
      if (isPresent(markStartEvent) && isBlank(markEndEvent) &&
          event['pid'] === markStartEvent['pid']) {
        if (StringWrapper.equals(ph, 'b') && StringWrapper.equals(name, _MARK_NAME_FRAME_CAPUTRE)) {
          if (isPresent(frameCaptureStartEvent)) {
            throw new Error('can capture frames only once per benchmark run');
          }
          if (!this._captureFrames) {
            throw new Error(
                'found start event for frame capture, but frame capture was not requested in benchpress');
          }
          frameCaptureStartEvent = event;
        } else if (
            StringWrapper.equals(ph, 'e') && StringWrapper.equals(name, _MARK_NAME_FRAME_CAPUTRE)) {
          if (isBlank(frameCaptureStartEvent)) {
            throw new Error('missing start event for frame capture');
          }
          frameCaptureEndEvent = event;
        }

        if (isInstant) {
          if (isPresent(frameCaptureStartEvent) && isBlank(frameCaptureEndEvent) &&
              StringWrapper.equals(name, 'frame')) {
            frameTimestamps.push(event['ts']);
            if (frameTimestamps.length >= 2) {
              frameTimes.push(
                  frameTimestamps[frameTimestamps.length - 1] -
                  frameTimestamps[frameTimestamps.length - 2]);
            }
          }
        }

        if (StringWrapper.equals(ph, 'B') || StringWrapper.equals(ph, 'b')) {
          if (isBlank(intervalStarts[name])) {
            intervalStartCount[name] = 1;
            intervalStarts[name] = event;
          } else {
            intervalStartCount[name]++;
          }
        } else if (
            (StringWrapper.equals(ph, 'E') || StringWrapper.equals(ph, 'e')) &&
            isPresent(intervalStarts[name])) {
          intervalStartCount[name]--;
          if (intervalStartCount[name] === 0) {
            var startEvent = intervalStarts[name];
            var duration = (event['ts'] - startEvent['ts']);
            intervalStarts[name] = null;
            if (StringWrapper.equals(name, 'gc')) {
              result['gcTime'] += duration;
              var amount =
                  (startEvent['args']['usedHeapSize'] - event['args']['usedHeapSize']) / 1000;
              result['gcAmount'] += amount;
              var majorGc = event['args']['majorGc'];
              if (isPresent(majorGc) && majorGc) {
                result['majorGcTime'] += duration;
              }
              if (isPresent(intervalStarts['script'])) {
                gcTimeInScript += duration;
              }
            } else if (StringWrapper.equals(name, 'render')) {
              result['renderTime'] += duration;
              if (isPresent(intervalStarts['script'])) {
                renderTimeInScript += duration;
              }
            } else if (StringWrapper.equals(name, 'script')) {
              result['scriptTime'] += duration;
            } else if (isPresent(this._microMetrics[name])) {
              result[name] += duration / microIterations;
            }
          }
        }
      }
    });
    if (!isPresent(markStartEvent) || !isPresent(markEndEvent)) {
      // not all events have been received, no further processing for now
      return null;
    }

    if (isPresent(markEndEvent) && isPresent(frameCaptureStartEvent) &&
        isBlank(frameCaptureEndEvent)) {
      throw new Error('missing end event for frame capture');
    }
    if (this._captureFrames && isBlank(frameCaptureStartEvent)) {
      throw new Error('frame capture requested in benchpress, but no start event was found');
    }
    if (frameTimes.length > 0) {
      this._addFrameMetrics(result, frameTimes);
    }
    result['pureScriptTime'] = result['scriptTime'] - gcTimeInScript - renderTimeInScript;
    return result;
  }

  /** @internal */
  private _addFrameMetrics(result: {[key: string]: any}, frameTimes: any[]) {
    result['frameTime.mean'] = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    var firstFrame = frameTimes[0];
    result['frameTime.worst'] = frameTimes.reduce((a, b) => a > b ? a : b, firstFrame);
    result['frameTime.best'] = frameTimes.reduce((a, b) => a < b ? a : b, firstFrame);
    result['frameTime.smooth'] =
        frameTimes.filter(t => t < _FRAME_TIME_SMOOTH_THRESHOLD).length / frameTimes.length;
  }

  /** @internal */
  private _markName(index) { return `${_MARK_NAME_PREFIX}${index}`; }
}

var _MICRO_ITERATIONS_REGEX = /(.+)\*(\d+)$/;

var _MAX_RETRY_COUNT = 20;
var _MARK_NAME_PREFIX = 'benchpress';
var _SET_TIMEOUT = new OpaqueToken('PerflogMetric.setTimeout');

var _MARK_NAME_FRAME_CAPUTRE = 'frameCapture';
// using 17ms as a somewhat looser threshold, instead of 16.6666ms
var _FRAME_TIME_SMOOTH_THRESHOLD = 17;

var _PROVIDERS = [
  {
    provide: PerflogMetric,
    useFactory: (driverExtension, setTimeout, microMetrics, forceGc, captureFrames, receivedData,
                 requestCount) =>
                    new PerflogMetric(
                        driverExtension, setTimeout, microMetrics, forceGc, captureFrames,
                        receivedData, requestCount),
    deps: [
      WebDriverExtension, _SET_TIMEOUT, Options.MICRO_METRICS, Options.FORCE_GC,
      Options.CAPTURE_FRAMES, Options.RECEIVED_DATA, Options.REQUEST_COUNT
    ]
  },
  {provide: _SET_TIMEOUT, useValue: (fn, millis) => <any>setTimeout(fn, millis)}
];
