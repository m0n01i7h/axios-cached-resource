import * as _ from 'lodash';
import * as randomString from 'randomstring';

import { Collection, ICollection, ICollectionItem } from './collection';

export class LocalStorageProvider<T extends ICollectionItem> extends Collection<T> implements ICollection<T> {

  /**
   * Get all items by index
   */
  public findAll(query: string | ((item: T) => boolean) = '?') {
    const items: T[]
      = JSON.parse(localStorage.getItem(`resource.${this.collectionName}.items`) || '[]');

    if (_.isString(query)) {
    const identities: any[]
      = JSON.parse(localStorage.getItem(`resource.${this.collectionName}.index`) || '{}')[query];

    return Promise.resolve(identities
      ? items.filter(item => identities
        .some(identity => (item[this.identityAttr] && item[this.identityAttr] === identity) || item.$id === identity))
      : []);
    } else {
      return Promise.resolve(items.filter(query));
    }
  }

  /**
   * Get single item by local $id or identity attr.
   */
  public find(identity?: any): Promise<T> {
    const items: T[] = JSON.parse(localStorage.getItem(`resource.${this.collectionName}.items`) || '[]');
    return Promise.resolve(identity
      ? _(items).find(item => (item[this.identityAttr] && item[this.identityAttr] === identity) || item.$id === identity)
      : _(items).first());
  }

  /**
   * Update or create item and its indexes.
   */
  public save(resource: T): Promise<T> {
    const index: { [key: string]: any[] }
      = JSON.parse(localStorage.getItem(`resource.${this.collectionName}.index`) || '{}');
    const items: T[]
      = JSON.parse(localStorage.getItem(`resource.${this.collectionName}.items`) || '[]');
    const identities = index['?'] = index['?'] || [];

    this.updateItems(resource, items);
    this.updateIndex(resource, identities);

    // update all non-default indexes where this resource indexed
    _(index).each((identities: any[], query: string) => {
        if (
          query === '?' ||
          !_(identities)
            .some(identity => (resource[this.identityAttr] && resource[this.identityAttr] === identity) || identity === resource.$id)
        ) { return; }
        this.updateIndex(resource, identities);
    });

    localStorage.setItem(`resource.${this.collectionName}.items`, JSON.stringify(items));
    localStorage.setItem(`resource.${this.collectionName}.index`, JSON.stringify(index));

    return Promise.resolve(resource);
  }

  /**
   * Update or create all items and indexes
   */
  public saveAll(resources: T[], query = '?'): Promise<T[]> {
    const index: { [key: string]: any[] }
      = JSON.parse(localStorage.getItem(`resource.${this.collectionName}.index`) || '{}');
    const items: T[]
      = JSON.parse(localStorage.getItem(`resource.${this.collectionName}.items`) || '[]');
    const allIdentities = index['?'] = index['?'] || [];
    // identities by non-default query
    const identities = (query !== '?')
      ? index[query] = []
      : null;

    // compact

    if (query === '?') {

      allIdentities.splice(0);

      // remove all items not existing in passed resources
      _(items)
        .remove(item => !_(resources).some((resource: T) => (resource[this.identityAttr] && resource[this.identityAttr] === item[this.identityAttr]) || resource.$id === item.$id))
        .commit();
    } else {

      let indexedIdentities = [];

      _(index).each((identities: any[], query: string) => {
        if (query === '?') { return; }

        indexedIdentities.push(...identities);
      });

      indexedIdentities = _(indexedIdentities).uniqBy(identity => identity).value();

      // remove all not indexed items
      _(items)
        .remove(item => !_(indexedIdentities).some(identity => (item[this.identityAttr] && item[this.identityAttr] === identity) || identity === item.$id))
        .commit();

      // remove all non indexed identities
      _(allIdentities)
        .remove(identity => !_(indexedIdentities).some(indexed => indexed === identity))
        .commit();
    }

    // create or update items
    resources.forEach(resource => {

      this.updateItems(resource, items);
      this.updateIndex(resource, allIdentities);

      if (identities) {
        this.updateIndex(resource, identities);
      }

    });

    // delete empty non-default index
    if (identities && identities.length === 0) {
      delete index[query];
    }

    localStorage.setItem(`resource.${this.collectionName}.items`, JSON.stringify(items));
    localStorage.setItem(`resource.${this.collectionName}.index`, JSON.stringify(index));

    return Promise.resolve(resources);
  }

  /**
   * Removes resource from items and all indexes
   */
  public remove(identity?: any): Promise<void> {
    const index: { [key: string]: any[] }
      = JSON.parse(localStorage.getItem(`resource.${this.collectionName}.index`) || '{}');
    const items: T[]
      = JSON.parse(localStorage.getItem(`resource.${this.collectionName}.items`) || '[]');

    // remove from items
    _(items)
      .remove(item => !identity || (item[this.identityAttr] && item[this.identityAttr] === identity) || item.$id === identity)
      .commit();

    // remove from all indexes
    _(index).each((identities: any[]) => {
      _(identities)
        .remove(id => !identity || identity === id)
        .commit();
    });

    // remove all empty indexes
    _(index)
      .keys()
      .forEach(key => {
        if (key === '?' || index[key].length) { return; }
        delete index[key];
      });

    localStorage.setItem(`resource.${this.collectionName}.items`, JSON.stringify(items));
    localStorage.setItem(`resource.${this.collectionName}.index`, JSON.stringify(index));

    return Promise.resolve();
  }

  /**
   * Update or create item in collection
   */
  private updateItems(resource: T, collecttion: T[]) {
    // update existing item create or create new
    let item = _(collecttion).find(item =>
      (item[this.identityAttr] && item[this.identityAttr] === resource[this.identityAttr]) || item.$id === resource.$id);

    if (!item) {
      collecttion.push(resource);
    } else {
      _.assign(item, resource);
    }

    resource.$id = resource.$id || randomString.generate({ length: 24 });

    _.difference(_.keys(item), _.keys(resource)).forEach(key => delete item[key]);
  }

  /**
   * Update or create index for resource
   */
  private updateIndex(resource: T, identities: any[]) {
    _(identities).remove(identity =>
      (resource[this.identityAttr] && resource[this.identityAttr] === identity) || identity === resource.$id).commit();
    identities.push(resource[this.identityAttr] || resource.$id);
  }

}
