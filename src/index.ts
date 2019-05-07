import * as ko from 'knockout';
import { cleanup } from './core';
export { cleanup, root } from './core'
export * from './runtime'

type DelegatableNode = Node & { model: any }

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
