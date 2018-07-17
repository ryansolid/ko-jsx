import ko from 'knockout'
import { createRuntime } from 'babel-plugin-jsx-dom-expressions'

let globalContext = null;
let cleanup;
const r = createRuntime({
  wrapExpr: function(accessor, elem, isAttr, fn) {
    var comp = ko.computed(function() {
      var value = accessor();
      if (ko.isObservable(value)) {
        var comp2 = ko.computed(function() {
          fn(value(), elem);
        });
        cleanup(comp2.dispose.bind(comp2))
        return
      }
      fn(value, elem);
    });
    cleanup(comp.dispose.bind(comp));
  },
  disposer: cleanup = function(fn) {
    var ref;
    return (ref = globalContext) != null ? ref.disposables.push(fn) : void 0;
  }
});

r.root = function(fn) {
  var context, d, ret;
  context = globalContext;
  globalContext = {
    disposables: d = []
  };
  ret = ko.ignoreDependencies(function() {
    return fn(function() {
      var disposable, k, len;
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

ko.observable.fn.map = function(mapFn) {
  var comp, disposables, length, list, mapped;
  mapped = [];
  list = [];
  disposables = [];
  length = 0;
  cleanup(function() {
    var d, k, len;
    for (k = 0, len = disposables.length; k < len; k++) {
      d = disposables[k];
      d();
    }
    return disposables = [];
  });
  comp = ko.pureComputed(() => {
    var d, end, i, indexedItems, item, itemIndex, j, k, l, len, len1, len2, m, newEnd, newLength, newList, newMapped, start, tempDisposables;
    newList = this();
    // non-arrays
    if (!Array.isArray(newList)) {
      if ((newList == null) || newList === false) {
        mapped = [];
        list = [];
        for (k = 0, len = disposables.length; k < len; k++) {
          d = disposables[k];
          d();
        }
        disposables = [];
        return;
      }
      if (list[0] === newList) {
        return mapped[0];
      }
      for (l = 0, len1 = disposables.length; l < len1; l++) {
        d = disposables[l];
        d();
      }
      disposables = [];
      list[0] = newList;
      return mapped[0] = r.root(function(dispose) {
        disposables[0] = dispose;
        return mapFn(newList);
      });
    }
    newLength = newList.length;
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
      i = 0;
      while (i < newLength) {
        list[i] = newList[i];
        mapped[i] = r.root(function(dispose) {
          disposables[i] = dispose;
          return mapFn(newList[i], i);
        });
        i++;
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
          mapped[j] = r.root(function(dispose) {
            disposables[j] = dispose;
            return mapFn(newList[j], j);
          });
        }
        j++;
      }
      // truncate extra length
      length = mapped.length = newLength;
      // save list for next iteration
      list = newList.slice(0);
    }
    return mapped;
  });
  cleanup(comp.dispose.bind(comp));
  return comp;
};

export default r;