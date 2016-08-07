
import { Collection, ICollectionItem } from './collections/collection';

import { IActionOptions } from './action';

export interface IResource<T> {
  $resource?: any;
  $pending?: 'find' | 'save' | 'update' | 'remove';
  $promise?: Axios.IPromise<T>;
  $httpPromise?: Axios.IPromise<T>;
}

export interface IResourceOptions {
  /**
   * Url to resource
   */
  url: string;
  /**
   * Identity attribute
   */
  identity: string;
  /**
   * Name of collection
   */
  collection: string;
  /**
   * Override axios base url
   */
  baseUrl?: string;

  /**
   * Driver for saving cached resource locally.
   */
  CollectionClass?: (new (collection: string, identity: string) => Collection<any>);
}


/** @internal */
export interface IResourceMetadata {
  options?: IResourceOptions;
  actions?: { [key: string]: IActionOptions };
  collection: Collection<ICollectionItem>;
}

export function Resource(options: IResourceOptions): ClassDecorator {
  return (target: any) => {
    let metadata: IResourceMetadata
      = target.__resource__ = target.__resource__ || {};
    metadata.options = options;
    metadata.collection = new options.CollectionClass(options.collection, options.identity);
  };
}
