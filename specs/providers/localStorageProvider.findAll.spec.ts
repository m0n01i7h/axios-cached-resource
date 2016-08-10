import { ICollectionItem } from '../../lib/collections/collection';
import { LocalStorageProvider } from '../../lib/collections/localStorageProvider';

interface ITestCollectionItem extends ICollectionItem {
  id?: any;
  data: string;
}

describe('LocalStorageProvider', () => {

  let collection = new LocalStorageProvider<ITestCollectionItem>('test', 'id');

  describe('#findAll', () => {

    beforeEach(() => {
      localStorage.clear();
    });

    it('sould fetch items by default query', (done) => {
      collection.save({
        id: '12',
        data: 'test data'
      })
        .then(res => collection.findAll())
        .then(res => {

          expect(res.length).toBe(1);

          done();
        })
        ;
    });

    it('sould fetch items by non-default query', (done) => {
      collection.saveAll([
        {
          data: 'data1'
        },
        {
          data: 'data2'
        }
      ], '?a')
        .then(res => collection.findAll('?a'))
        .then(res => {

          expect(res.length).toBe(2);

          done();
        })
        ;
    });

    it('sould fetch items saved by non-default query by default query', (done) => {
      collection.saveAll([
        {
          data: 'data1'
        },
        {
          data: 'data2'
        }
      ], '?a')
        .then(res => collection.findAll())
        .then(res => {

          expect(res.length).toBe(2);

          done();
        })
        ;
    });

    it('sould fetch empty collection by not indexed non-default query', (done) => {
      collection.saveAll([
        {
          data: 'data1'
        },
        {
          data: 'data2'
        }
      ], '?a')
        .then(res => collection.findAll('?b'))
        .then(res => {

          expect(res.length).toBe(0);

          done();
        })
        ;
    });

    it('sould fetch collection by predicate', (done) => {
      collection.saveAll([
        {
          data: 'data1'
        },
        {
          data: 'data2'
        },
        {
          data: 'pata1'
        },
        {
          data: 'pata1'
        }
      ])
        .then(res => collection.findAll(item => item.data.indexOf('data') === 0))
        .then(res => {

          expect(res.length).toBe(2);

          done();
        })
        ;
    });

  });

});
