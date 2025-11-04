// Work in progress still...

// import { CADActiveUnitFetchOptions } from '../constants';
import { Instance } from '../instance/Instance';
import * as globalTypes from '../constants';
import type { CADGetActiveUnitsStruct } from '../libs/rest/src';
import { CADActiveUnit, CADActiveUnitResolvable, CADActiveUnitStruct } from '../structures/CADActiveUnit';
import { CacheManager } from './CacheManager';

export class CADActiveUnitsManager extends CacheManager<number, CADActiveUnit, CADActiveUnitResolvable> {
  public serverId: number;
  public instance: Instance;
  constructor(instance: Instance, iterable: Iterable<CADActiveUnitStruct>, serverId: number) {
    super(instance, CADActiveUnit, iterable);
    this.instance = instance;
    this.serverId = serverId;
  }

  _add(data: any, cache = true) {
    return super._add(data, cache, data.id);
  }

  fetch(/*options: CADActiveUnitResolvable | CADActiveUnitFetchOptions**/) {
    // if (!options) return this._fetchMany();
    this._fetchSingle({
      unit: -1,
      includeOffline: false,
      force: false
    });
  }

  public async getActiveUnits(options: Partial<CADGetActiveUnitsStruct> = {}): Promise<globalTypes.CADStandardResponse> {
    if (!this.instance.cad) {
      throw new Error('CAD manager is not initialized.');
    }
    const payload: CADGetActiveUnitsStruct = {
      serverId: options.serverId ?? this.serverId,
      includeOffline: options.includeOffline ?? false,
      onlyUnits: options.onlyUnits,
      limit: options.limit,
      offset: options.offset
    };
    return this.instance.cad.getActiveUnits(payload);
  }

  async _fetchSingle({
    unit,
    includeOffline = false,
    force = false
  }:{
    unit: CADActiveUnitResolvable;
    includeOffline: boolean;
    force: boolean;
  }) {
    if (!force) {
      const existing = this.cache.get(unit);
      if (existing) return existing;
    }

    const result = await this.getActiveUnits({ includeOffline });
    console.log(result);
  }
}
