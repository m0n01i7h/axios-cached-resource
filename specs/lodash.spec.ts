import * as _ from 'lodash';
import * as Route from 'route-parser';

describe('Lodash', () => {

  let route = new Route('(/:id)(?name=:name)');
  it('#remove', () => {
    let arr = [
      { id: '10' },
      { id: '15' },
      { id: '18' },
      { id: '17' },
      { id: '10', name: 'mo' },
    ];
    console.log(_.find(arr, _.pickBy(route.match('?name=mo'), _.identity)));
    _.remove(arr, _.pickBy(route.match('/10'), _.identity));
    expect(arr.length).toEqual(3);
  });
});
