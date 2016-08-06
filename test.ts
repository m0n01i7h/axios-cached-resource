let targetClass;

function Resource() {
  return (target: any) => {
    console.log('>>>> Resource');
    target.__resource__ = target.__resource__ || { };
    console.log(typeof target, target.name, target.__resource__);
  };
}

function Action() {
  return (target: any, key: string) => {
    console.log('>>>> Action');
    target.constructor.__resource__ = target.constructor.__resource__ || { };
    target.constructor.__resource__.action = true;
    target[key] = function () {
      console.log(`Action ${key} called`);
    };
    console.log(typeof target, target.constructor.name, key);
  };
}

@Resource()
class TestClass {

  @Action()
  public find: () => void;

  @Action()
  public save: () => void;
}

new TestClass().find();
