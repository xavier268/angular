/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, RenderComponentType, Type, ViewEncapsulation} from '@angular/core';

import {isArray, isPresent, serializeEnum} from '../../facade/lang';
import {VIEW_ENCAPSULATION_VALUES} from '../../private_import_core';

import {RenderStore} from './render_store';
import {LocationType} from './serialized_types';



// PRIMITIVE is any type that does not need to be serialized (string, number, boolean)
// We set it to String so that it is considered a Type.
/**
 * @experimental WebWorker support in Angular is currently experimental.
 */
export const PRIMITIVE: Type<any> = String;

@Injectable()
export class Serializer {
  constructor(private _renderStore: RenderStore) {}

  serialize(obj: any, type: any): Object {
    if (!isPresent(obj)) {
      return null;
    }
    if (isArray(obj)) {
      return (<any[]>obj).map(v => this.serialize(v, type));
    }
    if (type == PRIMITIVE) {
      return obj;
    }
    if (type == RenderStoreObject) {
      return this._renderStore.serialize(obj);
    } else if (type === RenderComponentType) {
      return this._serializeRenderComponentType(obj);
    } else if (type === ViewEncapsulation) {
      return serializeEnum(obj);
    } else if (type === LocationType) {
      return this._serializeLocation(obj);
    } else {
      throw new Error('No serializer for ' + type.toString());
    }
  }

  deserialize(map: any, type: any, data?: any): any {
    if (!isPresent(map)) {
      return null;
    }
    if (isArray(map)) {
      var obj: any[] = [];
      (<any[]>map).forEach(val => obj.push(this.deserialize(val, type, data)));
      return obj;
    }
    if (type == PRIMITIVE) {
      return map;
    }

    if (type == RenderStoreObject) {
      return this._renderStore.deserialize(map);
    } else if (type === RenderComponentType) {
      return this._deserializeRenderComponentType(map);
    } else if (type === ViewEncapsulation) {
      return VIEW_ENCAPSULATION_VALUES[map];
    } else if (type === LocationType) {
      return this._deserializeLocation(map);
    } else {
      throw new Error('No deserializer for ' + type.toString());
    }
  }

  private _serializeLocation(loc: LocationType): Object {
    return {
      'href': loc.href,
      'protocol': loc.protocol,
      'host': loc.host,
      'hostname': loc.hostname,
      'port': loc.port,
      'pathname': loc.pathname,
      'search': loc.search,
      'hash': loc.hash,
      'origin': loc.origin
    };
  }

  private _deserializeLocation(loc: {[key: string]: any}): LocationType {
    return new LocationType(
        loc['href'], loc['protocol'], loc['host'], loc['hostname'], loc['port'], loc['pathname'],
        loc['search'], loc['hash'], loc['origin']);
  }

  private _serializeRenderComponentType(obj: RenderComponentType): Object {
    return {
      'id': obj.id,
      'templateUrl': obj.templateUrl,
      'slotCount': obj.slotCount,
      'encapsulation': this.serialize(obj.encapsulation, ViewEncapsulation),
      'styles': this.serialize(obj.styles, PRIMITIVE)
    };
  }

  private _deserializeRenderComponentType(map: {[key: string]: any}): RenderComponentType {
    return new RenderComponentType(
        map['id'], map['templateUrl'], map['slotCount'],
        this.deserialize(map['encapsulation'], ViewEncapsulation),
        this.deserialize(map['styles'], PRIMITIVE), {});
  }
}


export class RenderStoreObject {}
