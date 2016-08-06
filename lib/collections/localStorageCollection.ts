import * as _ from 'lodash';
import * as randomString from 'randomstring';

import { Collection, ICollectionItem } from './collection';

export class LocalStorageCollection<T extends ICollectionItem> extends Collection<T> {

  public findAll(query = '?') {
    const identities: any[]
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.index`) || '{}')[query] || [];
    const items: T[]
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.items`) || '[]');
    return Promise.resolve(identities.length
      ? items.filter(item =>
        identities.some(identity => item[this.identity] === identity || item.$id === identity))
      : items);
  }

  public find(identity: any): Promise<T> {
    const items: T[] = JSON.parse(localStorage.getItem(`resource.${this.collection}.items`) || '[]');
    return Promise.resolve(_(items).find(item => item[this.identity] === identity || item.$id === identity));
  }

  public save(resource: T): Promise<T> {
    const index: { [key: string]: any[] }
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.index`) || '{}');
    const items: T[]
      = JSON.parse(localStorage.getItem(`resource.${this.collection}.items`) || '[]');
    const identities = index['?'] = index['?'] || [];

    _(identities).remove(identity =>
      (resource[this.identity] && resource[this.identity] === identity) || identity === resource.$id).commit();
    this.updateItems(resource, items);
    identities.push(resource[this.identity] || resource.$id);

    localStorage.setItem(`resource.${this.collection}.items`, JSON.stringify(items));
    localStorage.setItem(`resource.${this.collection}.index`, JSON.stringify(index));

    return Promise.resolve(resource);
  }

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

    resources.forEach(resource => {
      _(allIdentities).remove(identity =>
        (resource[this.identity] && resource[this.identity] === identity) || identity === resource.$id).commit();

      if (identities) {
        _(identities).remove(identity =>
          (resource[this.identity] && resource[this.identity] === identity) || identity === resource.$id).commit();
      }

      this.updateItems(resource, items);

      allIdentities.push(resource[this.identity] || resource.$id);

      if (identities) {
        identities.push(resource[this.identity] || resource.$id);
      }
    });

    localStorage.setItem(`resource.${this.collection}.items`, JSON.stringify(items));
    localStorage.setItem(`resource.${this.collection}.index`, JSON.stringify(index));

    return Promise.resolve(resources);
  }

  public remove(identity: any): Promise<void> {
    return Promise
      .resolve()
      .then(() => localStorage.removeItem(`resource.${this.collection}.${identity}`))
      ;
  }

  private updateItems(resource: T, collecttion: T[]) {
    // update existing item create or create new
    let item = _(collecttion).find(item =>
      (item[this.identity] && item[this.identity] === resource[this.identity]) || item.$id === resource.$id);

    if (!item) {
      collecttion.push(resource);
    } else {
      _.assign(item, resource);
    }

    if (resource[this.identity]) {
      // remove localId from
      delete resource.$id;
    } else if (!resource.$id) {
      // create localId if item has not UID yet.
      resource.$id = randomString.generate({ length: 12 });
    }

    _.difference(_.keys(item), _.keys(resource)).forEach(key => delete item[key]);
  }

}
