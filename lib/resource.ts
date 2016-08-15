import * as _ from 'lodash';

import { ICollection, ICollectionItem } from './collections/collection';

export interface IActionOptions<T> {
  /**
   * HTTP method
   */
  method?: 'get' | 'post' | 'put' | 'delete';

  /**
   * Url
   */
  url?: string;

  /**
   * Is Response contain array of resources
   */
  isArray?: boolean;

  /**
   * Should query skip http request
   */
  localOnly?: boolean;

  /**
   * Should query skip local storing of data
   */
  httpOnly?: boolean;

  /**
   * Override axios config
   */
  config?: Axios.AxiosXHRConfigBase<T>;
}

export interface IResource<T> {
  $resource?: any;
  $pending?: 'get' | 'post' | 'put' | 'delete';
  $promise?: Axios.IPromise<T>;
  $httpPromise?: Axios.IPromise<T>;
}

interface IResourceInstance<T> extends IResource<T>, ICollectionItem { }

interface IResourceCollection<T> extends IResource<T[]>, Array<T> { }

export interface IResourceOptions<T> {

  /**
   * Url to resource
   */
  url: string;

  /**
   * Actions
   */
  actions?: { [key: string]: IActionOptions<T> };

  /**
   * Identity attribute
   */
  identityAttr: string;

  /**
   * Name of collection
   */
  collectionName: string;

  /**
   * Override axios config
   */
  config?: Axios.AxiosXHRConfigBase<T>;

  /**
   * Driver for saving cached resource locally.
   */
  CollectionClass?: (new (collectionName: string, identityAttr: string) => ICollection<T>);
}

function createResourceGetAction<T>(resource: IResourceOptions<T>, action: IActionOptions<T>): Function {
  return (params: {}, config: Axios.AxiosXHRConfigBase<any> = {}) => {

    const instance: IResourceInstance<T> | IResourceCollection<T> = action.isArray ? [] : {};

    if (!action.httpOnly) {

    }

    if (!action.localOnly) {

    }

    return instance;
  };
}

function createInstanceGetAction(): Function {
  return () => {};
}


export function Resource<T extends {}>(options: IResourceOptions<T>): Function {

  function Resource(obj: T) {
    _.assign(this, obj);
  };

  _(options.actions).each((action: IActionOptions<T>, name: string) => {

    Resource[name] = {
      get: createResourceGetAction,
      post: createResourceGetAction,
      put: createResourceGetAction,
      delete: createResourceGetAction
    }[action.method.toLowerCase()](options, action);

    Resource.prototype[`$${name}`] = {
      get: createInstanceGetAction,
      post: createInstanceGetAction,
      put: createInstanceGetAction,
      delete: createInstanceGetAction
    }[action.method.toLowerCase()](options, action);
  });

  return Resource;
}
