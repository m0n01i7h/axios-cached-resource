import { ICollectionItem } from '../../lib/collections/collection';
import { LocalStorageProvider } from '../../lib/collections/localStorageProvider';

interface ITestCollectionItem extends ICollectionItem {
  id?: any;
  data: string;
}

describe('LocalStorageProvider', () => {

  let collection = new LocalStorageProvider<ITestCollectionItem>('test', 'id');

  describe('#remove', () => {

    beforeEach(() => {
      localStorage.clear();
    });

    it('should remove object from items by identity attr', (done) => {
      collection.save({
        id: '12',
        data: 'data12'
      })
        .then(() => collection.save({
          data: 'data13'
        }))
        .then(() => collection.remove('12'))
        .then(() => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(1);
          done();
        });
    });

    it('should remove object from items by $id', (done) => {
      collection.save({
        id: '12',
        data: 'data12'
      })
        .then(() => collection.save({
          data: 'data13'
        }))
        .then(item => collection.remove(item.$id))
        .then(() => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(1);
          done();
        });
    });

    it('should remove object from default index by identity attr', (done) => {
      collection.save({
        id: '12',
        data: 'data12'
      })
        .then(() => collection.save({
          data: 'data13'
        }))
        .then(() => collection.remove('12'))
        .then(() => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(1);
          done();
        });
    });

    it('should remove object from default index by $id', (done) => {
      collection.save({
        id: '12',
        data: 'data12'
      })
        .then(() => collection.save({
          data: 'data13'
        }))
        .then(item => collection.remove(item.$id))
        .then(() => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(1);
          done();
        });
    });

    it('should remove object from non-default index by identity attr', (done) => {
      collection.saveAll([
        {
          id: '12',
          data: 'data12'
        },
        {
          id: '13',
          data: 'data13'
        }], '?a')
        .then(res => collection.remove('12'))
        .then(() => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?a'];

          expect(lsIndex.length).toBe(1);
          done();
        });
    });

    it('should remove object from non-default index by $id', (done) => {
      collection.saveAll([
        {
          data: 'data12'
        },
        {
          data: 'data13'
        }], '?a')
        .then(res => collection.remove(res[0].$id))
        .then(() => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?a'];

          expect(lsIndex.length).toBe(1);
          done();
        });
    });

    it('should remove empty non-default index', (done) => {
      collection.saveAll([
        {
          data: 'data13'
        }], '?a')
        .then(res => collection.remove(res[0].$id))
        .then(() => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?a'];

          expect(lsIndex).toBeUndefined();
          done();
        });
    });

    it('should remove all from items if no params passed', (done) => {
      collection.saveAll([
        {
          data: 'data1'
        },
        {
          data: 'data2'
        },
        {
          data: 'data2'
        }])
        .then(res => collection.remove())
        .then(() => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(0);
          done();
        });
    });

    it('should remove all from default index if no params passed', (done) => {
      collection.saveAll([
        {
          data: 'data1'
        },
        {
          data: 'data2'
        },
        {
          data: 'data2'
        }])
        .then(res => collection.remove())
        .then(() => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(0);
          done();
        });
    });

  });

});
