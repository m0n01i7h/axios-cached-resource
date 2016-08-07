import { ICollectionItem } from '../../lib/collections/collection';
import { LocalStorageProvider } from '../../lib/collections/localStorageProvider';

interface ITestCollectionItem extends ICollectionItem {
  id?: any;
  data: string;
}

describe('LocalStorageProvider', () => {

  let collection = new LocalStorageProvider<ITestCollectionItem>('test', 'id');

  describe('#save', () => {

    let resource: ITestCollectionItem;

    beforeEach(() => {
      localStorage.clear();
      resource = {
        data: 'some test data'
      };
    });

    it('should save 1 object in items', (done) => {
      collection.save(resource)
        .then(res => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(1);

          done();
        });
    });

    it('should save 1 object in index', (done) => {
      collection.save(resource)
        .then(res => {
          let lsIndex: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(1);

          done();
        });
    });

    it('should save multiple objects in items', (done) => {
      Promise.all([
        collection.save({ data: 'data1' }),
        collection.save({ data: 'data2' })
      ])
        .then(res => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(2);

          done();
        });
    });

    it('should save multiple objects in index', (done) => {
      Promise.all([
        collection.save({ data: 'data1' }),
        collection.save({ data: 'data2' })
      ])
        .then(res => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(2);

          done();
        });
    });

    it('should mutate object passed as parameter', (done) => {
      collection.save(resource)
        .then(res => {

          expect(res).toBe(resource);

          done();
        });
    });

    it('should save $id for item w/o identity attr', (done) => {
      collection.save(resource)
        .then(res => {

          expect(res.$id).toBeDefined();
          expect(res.data).toBe(resource.data);

          done();
        });
    });

    it('should not save $id for item w/ identity attr', (done) => {
      resource.id = '12';
      collection.save(resource)
        .then(res => {

          expect(res.$id).toBeDefined();
          expect(res.id).toBe('12');
          expect(res.data).toBe(resource.data);

          done();
        });
    });

    it('should overwrite updated object in items', (done) => {
      collection.save(resource)
        .then(res => {
          res.data = 'new data';
          return collection.save(res);
        })
        .then(res => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(1);

          done();
        });
    });

    it('should overwrite updated object in index', (done) => {
      collection.save(resource)
        .then(res => {
          res.data = 'new data';
          return collection.save(res);
        })
        .then(res => collection.find(resource.$id))
        .then(res => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(1);

          done();
        });
    });

    it('should overwrite temp object after passing identity attr in items', (done) => {
      collection.save(resource)
        .then(res => {
          res.id = '12';
          return collection.save(res);
        })
        .then(res => {
          let lsItems: ITestCollectionItem[] = JSON.parse(localStorage[`resource.${'test'}.items`]);

          expect(lsItems.length).toBe(1);

          done();
        });
    });

    it('should overwrite temp object after passing identity attr in index', (done) => {
      collection.save(resource)
        .then(res => {
          res.id = '12';
          return collection.save(res);
        })
        .then(res => {
          let lsIndex: any[] = JSON.parse(localStorage[`resource.${'test'}.index`])['?'];

          expect(lsIndex.length).toBe(1);

          done();
        });
    });

    it('should remove $id attr after passing identity attr', (done) => {
      collection.save(resource)
        .then(res => {

          expect(res.$id).toBeDefined();

          res.id = '12';
          return collection.save(res);
        })
        .then(res => collection.find('12'))
        .then(res => {

          expect(res).not.toBe(resource);
          expect(res.$id).toBeDefined();

          done();
        });
    });

  });

});
