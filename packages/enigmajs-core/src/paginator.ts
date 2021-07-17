// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IPaginator<T = any> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Paginator<T = any> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];

  constructor(obj?: IPaginator<T>) {
    this.count = obj?.count ?? 0;
    this.next = obj?.next ?? null;
    this.previous = obj?.previous ?? null;
    this.results = obj?.results ?? [];
  }

  public get pageSize(): number {
    return this.results.length;
  }

  public get hasPrevious(): boolean {
    return this.previous !== null && this.previous.trim() !== "";
  }

  public get hasNext(): boolean {
    return this.next !== null && this.next.trim() !== "";
  }

  public get isEmpty(): boolean {
    return this.results.length === 0;
  }

  public get isNotEmpty(): boolean {
    return this.results.length > 0;
  }
}
