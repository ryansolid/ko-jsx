# Knockout JSX

This library is a replacement for Knockout.js' renderer. It trades Knockout's data-bind and DOM traversing for precompiled JSX. Using these techniques allows for dramatic performance improvements across the board putting Knockout in the company of some of the fastest libraries. See [JS Frameworks Benchmark](https://github.com/krausest/js-framework-benchmark).

It accomplishes this with using [Babel Plugin JSX DOM Expressions](https://github.com/ryansolid/babel-plugin-jsx-dom-expressions). It compiles JSX to DOM statements and wraps expressions in functions that can be called by the library of choice. In this case ko.computed wrap these expressions ensuring the view stays up to date. Unlike Virtual DOM only the changed nodes are affected and the whole tree is not re-rendered over and over.

To use include 'babel-plugin-jsx-dom-expressions' in your babelrc, webpack babel loader, or rollup babel plugin

```js
"plugins": [["jsx-dom-expressions", {moduleName: 'ko-jsx'}]]
```

For TS JSX types add to your `tsconfig.json`:
```js
"jsx": "preserve",
"jsxImportSource": "ko-jsx" 
```

# Installation
```sh
> npm install ko-jsx babel-plugin-jsx-dom-expressions
```

## API

There is no ko.applyBinding. Instead the app starts with:

```js
render(AppViewModel, mountEl)
```

For example:

```jsx
import { render } from 'ko-jsx'

const Greeter = ({name, onClick}) =>
  <div onClick={onClick}>Hello {name() || 'World'}</div>

function App() {
  const name = ko.observable('John');
  return <>
    <h1>Greeting Example</h1>
    <Greeter name={name} onClick={() => name('Jake')}/>
  </>;
}

render(App, document.getElementById('main'));
```

Control flow works the way you generally would JSX. However for performant list rendering I have added a fn on `subscribable` called `memoMap` that will optimally handle arrays.

```jsx
const list = ko.observableArray(["Alpha", "Beta", "Gamma"])

<ul>{
  list.memoMap(item => <li>{item}</li>)
}</ul>
```
### Example
[Counter](https://codesandbox.io/s/knockout-jsx-counter-dqtc2)

### Non-Precompiled

For those who do not wish to use Babel to precompile, the Knockout JSX supports Tagged Template Literals or HyperScript render APIs. These are available when you install the companion library and throw import of 'ko-jsx/html' and 'ko-jsx/h'. Refer to the docs on [Lit DOM Expressions](https://github.com/ryansolid/lit-dom-expressions), and [Hyper DOM Expressions](https://github.com/ryansolid/hyper-dom-expressions), respectively.

```js
import ko from 'knockout';
import { h, render } from 'ko-jsx/h';

const Greeter = (name, onclick) =>
  h('div', {onclick}, 'Hello', () => name() || 'World');

function App() {
  const name = ko.observable('John');
  return h('div', [
    h('h1', 'Greeting Example'),
    h(Greeter, {name, onclick: () => name('Jake')})
  ]);
}

render(App, document.getElementById('main'));
```

## Compatibility

This does not use any of the Knockout render chain so data-bindings and custom bindings don't work. Knockout Components won't work. Essentially this library only takes the observable change detection part of Knockout. It is compatible with Webcomponents in general. In theory you could call ko.applyBinding and set data-bind attribute value but it seems wasted.

## Why?

Knockout.js at it's core is an elegant and efficient solution to tracking change detection. It also as far as modern declarative javascript libraries is one of the oldest.  While it's continued to improve over time, in recent years Virtual DOM approaches have gained more popularity. Conceptually it always seemed that Knockout should outperform those techniques but in many areas it's been a dog in benchmarks.  After seeing the great [Surplus.js](https://github.com/adamhaile/surplus) it was clear that these sort of libraries still had steam. In the process of working through my own library I realized the approaches used could be generalized to any fine grained library.

Mostly this library is a demonstration of a concept. Fine grained detection libraries shouldn't shy from the technological advancement Virtual DOM libraries brought, when even the oldest of the fine grained libraries still has considerable game in this light.