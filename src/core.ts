import * as ko from 'knockout';

type Context = { disposables: any[] };
let globalContext: Context;

export function root<T>(fn: (dispose: () => void) => T) {
  let context, d: any[], ret: T;
  context = globalContext;
  globalContext = {
    disposables: d = []
  };
  ret = ko.ignoreDependencies(function() {
    return fn(function() {
      let disposable, k, len;
      for (k = 0, len = d.length; k < len; k++) {
        disposable = d[k];
        disposable();
      }
      d = [];
    });
  });
  globalContext = context;
  return ret;
};

export function cleanup(fn: () => void) {
  let ref;
  return (ref = globalContext) != null ? ref.disposables.push(fn) : void 0;
}

export function computed<T>(fn: (prev?: T) => T) {
  let current: T,
    comp = ko.computed(() => current = fn(current));
  cleanup(comp.dispose.bind(comp));
};