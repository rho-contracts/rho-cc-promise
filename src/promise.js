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

exports.returnsPromise = returnsPromise;
