var c = require('rho-contracts'),
    _ = require('underscore');

var isThenable = c.pred(function (value) {
    return _(value.then).isFunction();
};

var returnsPromise = function (wrappedFn, resultContract, errorContract) {
    return function () {
        var result = wrappedFn.returns(isThenable).apply(this, arguments);

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

exports.returnsPromise = returnsPromise;
exports.withDefaultError = _(returnsPromise).partial(_, _, c.error);
