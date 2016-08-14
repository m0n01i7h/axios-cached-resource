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

class Request {
  constructor(
    private options: IActionOptions,
    private resource: IResourceMetadata,
    private actionName: string
  ) { }

  public invoke(request: Axios.AxiosXHRConfig<{}>) {

  }

  private get(request: Axios.AxiosXHRConfig<{}>) {

  }

  private post(request: Axios.AxiosXHRConfig<{}>) {

  }

  private put(request: Axios.AxiosXHRConfig<{}>) {

  }

  private delete(request: Axios.AxiosXHRConfig<{}>) {

  }
}

export function Action(options: IActionOptions): PropertyDecorator {

  if (!options.method) {
    throw `options.method missed`;
  }

  return (target: any, key: string) => {
    const metadata: IResourceMetadata = target.constructor.$$resource = target.constructor.$$resource || {}; // static property

    metadata.actions = metadata.actions || {};
    metadata.actions[key] = options;

    target[key] = (request: Axios.AxiosXHRConfig<{}> = {
      url: options.url || metadata.options.url,
    }): IResourceCollection | IResourceCollectionItem => {

      const defaults: Axios.AxiosXHRConfig<{}> = {
        url: options.url || metadata.options.url,
        params: {}
      };

      request = _.defaults(request, defaults) as Axios.AxiosXHRConfig<{}>;

      const resource: IResourceCollection | IResourceCollectionItem = options.isArray ? [] : {};
      const route = new Route(request.url);
      const url = route.reverse(request.params);

      request = _.assign(request, {
        method: options.method,
        url: url,
        // pass all params not passed to url as query string
        params: _({})
          .assign(request.params)
          .omit(_.keys(route.match(url)))
          .value()
      }) as Axios.AxiosXHRConfig<{}>;

      resource.$resource = this;

      if (options.method === 'get') {
        resource.$pending = 'find';

        if (!options.httpOnly) {
          resource.$promise = options.isArray

            ? metadata.collection
              .findAll(`${qs.stringify(request.params, { encode: false })}`)
              .then(items => {
                if (!resource.$pending) { return; }
                _.pullAll(resource as [], items);
                return resource;
              })

            : metadata.collection
              .find(request.params[metadata.options.identityAttr])
              .then(item => {
                if (!resource.$pending) { return; }
                _.assign(resource, item);
                return resource;
              });
        }

        if (!options.localOnly) {
          resource.$httpPromise = options.isArray

            ? axios.request<{}[]>(request as Axios.AxiosXHRConfig<{}[]>)
              .then(res => {
                return res.data;
              })

            : axios.request<{}>(request as Axios.AxiosXHRConfig<{}>)
              .then(res => {
                return res.data;
              });
        }

        return resource;
      }

      if (options.method === 'post') {
        resource.$pending = 'save';

        return resource;
      }

      if (options.method === 'put') {
        resource.$pending = 'update';

        return resource;
      }

      if (options.method === 'delete') {
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

/**
 * Removes all localOnly and metadata values
 */
function omitMetaData(resource: {}) {
  return _({})
    .assign(resource)
    .omit(_.keys(resource).filter(key => _(key).startsWith('$')))
    .value();
}
