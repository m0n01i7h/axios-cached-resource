declare module 'route-parser' {

  interface Route<T extends {}> {
    match(url: string): T;
    reverse(params: T): string;
  }

  interface RouteStatic {
    new<T>(url: string): Route<T>;
  }

  var Route: RouteStatic;

  export = Route;
}