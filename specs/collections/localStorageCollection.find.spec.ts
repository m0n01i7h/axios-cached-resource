import { ICollectionItem } from '../../lib/collections/collection';
import { LocalStorageCollection } from '../../lib/collections/localStorageCollection';

interface ITestCollectionItem extends ICollectionItem {
  id?: any;
  data: string;
}

describe('LocalStorageCollection', () => {

  let collection = new LocalStorageCollection<ITestCollectionItem>('test', 'id');

  describe('#find', () => {

    beforeEach(() => {
      localStorage.clear();
    });

    it('sould find by identity attr', (done) => {
      collection.save({
        id: '12',
        data: 'test data'
      })
        .then(res => collection.find('12'))
        .then(res => {

          expect(res.id).toBe('12');
          expect(res.data).toBe('test data');

          done();
        })
        ;
    });

    it('sould find by $id', (done) => {
      collection.save({
        data: 'test data'
      })
        .then(res => collection.find(res.$id))
        .then(res => {

          expect(res.$id).toBeDefined();
          expect(res.data).toBe('test data');

          done();
        })
        ;
    });

  });

});
