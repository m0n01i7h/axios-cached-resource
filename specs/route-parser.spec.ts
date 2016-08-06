/// <reference path="../lib/typings/route-parser.d.ts" />

import * as Route from 'route-parser';

describe('Route parser', () => {

  it('should export function', () => {
    expect(Route).toBeDefined();
    expect(typeof Route).toBe('function');
  });

  it('should have class methods', () => {
    let route = new Route('/');

    expect(route.match).toBeDefined();
    expect(route.reverse).toBeDefined();
  });

  it('should match params', () => {
    interface IMatchTestParams {
      id: string;
    };
    let route = new Route<IMatchTestParams>('/:id');
    expect(route.match('/0').id).toBe('0');
  });

  it('should reverse params', () => {
    interface IMatchTestParams {
      id: string;
    };
    let route = new Route<IMatchTestParams>('/:id');
    expect(route.reverse({ id: '0' })).toBe('/0');
  });

});
