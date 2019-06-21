# rho-cc-promise

[![version](https://img.shields.io/npm/v/rho-cc-promise.svg?style=flat-square)][npm]
[![license](https://img.shields.io/npm/l/rho-cc-promise.svg?style=flat-square)][npm]
[![build](https://img.shields.io/circleci/project/github/rho-contracts/rho-cc-promise.svg?style=flat-square)][build]
[![code style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)][prettier]

[npm]: https://npmjs.com/rho-cc-promise
[build]: https://circleci.com/gh/rho-contracts/rho-cc-promise/tree/master
[prettier]: https://prettier.io/

Create [rho-contracts][] for Promises.

[rho-contracts]: https://github.com/bodylabs/rho-contracts-fork

## Usage

You must use the Body Labs package, `rho-contracts-fork`:

```js
  "dependencies": {
    "rho-contracts-fork": "^1.2.2"
  }
```

Use this module to create contracts for promises. The returned contracts check
the values of `resolve` and optionally `reject`, propagating contract errors
through `reject`.

Calling `withError` on the returned contract changes the type of the error
argument to the contract specified.

The main entry point of this module is a mixin, which extends `c.fn` and `c.fun`
to return contracts with `returnsPromise` methods.

```js
const c = require('rho-cc-promise').mixin(require('rho-contracts-fork'))

const cc = {}

cc.info = c.object({ data: c.any })

cc.getInfo = c.fun().returnsPromise(cc.info)

// A function which returns a promise which resolves with no value.
cc.doSomething = c.fun().returnsPromise(c.value(undefined))

// A function which returns a promise which rejects with a custom error type.
cc.customError = c.array(c.error)

cc.doSomething = c
  .fun()
  .returnsPromise(c.value(undefined))
  .withError(cc.customError)
```

It's compatible with most promise implementations, including ES6 Promise and
implementations which adhere to A+.

## Installation

```sh
npm install rho-contracts-fork rho-cc-promise
```

## Contribute

Pull requests welcome!

## License

The project is dually licensed under the Mozilla Public License Version 2.0,
and the MIT license. You may use either one, at your option.
