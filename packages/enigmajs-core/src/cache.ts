/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from "axios";
import { get } from "lodash";

export const EG_CACHE_PROP = "__m2m_cache";

export interface EgCacheConfig {
  selfProp: string;
  idProp?: string;
  fkProp?: string;
  requestConfig?: AxiosRequestConfig;

  propCache?: "*" | string[];
  arrayCache: (EgCacheItemConfig | string)[];
}

export interface EgCacheItemConfig {
  prop: string;

  relationship?: "m2m" | "o2m";
  idProp?: string;
  fkProp?: string;

  proxyProp?: string;

  useMultipart?: boolean;
  paginated?: boolean;
  requestUrl?: string;
  requestConfig?: AxiosRequestConfig;

  entityProxy?: {
    [key: number]: string;
  };
}

export abstract class EgCache<T = any> {
  id: string;
  payload: T;
  readonly config: EgCacheItemConfig;

  constructor(id: string, payload: T, config: EgCacheItemConfig) {
    this.id = id;
    this.payload = payload;
    this.config = config;
  }

  public get hasPayloadId(): boolean {
    return (
      this instanceof IdleCache ||
      this instanceof UpdateCache ||
      this instanceof DeleteCache
    );
  }

  public toDelete(): EgCache<T> {
    if (this instanceof IdleCache) {
      return new DeleteCache(
        this.id,
        this.payload,
        this.payloadId,
        this.config
      );
    } else if (this instanceof UpdateCache) {
      return new DeleteCache(
        this.id,
        this.payload,
        this.payloadId,
        this.config
      );
    }

    return this;
  }

  public toIdle(): EgCache<T> {
    if (this.config.idProp) {
      const payloadId = get(this.payload, this.config.idProp);
      if (payloadId !== undefined) {
        return new IdleCache(this.id, this.payload, payloadId, this.config);
      }
    }

    if (this instanceof DeleteCache) {
      return new IdleCache(this.id, this.payload, this.payloadId, this.config);
    } else if (this instanceof UpdateCache) {
      return new IdleCache(this.id, this.payload, this.payloadId, this.config);
    }

    return this;
  }

  public toUpdate(): EgCache<T> {
    if (this instanceof IdleCache) {
      return new UpdateCache(
        this.id,
        this.payload,
        this.payloadId,
        this.config
      );
    }

    return this;
  }
}

export class ProxyCache<T = any> extends EgCache<T> {
  proxyProp: string;
  originalValue: unknown;

  constructor(
    id: string,
    payload: T,
    proxyProp: string,
    originalValue: unknown,
    config: EgCacheItemConfig
  ) {
    super(id, payload, config);
    this.proxyProp = proxyProp;
    this.originalValue = originalValue;
  }
}

export class CreateCache<T = any> extends EgCache<T> {
  constructor(id: string, payload: T, config: EgCacheItemConfig) {
    super(id, payload, config);
  }
}

export class IdleCache<T = any> extends EgCache<T> {
  payloadId: unknown;

  constructor(
    id: string,
    payload: T,
    payloadId: unknown,
    config: EgCacheItemConfig
  ) {
    super(id, payload, config);
    this.payloadId = payloadId;
  }
}

export class UpdateCache<T = any> extends EgCache<T> {
  payloadId: unknown;

  constructor(
    id: string,
    payload: T,
    payloadId: unknown,
    config: EgCacheItemConfig
  ) {
    super(id, payload, config);
    this.payloadId = payloadId;
  }
}

export class DeleteCache<T = any> extends EgCache<T> {
  payloadId: unknown;

  constructor(
    id: string,
    payload: T,
    payloadId: unknown,
    config: EgCacheItemConfig
  ) {
    super(id, payload, config);
    this.payloadId = payloadId;
  }
}
