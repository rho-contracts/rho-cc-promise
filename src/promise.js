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
    var originalWrap = this.wrap;

    var errorContract = c.error;

    return _({}).extend(this, {
        wrap: c.fun({ impl: c.anyFunction }).wrap(function (impl) {
            var returnsThenable = this.returns(isThenable);
            var wrapped = originalWrap.call(returnsThenable, impl);

            return function () {
                var result = wrapped.apply(this, arguments);

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
        }),
    });
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
