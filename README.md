rho-cc-promise
==============

Create [rho-contracts][] for Promises.

[rho-contracts]: https://github.com/bodylabs/rho-contracts.js


Usage
-----

You must use the Body Labs fork of rho-contracts:
```js
  "dependencies": {
    "rho-contracts": "git+https://github.com/bodylabs/rho-contracts.js.git#1.2.2"
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
const c = require('rho-cc-promise').mixin(require('rho-contracts-fork'));

const cc = {};

cc.info = c.object({ data: c.any });

cc.getInfo = c.fun()
    .returnsPromise(cc.info);

// A function which returns a promise which resolves with no value.
cc.doSomething = c.fun()
    .returnsPromise(c.value(undefined));

// A function which returns a promise which rejects with a custom error type.
cc.customError = c.array(c.error);

cc.doSomething = c.fun()
    .returnsPromise(c.value(undefined))
    .withError(cc.customError);
```

It's belived compatible with most promise implementations, including ES6
Promise and implementations which adhere to A+.


Installation
------------

```sh
npm install rho-contracts-fork rho-cc-promise
```


Contribute
----------

- Issue Tracker: https://github.com/paulmelnikow/rho-cc-promise/issues
- Source Code: https://github.com/paulmelnikow/rho-cc-promise

Pull requests welcome!


Support
-------

If you are having issues, please let me know.


License
-------

The project is licensed under the Mozilla Public License Version 2.0.
