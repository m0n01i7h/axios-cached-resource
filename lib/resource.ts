import * as axios from 'axios';
import * as _ from 'lodash';
import * as qs from 'qs';
import * as Route from 'route-parser';

import { Collection, ICollectionItem } from './collections/collection';
import { LocalStorageCollection } from './collections/localStorageCollection';


export interface IResource<T> {
  $resource?: any;
  $promise?: Axios.IPromise<T>;
  $httpPromise?: Axios.IPromise<T>;
}

export interface IActionOptions {
  /**
   * HTTP method
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'get' | 'post' | 'put' | 'delete';

  /**
   * Url
   */
  url?: string;

  /**
   * Is Response contain array of resources
   */
  isCollection?: boolean;

  /**
   * Use identity value from params
   */
  setIdentityFromParams?: boolean;

  /**
   * Should query skip http request
   */
  localOnly?: boolean;

  /**
   * Should query skip local storing of data
   */
  httpOnly?: boolean;
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

interface IResourceCollectionItem extends IResource<{}>, ICollectionItem { }

interface IResourceCollection extends IResource<{}[]>, Array<{}> { }

export function Resource(options: IResourceOptions): ClassDecorator {
  return (target: any) => {
    let metadata: IResourceMetadata
      = target.__resource__ = target.__resource__ || {};
    metadata.options = options;
    metadata.collection = new options.CollectionClass(options.collection, options.identity);
  };
}

export function Action(options: IActionOptions): PropertyDecorator {

  if (!options.method) {
    throw `options.method missing`;
  }

  return (target: any, key: string) => {
    let metadata: IResourceMetadata
      = target.constructor.__resource__ = target.constructor.__resource__ || {};

    metadata.actions = metadata.actions || {};
    metadata.actions[key] = options;

    target[key] = (params: {}, data: {}, config: Axios.AxiosXHRConfig<{}> = {
      url: metadata.options.url,
      baseURL: metadata.options.baseUrl
    }): IResourceCollection | IResourceCollectionItem => {

      if (/^get$/i.test(options.method) && options.isCollection) {
        let resource: IResourceCollection = [];

        resource.$resource = this;

        if (!options.httpOnly) {
          resource.$promise = metadata.collection
            .findAll(qs.stringify(params, { encode: false }))
            .then(items => {
              items.forEach(item => item.$pending = 'find');
              resource.push(...items);
              return items;
            });
        }

        if (!options.localOnly) {
          resource.$httpPromise = axios.request(_.assign({}, config, {
            method: options.method,
            url: new Route(options.url).reverse(params),
          }) as Axios.AxiosXHRConfig<{}[]>)
            .then(res => {
              _.assign(resource, res.data);
              return resource;
            });
        }

        return resource;
      }

      if (/^get$/i.test(options.method)) {
        let resource: IResourceCollectionItem = {};

        resource.$resource = this;
        resource.$pending = 'find';

        resource.$promise = metadata.collection
          .find(params[metadata.options.identity])
          .then(item => {
            // avoid overwriting with local data
            if (resource.$pending) {
              _.assign(resource, item);
            }
            return resource;
          });

        resource.$httpPromise = axios.request(_.assign({}, config, {
          method: options.method,
          url: new Route(options.url).reverse(params),
        }) as Axios.AxiosXHRConfig<{}[]>)
          .then(res => metadata.collection.save(res.data))
          .then(res => {
            _.assign(resource, res);
            delete resource.$pending;
            return resource;
          });

        return resource;
      }

      if (/^post$/i.test(options.method)) {
        let resource: IResourceCollectionItem = {};

        resource.$resource = this;
        resource.$pending = 'find';

        return resource;
      }

      if (/^put$/i.test(options.method)) {
        let resource: IResourceCollectionItem = {};

        resource.$resource = this;
        resource.$pending = 'find';

        return resource;
      }

      if (/^delete$/i.test(options.method)) {
        let resource: IResourceCollectionItem = {};

        resource.$resource = this;
        resource.$pending = 'find';

        return resource;
      }

    };
  };
}

export function Get(options: IActionOptions): PropertyDecorator {
  options.method = 'get';
  return Action(options);
}

export function Post(options: IActionOptions): PropertyDecorator {
  options.method = 'post';
  return Action(options);
}

export function Put(options: IActionOptions): PropertyDecorator {
  options.method = 'put';
  return Action(options);
}

export function Delete(options: IActionOptions): PropertyDecorator {
  options.method = 'delete';
  return Action(options);
}


interface IBook extends IResource<IBook> {
  id: any;
}

interface IBooks extends Array<IBook>, IResource<IBooks> {

}

@Resource({
  url: '/api/books(/:_id)',
  identity: '_id',
  collection: 'alerts'
})
class BooksResource {

  @Get({ method: 'get', isCollection: true })
  public query: () => IResource<IBook[]>;

  @Post({ method: 'get' })
  public get: (params: { _id: any }) => IResource<IBook>;

  @Put({ method: 'post' })
  public save: (params: {}, alert: IBook) => IResource<IBook>;

  @Delete({ method: 'post' })
  public update: (params: { _id: any }, alert: IBook) => IResource<IBook>;
}

