import * as _ from 'lodash';
import * as randomString from 'randomstring';

import { Collection, ICollectionItem } from './collection';

export class LocalStorageProvider<T extends ICollectionItem> extends Collection<T> {

  /**
   * Get all items by index
   */
  public findAll(query = '?') {
    const identities: any[]
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.index`) || '{}')[query];
    const items: T[]
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.items`) || '[]');

    return Promise.resolve(identities
      ? items.filter(item => identities
        .some(identity => (item[this.identity] && item[this.identity] === identity) || item.$id === identity))
      : []);
  }

  /**
   * Get single item by local $id or identity attr.
   */
  public find(identity: any): Promise<T> {
    const items: T[] = JSON.parse(localStorage.getItem(`resource.${this.collection}.items`) || '[]');
    return Promise.resolve(_(items)
      .find(item => (item[this.identity] && item[this.identity] === identity) || item.$id === identity));
  }

  /**
   * Update or create item and its indexes.
   */
  public save(resource: T): Promise<T> {
    const index: { [key: string]: any[] }
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.index`) || '{}');
    const items: T[]
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.items`) || '[]');
    const identities = index['?'] = index['?'] || [];

    this.updateItems(resource, items);
    this.updateIndex(resource, identities);

    // update all non-default indexes where this resource indexed
    _(index).each((identities: any[], query: string) => {
        if (
          query === '?' ||
          !_(identities)
            .some(identity => (resource[this.identity] && resource[this.identity] === identity) || identity === resource.$id)
        ) { return; }
        this.updateIndex(resource, identities);
    });

    localStorage.setItem(`resource.${this.collection}.items`, JSON.stringify(items));
    localStorage.setItem(`resource.${this.collection}.index`, JSON.stringify(index));

    return Promise.resolve(resource);
  }

  /**
   * Update or create all items and indexes
   */
  public saveAll(resources: T[], query = '?'): Promise<T[]> {
    const index: { [key: string]: any[] }
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.index`) || '{}');
    const items: T[]
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.items`) || '[]');
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
        .remove(item => !_(resources).some((resource: T) => (resource[this.identity] && resource[this.identity] === item[this.identity]) || resource.$id === item.$id))
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
        .remove(item => !_(indexedIdentities).some(identity => (item[this.identity] && item[this.identity] === identity) || identity === item.$id))
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

    localStorage.setItem(`resource.${this.collection}.items`, JSON.stringify(items));
    localStorage.setItem(`resource.${this.collection}.index`, JSON.stringify(index));

    return Promise.resolve(resources);
  }

  /**
   * Removes resource from items and all indexes
   */
  public remove(identity: any): Promise<void> {
    const index: { [key: string]: any[] }
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.index`) || '{}');
    const items: T[]
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.items`) || '[]');

    // remove from items
    _(items)
      .remove(item => (item[this.identity] && item[this.identity] === identity) || item.$id === identity)
      .commit();

    // remove from all indexes
    _(index).each((identities: any[]) => {
      _(identities)
        .remove(id => identity === id)
        .commit();
    });

    // remove all empty indexes
    _(index)
      .keys()
      .forEach(key => {
        if (key === '?' || index[key].length) { return; }
        delete index[key];
      });

    localStorage.setItem(`resource.${this.collection}.items`, JSON.stringify(items));
    localStorage.setItem(`resource.${this.collection}.index`, JSON.stringify(index));

    return Promise.resolve();
  }

  /**
   * Update or create item in collection
   */
  private updateItems(resource: T, collecttion: T[]) {
    // update existing item create or create new
    let item = _(collecttion).find(item =>
      (item[this.identity] && item[this.identity] === resource[this.identity]) || item.$id === resource.$id);

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
      (resource[this.identity] && resource[this.identity] === identity) || identity === resource.$id).commit();
    identities.push(resource[this.identity] || resource.$id);
  }

}
