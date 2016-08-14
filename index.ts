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
  url: '/api/books(/:bookId)',
  identityAttr: '_id',
  collection: 'books'
})
class BooksResource {

  @Get({ isArray: true })
  public query: () => IResource<IBook[]>;

  @Get()
  public get: (params: { bookId: any }) => IResource<IBook>;

  @Post()
  public save: (book: IBook) => IResource<IBook>;

  @Put()
  public update: (book: IBook) => IResource<IBook>;

  @Delete()
  public remove: (params: { bookId: any }) => IResource<void>;

  @Get({
    url: '/api/books/:bookId/pages/:pageNo'
  })
  public $page: (params: { bookId: any, pageNo: number }) => IResource<{}>;
}

interface IUser {
  uuid: any;
  firstName: string;
  lastName: string;
}

@Resource({
  url: '/api/user',
  identityAttr: 'uuid',
  collection: 'userProfile'
})
class UserProfile {

  @Get()
  public get: () => IResource<IUser>;

  @Put()
  public save: (user: IUser) => IResource<IBook>;

}
