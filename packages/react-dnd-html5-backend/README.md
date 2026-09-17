# React DnD HTML5 Backend

Zenchef fork of `react-dnd-html5-backend`, published as `@zenchef/react-dnd-html5-backend` to GitHub Packages.

The officially supported HTML5 backend for [React DnD](http://react-dnd.github.io/react-dnd/).
See [the docs](http://react-dnd.github.io/react-dnd/docs-html5-backend.html) for usage information.

## Installation

This fork is published to GitHub Packages, not to the public npm registry, so the
`@zenchef` scope has to be pointed at it first. In your project's `.npmrc`:

```
@zenchef:registry=https://npm.pkg.github.com
```

Then:

```
npm install --save @zenchef/react-dnd-html5-backend
```

The package is the CommonJS build (`lib/`). There is no UMD/`dist` build.

## Browser Support

We strive to support the evergreen browsers, Safari 7+, as well as IE11+. IE10 should also work, but `DragLayer` is fairly useless because IE10 doesn’t support `pointer-events: none`. We don’t officialy support IE9 and less.

Unfortunately the browser bugs, inconsistencies, and regressions come up from time to time, so please make sure you test your app on the browsers you’re interested in, and report any bugs to us.

## License

MIT
