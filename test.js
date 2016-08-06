var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var targetClass;
function Resource() {
    return function (target) {
        console.log('>>>> Resource');
        target.__resource__ = target.__resource__ || {};
        console.log(typeof target, target.name, target.__resource__);
    };
}
function Action() {
    return function (target, key) {
        console.log('>>>> Action');
        target.constructor.__resource__ = target.constructor.__resource__ || {};
        target.constructor.__resource__.action = true;
        target[key] = function () {
            console.log("Action " + key + " called");
        };
        console.log(typeof target, target.constructor.name, key);
    };
}
var TestClass = (function () {
    function TestClass() {
    }
    __decorate([
        Action()
    ], TestClass.prototype, "find");
    __decorate([
        Action()
    ], TestClass.prototype, "save");
    TestClass = __decorate([
        Resource()
    ], TestClass);
    return TestClass;
}());
new TestClass().find();
