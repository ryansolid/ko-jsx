# Knockout JSX

This library is a replacement for Knockout.js' renderer. It trades Knockout's data-bind and DOM traversing for precompiled JSX. Using these techniques allows for dramatic performance improvements across the board putting Knockout in the company of some of the fastest libraries. See [JS Frameworks Benchmark](https://github.com/krausest/js-framework-benchmark).

It accomplishes this with using [Babel Plugin JSX DOM Expressions](https://github.com/ryansolid/babel-plugin-jsx-dom-expressions). It compiles JSX to DOM statements and wraps expressions in functions that can be called by the library of choice. In this case ko.computed wrap these expressions ensuring the view stays up to date. Unlike Virtual DOM only the changed nodes are affected and the whole tree is not re-rendered over and over.

To use simply import the package as r:

```js
import { r } from 'ko-jsx'
```

And include 'babel-plugin-jsx-dom-expressions' in your babelrc, webpack babel loader, or rollup babel plugin.

## API

There is no ko.applyBinding. Instead the app starts with:

```js
root(() => {
  var app = new AppViewModel()
  mountEl.appendChild(app.render())
})
```

There is no opinion on how you set up your View Models, so I just used a render function in this example to demonstrate. Your ViewModel could be a functional Component ala React if you wanted to, as the library supports any mixed case function as a JSX tag. For example:

```js
function Greeter({name, onClick}) {
  return (<div onClick={onClick}>Hello {name() ? name() : 'World'}</div>);
}

function App() {
  var name = observable('John');
  return(<>
    <h1>Greeting Example</h1>
    <Greeter name={name} onClick={() => name('Jake')}/>
  </>);
}

root(() => mountEl.appendChild(<App />));
```

Control flow is handled in an optimized way through the each('foreach') and when ('if') custom function added to observable. This uses a memoization to ensure that only the things that change are updated. Example:

```js
var list = observableArray(["Alpha", "Beta", "Gamma"])

<ul>{
  list.each(item =>
    <li>{item}</li>
  )
}</ul>
```

## Compatibility

This does not use any of the Knockout render chain so data-bindings and custom bindings don't work. Knockout Components won't work. Essentially this library only takes the observable change detection part of Knockout. It is compatible with Webcomponents in general. In theory you could call ko.applyBinding and set data-bind attribute value but it seems wasted.

## Why?

Knockout.js at it's core is an elegant and efficient solution to tracking change detection. It also as far as modern declarative javascript libraries is one of the oldest.  While it's continued to improve over time, in recent years Virtual DOM approaches have gained more popularity. Conceptually it always seemed that Knockout should outperform those techniques but in many areas it's been a dog in benchmarks.  After seeing the great [Surplus.js](https://github.com/adamhaile/surplus) it was clear that these sort of libraries still had steam. In the process of working through my own library I realized the approaches used could be generalized to any fine grained library.

The key reasons this library has significantly better performance is:
* Precompiled DOM statements are much faster than walking over existing DOM elements. DOM Nodes are only rendered afer they are processed.
* Context based rendering (ie.. $parent, $data, etc...) requires a lot of cloning, which is slow and memory intensive. Capturing context via function closure ends up more performant.

Mostly this library is a demonstration of a concept. Fine grained detection libraries shouldn't shy from the technological advancement Virtual DOM libraries brought, when even the oldest of the fine grained libraries still has considerable game in this light.