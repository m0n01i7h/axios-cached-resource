import { ICollectionItem } from '../../lib/collections/collection';
import { LocalStorageProvider } from '../../lib/collections/localStorageProvider';

interface ITestCollectionItem extends ICollectionItem {
  id?: any;
  data: string;
}

describe('LocalStorageProvider', () => {

  let collection = new LocalStorageProvider<ITestCollectionItem>('test', 'id');

  describe('#saveAll', () => {

    let resource: ITestCollectionItem;

    beforeEach(() => {
      localStorage.clear();
      resource = {
        data: 'some test data'
      };
    });

    it('should add 1 object in items', (done) => {

      let items: ITestCollectionItem[] = [{
        data: 'data1',
      }];

      collection.saveAll(items)
        .then(res => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(1);

          done();
        });
    });

    it('should add 1 object in index', (done) => {

      let items: ITestCollectionItem[] = [{
        data: 'data1',
      }];

      collection.saveAll(items)
        .then(res => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(1);

          done();
        });
    });

    it('should add multiple objects in items', (done) => {

      let items: ITestCollectionItem[] = [
        { data: 'data1', },
        { data: 'data2', }
      ];

      collection.saveAll(items)
        .then(res => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(2);

          done();
        });
    });

    it('should add multiple objects in index', (done) => {

      let items: ITestCollectionItem[] = [
        { data: 'data1', },
        { data: 'data2', }
      ];

      collection.saveAll(items)
        .then(res => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(2);

          done();
        });
    });

    it('should remove 1 object in items', (done) => {

      collection.saveAll([
        { data: 'data1', },
        { data: 'data2', },
        { data: 'data3', },
      ])
        .then(items => {
          items.splice(1, 1);
          return collection.saveAll(items);
        })
        .then(res => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(2);

          done();
        });
    });

    it('should remove 1 object in index', (done) => {

      collection.saveAll([
        { data: 'data1', },
        { data: 'data2', },
        { data: 'data3', },
      ])
        .then(items => {
          items.splice(1, 1);
          return collection.saveAll(items);
        })
        .then(res => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(2);

          done();
        });
    });

    it('should overwrite 1 object in items', (done) => {

      collection.saveAll([{ data: 'data1', }])
        .then(items => {
          items[0].data = 'data2';
          return collection.saveAll(items);
        })
        .then(res => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(1);

          done();
        });
    });

    it('should overwrite 1 object in index', (done) => {

      collection.saveAll([{ data: 'data1', }])
        .then(() => collection.saveAll([{ data: 'data2', }]))
        .then(res => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(1);

          done();
        });
    });

    it('should add 1 object to items with non-default query', (done) => {
      collection.saveAll([{ data: 'data1', }], '?a')
        .then(items => {
          items[0].data = 'data2';
          return collection.saveAll(items);
        })
        .then(res => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(1);

          done();
        });
    });

    it('should add 1 object to index with non-default query', (done) => {
      collection.saveAll([{ data: 'data1', }], '?a')
        .then(items => {
          items[0].data = 'data2';
          return collection.saveAll(items);
        })
        .then(res => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?a'];

          expect(lsIndex.length).toBe(1);

          done();
        });
    });

    it('should add 1 object to default index with non-default query', (done) => {
      collection.saveAll([{ data: 'data1', }], '?a')
        .then(items => {
          items[0].data = 'data2';
          return collection.saveAll(items);
        })
        .then(res => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(1);

          done();
        });
    });

    it('should add object to default index while saving to multiple non-default indexes', (done) => {
      collection.saveAll([{ data: 'dataA', }], '?a')
        .then(items => collection.saveAll([{ data: 'dataB', }], '?b'))
        .then(res => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];
          let lsIndexA: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?a'];
          let lsIndexB: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?b'];

          expect(lsIndex.length).toBe(2);
          expect(lsIndexA.length).toBe(1);
          expect(lsIndexB.length).toBe(1);

          done();
        });
    });

    it('should add object to items while saving to multiple non-default indexes', (done) => {
      collection.saveAll([{ data: 'dataA', }], '?a')
        .then(items => collection.saveAll([{ data: 'dataB', }], '?b'))
        .then(res => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(2);

          done();
        });
    });

    it('should remove object from default index while saving empty collection to non-default query', (done) => {
      collection.saveAll([{ data: 'dataA', }], '?a')
        .then(items => collection.saveAll([], '?a'))
        .then(res => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(0);

          done();
        });
    });

    it('should remove non-default index while saving empty collection to non-default query', (done) => {
      collection.saveAll([{ data: 'dataA', }], '?a')
        .then(items => collection.saveAll([], '?a'))
        .then(res => {
          let lsIndexA: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?a'];

          expect(lsIndexA).toBeUndefined();

          done();
        });
    });

  });

});
