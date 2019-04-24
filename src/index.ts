import * as ko from 'knockout'
import { createRuntime } from 'dom-expressions';

type Context = { disposables: any[] };
type DelegatableNode = Node & { model: any }

let globalContext: Context;
export const r = createRuntime({
  wrap<T>(fn: (prev?: T) => T) {
    let current: T,
      comp = ko.computed(() => current = fn(current));
    cleanup(comp.dispose.bind(comp));
  },
  sample: ko.ignoreDependencies,
  root, cleanup
});

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

// ***************
// Mapping Fns
// ***************
function createHandler(className: string) {
  return (e: HTMLElement, s: boolean) => e.classList.toggle(className, s)
}

function shallowDiff(a: HTMLElement[], b: HTMLElement[]) {
  let sa = new Set(a), sb = new Set(b);
  return [a.filter(i => !sb.has(i)), (b.filter(i => !sa.has(i)))];
}

export function selectWhen(obsv: () => any, handler: string) : (s: Node, e: Node | null) => void
export function selectWhen(obsv: () => any, handler: (element: HTMLElement, selected: boolean) => void) : (s: Node, e: Node | null) => void
export function selectWhen(obsv: () => any, handler: any) : (s: Node, e: Node | null) => void {
  if (typeof handler === 'string') handler = createHandler(handler);
  let start: Node, end: Node | null, element: HTMLElement | null = null;
  const comp = ko.computed(() => {
    const model = obsv();
    if (element) handler(element, false);
    let marker: Node | null = start;
    while(marker && marker !== end) {
      if ((marker as DelegatableNode).model === model) {
        handler(marker, true);
        return element = marker as HTMLElement;
      }
      marker = marker.nextSibling;
    }
    element = null;
  });
  cleanup(comp.dispose.bind(comp));
  return (s, e) => (start = s, end = e);
}

export function selectEach(obsv: () => any, handler: string) : (s: Node, e: Node | null) => void
export function selectEach(obsv: () => any, handler: (element: HTMLElement, selected: boolean) => void) : (s: Node, e: Node | null) => void
export function selectEach(obsv: () => any, handler: any) : (s: Node, e: Node | null) => void {
  if (typeof handler === 'string') handler = createHandler(handler);
  let start: Node, end: Node | null, elements: HTMLElement[] = [];
  const comp = ko.computed(() => {
    const models = obsv(), newElements = [];
    let marker: Node | null = start
    while(marker && marker !== end) {
      if (models.indexOf((marker as DelegatableNode).model) > -1) newElements.push(marker as HTMLElement);
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
