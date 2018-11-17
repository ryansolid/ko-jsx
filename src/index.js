import ko from 'knockout'
import { createRuntime } from 'babel-plugin-jsx-dom-expressions';

let globalContext = null;
export const r = createRuntime({
  wrap(fn) {
    let current,
      comp = ko.computed(() => current = fn(current));
    cleanup(comp.dispose.bind(comp));
  }
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
  return list => {
    let element = null;
    const comp = ko.computed(() => {
      const model = obsv();
      if (element) handler(element, false);
      if (element = model && list().find(el => el.model === model)) handler(element, true);
    });
    cleanup(comp.dispose.bind(comp));
    return list;
  }
}

export function selectEach(obsv, handler) {
  if (typeof handler === 'string') handler = createHandler(handler);
  return list => {
    let elements = [];
    const comp = ko.computed(() => {
      const models = obsv(),
        newElements = list().filter(el => models.indexOf(el.model) > -1),
        [additions, removals] = shallowDiff(newElements, elements);
      additions.forEach(el => handler(el, true));
      removals.forEach(el => handler(el, false));
      elements = newElements;
    });
    cleanup(comp.dispose.bind(comp));
    return list;
  }
}

// ***************
// Custom memo methods for rendering
// ***************
ko.observable.fn.when = function(mapFn) {
  let mapped, value, disposable;
  cleanup(function dispose() {
    disposable && disposable();
  });
  const comp = ko.pureComputed(() => {
    const newValue = this();
    if (newValue == null || newValue === false) {
      disposable && disposable();
      return value = mapped = disposable = null;
    }
    if (value === newValue) return mapped;
    disposable && disposable();
    disposable = null;
    value = newValue;
    return mapped = root((d) => {
      disposable = d;
      return mapFn(value);
    });
  });
  cleanup(comp.dispose.bind(comp));
  return comp;
}

ko.observable.fn.each = function(mapFn) {
  let mapped = [],
    list = [],
    disposables = [],
    length = 0;
  cleanup(function() {
    for (let k = 0, len = disposables.length; k < len; k++) disposables[k]();
  });
  const comp = ko.pureComputed(() => {
    let d, end, i, indexedItems, item, itemIndex, j, len2, m, newEnd, newLength, newList, newMapped, start, tempDisposables;
    newList = this();
    newLength = (newList && newList.length) || 0;
    if (newLength === 0) {
      if (length !== 0) {
        list = [];
        mapped = [];
        length = 0;
        for (m = 0, len2 = disposables.length; m < len2; m++) {
          d = disposables[m];
          d();
        }
        disposables = [];
      }
    } else if (length === 0) {
      j = 0;
      while (j < newLength) {
        list[j] = newList[j];
        mapped[j] = root(mappedFn);
        j++;
      }
      length = newLength;
    } else {
      newMapped = new Array(newLength);
      tempDisposables = new Array(newLength);
      indexedItems = new Map();
      end = Math.min(length, newLength);
      // reduce from both ends
      start = 0;
      while (start < end && newList[start] === list[start]) {
        start++;
      }
      end = length - 1;
      newEnd = newLength - 1;
      while (end >= 0 && newEnd >= 0 && newList[newEnd] === list[end]) {
        newMapped[newEnd] = mapped[end];
        tempDisposables[newEnd] = disposables[end];
        end--;
        newEnd--;
      }
      // create indices
      j = newEnd;
      while (j >= start) {
        item = newList[j];
        itemIndex = indexedItems.get(item);
        if (itemIndex != null) {
          itemIndex.push(j);
        } else {
          indexedItems.set(item, [j]);
        }
        j--;
      }
      // find old items
      i = start;
      while (i <= end) {
        item = list[i];
        itemIndex = indexedItems.get(item);
        if ((itemIndex != null) && itemIndex.length > 0) {
          j = itemIndex.pop();
          newMapped[j] = mapped[i];
          tempDisposables[j] = disposables[i];
        } else {
          disposables[i]();
        }
        i++;
      }
      // set all new values
      j = start;
      while (j < newLength) {
        if (newMapped.hasOwnProperty(j)) {
          mapped[j] = newMapped[j];
          disposables[j] = tempDisposables[j];
        } else {
          mapped[j] = root(mappedFn);
        }
        j++;
      }
      // truncate extra length
      length = mapped.length = newLength;
      // save list for next iteration
      list = newList.slice(0);
    }
    return mapped;

    function mappedFn(dispose) {
      disposables[j] = dispose;
      return mapFn(newList[j], j);
    }
  });
  cleanup(comp.dispose.bind(comp));
  return comp;
};