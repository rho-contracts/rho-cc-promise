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

var mixin = function (c) {
    var augment = function (f) {
        var result = function () {
            return f.apply(this, arguments);
        };

        result.returnsPromise = function () {};

        return result;
    };

    return _({}).extend(c, {
        fn: augment(c.fn),
        fun: augment(c.fun),
    });
};


exports.mixin = mixin;
exports.returnsPromise = returnsPromise;
