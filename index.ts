export * from './lib/resource';
export * from './lib/action';

import { IResource, Resource } from './lib/resource';
import { Get, Post, Put, Delete } from './lib/action';

interface IBook extends IResource<IBook> {
  id: any;
}

interface IBooks extends Array<IBook>, IResource<IBooks> {

}

@Resource({
  url: '/api/books(/:_id)',
  identityAttr: '_id',
  collectionName: 'books',
  actions: {
    get: { method: 'get' },
    fromCache: { method: 'get', localOnly: true }
  }
})
class BooksResource { }

interface IUser {
  uuid: any;
  firstName: string;
  lastName: string;
}

@Resource({
  url: '/api/user',
  identityAttr: 'uuid',
  collectionName: 'userProfile',
  actions: {
    get: { method: 'get' },
    fromCache: { method: 'get', localOnly: true },
    save: { method: 'put' },
  }
})
class UserProfile { }
