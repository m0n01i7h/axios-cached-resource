export interface ICollectionItem {
  $id?: any;
}

export abstract class Collection<T extends ICollectionItem> {

  constructor(
    protected collection: string,
    protected identity: string
  ) {
  }

  /**
   * Fetch multiple resources by query string
   */
  public abstract findAll(query?: string | ((item: T) => boolean)): Promise<T[]>;

  /**
   * Fetch single resource by identity
   */
  public abstract find(identity: any): Promise<T>;

  /**
   * Save or update resource
   */
  public abstract save(resource: T): Promise<T>;

  /**
   * Save or update multiple resources
   */
  public abstract saveAll(resources: T[], query?: string): Promise<T[]>;

  /**
   * Remove single resource by identity
   */
  public abstract remove(identity: any): Promise<void>;
}

