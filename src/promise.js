'use strict';

var c = require('rho-contracts-fork'),
    _ = require('underscore');

var isThenable = c.pred(function (value) {
    return value !== undefined && _(value.then).isFunction();
}).rename('thenable');

var returnsPromise = function (resultContract) {
    // Avoid mysterious error messages down the line. Not sure this is the
    // best place to do this, but it works.
    c.contract.check(resultContract);

    var result = _(this).clone();

    result._errorContract = c.error;

    result.withError = c.fun({ newErrorContract: c.contract })
        .wrap(function (newErrorContract) {
            return _({}).extend(this, { _errorContract: newErrorContract });
        });

    var oldWrapper = result.wrapper;
    result.wrapper = function (fn, next, context) {
        var self = this;

        var contextHere = _(context).clone();

        var checkPromise = function () {
            var result = fn.apply(this, arguments);

            contextHere.blameMe = false;
            c.privates.checkWrapWContext(isThenable, result, contextHere);
            contextHere.blameMe = true;

            return result.then(
                function (value) {
                    contextHere.blameMe = false;
                    c.privates.checkWrapWContext(resultContract, value, contextHere);
                    contextHere.blameMe = true;

                    // Return the original promise.
                    return result;
                },
                function (err) {
                    contextHere.blameMe = false;
                    c.privates.checkWrapWContext(self._errorContract, err, contextHere);
                    contextHere.blameMe = true;

                    // Return the original promise.
                    return result;
                }
            );
        };

        return oldWrapper.call(self, checkPromise, next, context);
    };

    result.toString = function () {
        return 'c.' + this.contractName + '(' +
            (this.thisContract !== c.any ? 'this: ' + this.thisContract + ', ' : '') +
            this.argumentContracts.join(', ') +
            (this.extraArgumentContract ? '...' + this.extraArgumentContract : '') +
            ' -> Promise(' + resultContract + ').withError(' + this._errorContract + ')';
    };

    return result;
};

var mixin = function (c) {
    var augment = function (f) {
        return function () {
            var result = f.apply(this, arguments);

            result.returnsPromise = returnsPromise;

            return result;
        };
    };

    return _({}).extend(c, {
        fn: augment(c.fn),
        fun: augment(c.fun),
    });
};

exports.mixin = mixin;
