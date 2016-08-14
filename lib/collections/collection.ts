export interface ICollectionItem {
  $id?: any;
}

export interface ICollection<T extends ICollectionItem> {

  find(): Promise<T>;
  find(identity: any): Promise<T>;

  findAll(): Promise<T[]>;
  findAll(query: string): Promise<T[]>;
  findAll(predicate: (item: T) => boolean): Promise<T[]>;

  save(item: T): Promise<T>;

  saveAll(items: T[]): Promise<T[]>;
  saveAll(items: T[], index: string): Promise<T[]>;

  remove(): Promise<void>;
  remove(identity: any): Promise<void>;
}

export abstract class Collection<T extends ICollectionItem> {
  constructor(
    protected collectionName: string,
    protected identityAttr: string
  ) { }
}

