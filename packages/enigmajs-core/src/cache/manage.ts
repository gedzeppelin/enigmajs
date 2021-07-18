/* eslint-disable @typescript-eslint/no-explicit-any */
import { customRef, reactive, Ref, ref, toRaw } from "vue";
import {
  isNil,
  get,
  set,
  isPlainObject,
  isEmpty,
  clone,
  cloneDeep,
} from "lodash";
import { v4 as uuidV4 } from "uuid";

import {
  CreateCache,
  DeleteCache,
  EG_CACHE_PROP,
  EgCache,
  EgCacheConfig,
  EgCacheItemConfig,
  IdleCache,
  ProxyCache,
  UpdateCache,
} from "./cache";

import { EgAxiosInstance, Response } from "../response";
import { multipartData, deepPurgeObject } from "../request";

export interface Target {
  [key: string]: string | boolean | number | Target[] | Target;
}

interface CachePayload {
  __m2m_cache?: EgCache;
  [key: string]: any;
}

function isCachePayload(value: CachePayload): value is Required<CachePayload> {
  return typeof value === "object" && value !== null && EG_CACHE_PROP in value;
}

interface CacheItemConfig extends EgCacheItemConfig {
  prop: string;

  relationship: "m2m" | "o2m";
  idProp: string;
  fkProp: string;

  paginated: boolean;
  requestUrl: string;

  extern: boolean;
  m2mPool?: any[];
}

/* export function injectProp(target: unknown, prop: string, val: unknown): void {
  if (typeof target === "object" && target !== null) {
    Object.defineProperty(target, prop, {
      configurable: false,
      writable: false,
      enumerable: false,
      value: val,
    });
  }
} */

export class EgCacheManager {
  private readonly axios: EgAxiosInstance;
  private readonly entityPk: unknown;

  // TODO use this shit
  // private propCache: "*" | string[];
  private target: Target = {};
  private cloned: Target | undefined;

  private cacheMap = new Map<string, EgCache>();
  private configMap = new Map<string, CacheItemConfig>();

  public get hasStarted(): boolean {
    return this.cloned !== undefined;
  }

  public get cachedProps(): string[] {
    return Array.from(this.configMap.keys());
  }

  constructor(
    axios: EgAxiosInstance,
    entityPk: unknown,

    config?: EgCacheConfig,
    requestUrl?: string
  ) {
    this.axios = axios;
    this.entityPk = entityPk;
    if (!isNil(config) && !isEmpty(config)) {
      this.setConfig(config, requestUrl);
      //this.propCache = config.propCache || "*";
    } else {
      //this.propCache = "*";
    }
  }

  public isCached(prop: string): boolean {
    return this.configMap.has(prop);
  }

  public transferRef(target: any[] | undefined, prop: string): Ref<any[]> {
    const initial = target ?? [];
    const propConfig = this.configMap.get(prop);

    if (propConfig) {
      propConfig.extern = true;
      for (const [id, { config }] of Array.from(this.cacheMap)) {
        if (config.prop === prop) {
          this.cacheMap.delete(id);
        }
      }
    }

    return this.cacheRef(initial, prop);
  }

  /**
   *
   */
  public addToCache(
    payload: unknown,
    config: CacheItemConfig,
    idx: number
  ): unknown {
    if (isNil(payload)) {
      return payload;
    }

    if (isPlainObject(payload)) {
      const cacheTarget = payload as CachePayload;

      if (cacheTarget.__m2m_cache) {
        const cache = cacheTarget.__m2m_cache;
        this.cacheMap.set(cache.id, cache);
      } else {
        const cacheId = uuidV4();
        const payloadId = get(cacheTarget, config.idProp);

        const cache = (() => {
          if (isNil(payloadId)) {
            set(cacheTarget, config.fkProp, this.entityPk);
            return new CreateCache(cacheId, cacheTarget, config);
          }
          return new IdleCache(cacheId, cacheTarget, payloadId, config);
        })();

        cacheTarget.__m2m_cache = cache;
        this.cacheMap.set(cacheId, cache);
      }
    } else if (config.proxyProp) {
      const cacheId = uuidV4();
      /* const originalValue = isPlainObject(payload)
        ? cloneDeep(payload)
        : payload;
      */

      if (config.entityProxy && idx in config.entityProxy) {
        const proxyProp = config.entityProxy[idx];

        const cachePayload: CachePayload = {};
        set(cachePayload, config.proxyProp, payload);

        const cache = new ProxyCache(
          cacheId,
          cachePayload,
          proxyProp,
          payload,
          config
        );

        cachePayload.__m2m_cache = cache;
        this.cacheMap.set(cacheId, cache);

        return cachePayload;
      } else {
        const cachePayload: CachePayload = {
          [config.fkProp]: this.entityPk,
        };
        set(cachePayload, config.proxyProp, payload);

        const cache = new CreateCache(cacheId, cachePayload, config);

        cachePayload.__m2m_cache = cache;
        this.cacheMap.set(cacheId, cache);

        return cachePayload;
      }
    }

    return payload;
  }

  /**
   *
   */
  public updateCache(payload: CachePayload): void {
    if (isNil(payload)) {
      return;
    }

    if (typeof payload === "object") {
      const cache = payload.__m2m_cache;

      if (isNil(cache)) {
        return;
      }

      const newCache = cache.toUpdate();
      payload.__m2m_cache = newCache;
      this.cacheMap.set(cache.id, newCache);
    }
  }

  /**
   *
   */
  public deleteFromCache(payload: unknown): void {
    if (typeof payload === "object" && payload !== null) {
      const cache = (payload as CachePayload).__m2m_cache;

      if (isNil(cache)) {
        return;
      }

      if (cache.hasPayloadId) {
        this.cacheMap.set(cache.id, cache.toDelete());
      } else {
        this.cacheMap.delete(cache.id);
      }
    }
  }

  /**
   * Proxies an array item to listen for updates.
   * 0800 00200
   *
   * @param item - the object to listen to.
   * @param conf - the cache configuration for `item`.
   */
  public cacheArrItem(item: unknown): any {
    if (typeof item === "object" && item !== null) {
      const target = toRaw(item);

      return new Proxy(target, {
        set: (obj, key, value, receiver) => {
          this.updateCache(obj);
          return Reflect.set(obj, key, value, receiver);
        },
      });
    }

    return item;
  }

  /**
   * Caches an array of a cached entity. An array is the only data structure that is supported by M2MCache class.
   * @param inputArr
   * @param config
   * @returns
   */
  public cacheArray(inputArr: CachePayload[], config: CacheItemConfig): any[] {
    const inputIds = new Set(
      inputArr
        .filter((value) => isCachePayload(value))
        .map((x) => x.__m2m_cache?.id)
    );

    for (const cache of Array.from(this.cacheMap.values())) {
      if (cache.config.prop !== config.prop || cache instanceof DeleteCache) {
        continue;
      }

      if (!inputIds.has(cache.id)) {
        if (cache.hasPayloadId) {
          this.cacheMap.set(cache.id, cache.toDelete());
        } else {
          this.cacheMap.delete(cache.id);
        }
      }
    }

    const target = toRaw(inputArr).map((payload, idx) => {
      const cached = this.addToCache(payload, config, idx);
      return this.cacheArrItem(cached);
    });

    // Splice proxy
    target.splice = new Proxy(target.splice, {
      apply: (target, thisArg, args) => {
        const spliced: any[] = Reflect.apply(target, thisArg, args);

        for (const deleted of spliced) {
          this.deleteFromCache(deleted);
        }

        return spliced;
      },
    });

    // Push proxy
    target.push = new Proxy(target.push, {
      apply: (target, thisArg, args) => {
        const pushed: number = Reflect.apply(target, thisArg, args);

        for (const added of args) {
          this.addToCache(added, config, 0);
        }

        return pushed;
      },
    });

    return new Proxy(target, {
      set: (obj, key, value, receiver) => {
        const val = !isNaN(Number(key)) ? this.cacheArrItem(value) : value;
        return Reflect.set(obj, key, val, receiver);
      },
    });
  }

  /**
   *
   * @param config
   * @param requestUrl
   */
  public setConfig(
    config: EgCacheConfig,
    requestUrl: string | undefined
  ): void {
    if (!Array.isArray(config.arrayCache)) {
      return;
    }

    for (const opt of config.arrayCache) {
      const _config = (() => {
        if (typeof opt === "string") {
          if (!requestUrl || !config.fkProp) {
            // eslint-disable-next-line prettier/prettier
            throw new Error(`(${opt}) No  request url or foreign key prop was provided`);
          }

          const result: CacheItemConfig = {
            prop: opt,
            relationship: "o2m",
            idProp: config.idProp ?? "id",
            fkProp: config.fkProp,
            paginated: true,
            requestUrl: `${requestUrl}_${opt}`,
            requestConfig: config.requestConfig,

            extern: false,
          };
          return result;
        }

        const fkProp = (() => {
          if (
            (!opt.requestUrl && !requestUrl) ||
            (!opt.fkProp && !config.fkProp)
          ) {
            // eslint-disable-next-line prettier/prettier
            throw new Error(`(${opt.prop}) No  request url or foreign key prop was provided`);
          }

          return (opt.fkProp ?? config.fkProp) as string;
        })();

        const result: CacheItemConfig = {
          prop: opt.prop,

          relationship: opt.relationship ?? "o2m",
          idProp: opt.idProp ?? config.idProp ?? "id",
          fkProp: fkProp,

          useMultipart: opt.useMultipart,
          paginated: opt.paginated ?? true,
          requestUrl: opt.requestUrl ?? `${requestUrl}_${opt.prop}`,
          requestConfig: opt.requestConfig ?? config.requestConfig,

          proxyProp: opt.proxyProp,
          entityProxy: opt.entityProxy,

          extern: false,
        };

        return result;
      })();

      if (_config.relationship === "m2m") {
        this.axios.buildResponse<any[]>({
          notify: false,
          paginated: _config.paginated,
          request: {
            method: "GET",
            url: _config.requestUrl,
            params: {
              page_size: 420,
              [_config.fkProp]: this.entityPk,
            },
          },
          ifOk: ({ payload }) => {
            const items = Array.isArray(payload) ? payload : payload.results;
            _config.m2mPool = items;
          },
        });
      }

      this.configMap.set(_config.prop, _config);
    }
  }

  /**
   *
   * @param target
   * @param prop
   * @returns
   */
  public cacheRef(target: any[] | undefined, prop: string): Ref<any[]> {
    const config = this.configMap.get(prop);
    const initial = toRaw(target) ?? [];

    if (!config) {
      return ref(initial);
    }

    let inner = this.cacheArray(initial, config);
    return customRef((track, trigger) => ({
      get: () => {
        track();
        return inner;
      },
      set: (newValue: any[]) => {
        inner = this.cacheArray(newValue, config);
        trigger();
      },
    }));
  }

  /**
   *
   * @param target
   * @param config
   * @param requestUrl
   * @returns
   */
  public cacheReactive(target: Target): Target {
    const rawTarget = toRaw(target);

    for (const [prop, config] of this.configMap) {
      const rawArr = get(rawTarget, prop);
      if (Array.isArray(rawArr)) {
        const cachedArr = this.cacheArray(rawArr, config);
        set(rawArr, prop, cachedArr);
      }
    }

    return reactive(
      new Proxy(rawTarget, {
        set: (obj, key, value, receiver) => {
          // this.hasStarted
          if (this.cloned !== undefined && typeof key === "string") {
            const config = this.configMap.get(key);

            if (config && !config.extern && Array.isArray(value)) {
              const cached = this.cacheArray(value, config);
              return Reflect.set(obj, key, cached, receiver);
            } else if (value !== this.cloned[key]) {
              this.target[key] = value;
            } else if (key in this.target) {
              delete this.target[key];
            }
          }

          return Reflect.set(obj, key, value, receiver);
        },
      })
    );
  }

  /**
   *
   */
  public cacheEntity(
    entity: Target,
    config: EgCacheConfig,
    requestUrl: string | undefined
  ): Target {
    this.setConfig(config, requestUrl);
    return this.cacheReactive(entity);
  }

  /**
   *
   * @param entity
   * @returns
   */
  public start(entity: Record<string, unknown>): void {
    const target = toRaw(entity);
    this.cloned = clone(target) as Target;
  }

  /**
   *
   * @param axios
   * @returns
   */
  public makePromise(): [Target, Promise<Response>[]] {
    const target = cloneDeep(this.target);
    const promises: Promise<Response>[] = [];

    this.cacheMap.forEach((cache) => {
      const config = cache.config;

      const [reqData, headers] = (() => {
        if (config.useMultipart) {
          const form = multipartData(cache.payload);
          return [form, { "Content-Type": "multipart/form-data" }];
        }

        const purged = deepPurgeObject(cache.payload);
        return [purged, { "Content-Type": "application/json" }];
      })();

      if (cache instanceof ProxyCache) {
        const current = get(cache.payload, cache.proxyProp);

        if (cache.originalValue === current) {
          if (cache.proxyProp in target) {
            delete target[cache.proxyProp];
          }
        } else {
          set(target, cache.proxyProp, current);
        }
      } else if (cache instanceof CreateCache) {
        promises.push(
          this.axios.buildResponse({
            notify: false,
            request: {
              method: "POST",
              url: `${config.requestUrl}/`,
              data: reqData,
              headers: headers,
            },
            ifOk: ({ payload }) => {
              Object.assign(cache.payload, payload);
              this.cacheMap.set(cache.id, cache.toIdle());
            },
          })
        );
      } else if (cache instanceof UpdateCache) {
        promises.push(
          this.axios.getResponse({
            method: "PATCH",
            url: `${config.requestUrl}/${cache.payloadId}/`,
            data: reqData,
            headers: headers,
          })
        );
      } else if (cache instanceof DeleteCache) {
        promises.push(
          this.axios.buildResponse({
            notify: false,
            request: {
              method: "DELETE",
              url: `${config.requestUrl}/${cache.payloadId}/`,
            },
            ifOk: () => {
              this.cacheMap.delete(cache.id);
            },
          })
        );
      }

      if (config.prop in target) {
        delete target[config.prop];
      }
    });

    return [target, promises];
  }
}
