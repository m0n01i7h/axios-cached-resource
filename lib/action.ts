import * as axios from 'axios';
import * as _ from 'lodash';
import * as qs from 'qs';
import * as Route from 'route-parser';

import { Collection, ICollectionItem } from './collections/collection';
import { IResourceMetadata, IResource } from './resource';

interface IResourceCollectionItem extends IResource<{}>, ICollectionItem { }

interface IResourceCollection extends IResource<{}[]>, Array<{}> { }

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

export function Action(options: IActionOptions): PropertyDecorator {

  if (!options.method) {
    throw `options.method missing`;
  }

  return (target: any, key: string) => {
    const metadata: IResourceMetadata
      = target.constructor.__resource__ = target.constructor.__resource__ || {};

    metadata.actions = metadata.actions || {};
    metadata.actions[key] = options;

    target[key] = (params: {}, data: {}, config: Axios.AxiosXHRConfig<{}> = {
      url: metadata.options.url,
      baseURL: metadata.options.baseUrl
    }): IResourceCollection | IResourceCollectionItem => {

      const resource: IResourceCollection | IResourceCollectionItem = options.isCollection ? [] : {};
      const route = new Route(options.url);
      const url = route.reverse(params);
      const request = _.assign({}, config, {
        method: options.method,
        url: url,
        params: _({})
          .assign(params)
          .omit(_.keys(route.match(url)))
          .value() // without values passed as url params
      } as Axios.AxiosXHRConfig<{}>);

      if (/^get$/i.test(options.method) && options.isCollection) {

        resource.$resource = this;
        resource.$pending = 'find';

        resource.$promise = metadata.collection.findAll(`?${qs.stringify(params)}`)
          .then(items => {
            return items;
          });

        resource.$httpPromise = axios.request(request as Axios.AxiosXHRConfig<{}[]>)
          .then(res => metadata.collection.saveAll(res.data, `?${qs.stringify(params)}`))
          .then(items => {
            delete resource.$pending;
            return resource;
          });

        return resource;
      }

      if (/^get$/i.test(options.method)) {

        resource.$resource = this;
        resource.$pending = 'find';

        resource.$promise = metadata.collection.find(params[metadata.options.identity] || params['$id'])
          .then(item => {
            // avoid overwriting with local data
            if (resource.$pending) {
              _.assign(resource, item);
            }
            return resource;
          });

        resource.$httpPromise = axios.request(request as Axios.AxiosXHRConfig<{}>)
          .then(res => metadata.collection.save(res.data))
          .then(item => {
            delete resource.$pending;
            return resource;
          });

        return resource;
      }

      if (/^post$/i.test(options.method)) {
        resource.$resource = this;
        resource.$pending = 'save';

        return resource;
      }

      if (/^put$/i.test(options.method)) {
        resource.$resource = this;
        resource.$pending = 'update';

        return resource;
      }

      if (/^delete$/i.test(options.method)) {
        resource.$resource = this;
        resource.$pending = 'remove';

        return resource;
      }

    };
  };
}

export function Get(options: IActionOptions = {}): PropertyDecorator {
  options.method = 'get';
  return Action(options);
}

export function Post(options: IActionOptions = {}): PropertyDecorator {
  options.method = 'post';
  return Action(options);
}

export function Put(options: IActionOptions = {}): PropertyDecorator {
  options.method = 'put';
  return Action(options);
}

export function Delete(options: IActionOptions = {}): PropertyDecorator {
  options.method = 'delete';
  return Action(options);
}
