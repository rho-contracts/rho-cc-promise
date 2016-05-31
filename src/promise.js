var c = require('rho-contracts'),
    _ = require('underscore');

var isThenable = c.pred(function (value) {
    return _(value.then).isFunction();
});

var returnsPromise = function (functionContract, resultContract, errorContract, impl) {
    return function () {
        var result = functionContract
            .returns(isThenable)
            .wrap(impl)
            .apply(this, arguments);

        return result.then(
            function (result) {
                resultContract.check(result);
                return result;
            },
            function (err) {
                errorContract.check(err);
                throw err;
            }
        );
    };
};

var returnsPromise2 = function (resultContract) {
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
                    return result;
                },
                function (err) {
                    contextHere.blameMe = false;
                    c.privates.checkWrapWContext(self._errorContract, err, contextHere);
                    contextHere.blameMe = true;
                    throw err;
                }
            );
        };

        return oldWrapper.call(self, checkPromise, next, context);
    };

    return result;
};

var mixin = function (c) {
    var augment = function (f) {
        return function () {
            var result = f.apply(null, arguments);

            result.returnsPromise = returnsPromise2;

            return result;
        };
    };

    return _({}).extend(c, {
        fn: augment(c.fn),
        fun: augment(c.fun),
    });
};


exports.mixin = mixin;
exports.returnsPromise = returnsPromise;
