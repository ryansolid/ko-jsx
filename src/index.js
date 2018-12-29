import ko from 'knockout'
import { createRuntime } from 'babel-plugin-jsx-dom-expressions';

let globalContext = null;
export const r = createRuntime({
  wrap(fn) {
    let current,
      comp = ko.computed(() => current = fn(current));
    cleanup(comp.dispose.bind(comp));
  },
  sample: ko.ignoreDependencies,
  root, cleanup
});

export function root(fn) {
  let context, d, ret;
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

export function cleanup(fn) {
  let ref;
  return (ref = globalContext) != null ? ref.disposables.push(fn) : void 0;
}

// ***************
// Mapping Fns
// ***************
function createHandler(className) {
  return (e, s) => e.classList.toggle(className, s)
}

function shallowDiff(a, b) {
  let sa = new Set(a), sb = new Set(b);
  return [a.filter(i => !sb.has(i)), (b.filter(i => !sa.has(i)))];
}

export function selectWhen(obsv, handler) {
  if (typeof handler === 'string') handler = createHandler(handler);
  let start, end, element = null;
  const comp = ko.computed(() => {
    const model = obsv();
    if (element) handler(element, false);
    let marker = start;
    while(marker && marker !== end) {
      if (marker.model === model) {
        handler(marker, true);
        return element = marker;
      }
      marker = marker.nextSibling;
    }
    element = null;
  });
  cleanup(comp.dispose.bind(comp));
  return (s, e) => (start = s, end = e);
}

export function selectEach(obsv, handler) {
  if (typeof handler === 'string') handler = createHandler(handler);
  let start, end, elements = [];
  const comp = ko.computed(() => {
    const models = obsv(), newElements = [];
    let marker = start;
    while(marker && marker !== end) {
      if (models.indexOf(marker.model) > -1) newElements.push(marker);
      marker = marker.nextSibling;
    }
    const [additions, removals] = shallowDiff(newElements, elements);
    additions.forEach(el => handler(el, true));
    removals.forEach(el => handler(el, false));
    elements = newElements;
  });
  cleanup(comp.dispose.bind(comp));
  return (s, e) => (start = s, end = e);
}
