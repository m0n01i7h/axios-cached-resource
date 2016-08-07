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
  identity: '_id',
  collection: 'books'
})
class BooksResource {

  @Get({ isCollection: true })
  public query: () => IResource<IBook[]>;

  @Get()
  public get: (params: { bookId: any }) => IResource<IBook>;

  @Post()
  public save: (params: {}, data: IBook) => IResource<IBook>;

  @Put()
  public $update: (params: {}, data: IBook) => IResource<IBook>;

  @Delete()
  public remove: (params: { bookId: any }, data: IBook) => IResource<IBook>;

  @Get({
    url: '/api/books/:bookId/pages/:pageNo'
  })
  public $page: (params: { bookId: any, pageNo: number }) => IResource<{}>;
}
