
import { ICollection, ICollectionItem } from './collections/collection';

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
  identityAttr: string;
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
  CollectionClass?: (new (collectionName: string, identityAttr: string) => ICollection<any>);
}


/** @internal */
export interface IResourceMetadata {
  options?: IResourceOptions;
  actions?: { [key: string]: IActionOptions };
  collection: ICollection<ICollectionItem>;
}

export function Resource(options: IResourceOptions): ClassDecorator {
  return (target: any) => {
    let metadata: IResourceMetadata = target.$$resource = target.$$resource || {}; // static property

    metadata.options = options;
    metadata.collection = target.prototype.$collection = new options.CollectionClass(options.collection, options.identityAttr);
  };
}
