var c = require('rho-contracts'),
    should = require('should');

c.promise = require('./promise').withDefaultError(c.error);

// For convenience and conciseness.
var good = should.doesNotThrow;
var bad = function (block) { should.throws(block, c.ContractError); };


describe('c.callback with a number result', function () {

    var numberPromise = c.promise({ result: c.number });
    var returnsNumberPromise = c.fun().returns(numberPromise);
    var invokeWith = function (impl, value) {
        return returnsNumberPromise.wrap(impl)(value);
    };

    context('rejected with an error', function () {
        it('does not return a contract error', function () {
            var error = Error('boom');

            var impl = function (value) { return Promise.reject(value); };

            return invokeWith(impl, error)
                .should.be.rejectedWith(Error, { message: 'boom' });
        });
    });

    context('resolved with a number result', function () {
        it('does not return a contract error', function () {
            var result = 0;

            var impl = function (value) { return Promise.resolve(value); };

            return invokeWith(impl, result)
                .should.be.fulfilledWith(result);
        });
    });

    context('resolved with a bad result', function () {
        it('returns a contract error', function () {
            var badResults = ['0', null, undefined];

            var impl = function (value) { return Promise.resolve(value); };

            return Promise.all(
                badResults.map(function (badResult) {
                    return invokeWith(impl, badResult)
                        .should.be.rejectedWith(c.ContractError);
                })
            );
        });
    });
});

describe('c.promise with no result', function () {

    var emptyPromise = c.promise();
    var returnsEmptyPromise = c.fun().returns(numberPromise);
    var invokeWith = function (impl, value) {
        return returnsEmptyPromise.wrap(impl)(value);
    };

    context('resolves with no argument', function () {
        it('fulfills normally', function () {
            var impl = function () { return Promise.resolve(); };

            return invokeWith(impl)
                .should.be.fulfilledWith(undefined);
        });
    });

    context('resolves with a value', function () {
        it('returns a contract error', function () {
            var impl = function (value) { return Promise.resolve(value); };

            return invokeWith(impl, '0')
                .should.be.rejectedWith(c.ContractError);
        });
    });

    context('rejected with an error', function () {
        it('does not return a contract error', function () {
            var error = Error('boom');

            var impl = function (value) { return Promise.reject(value); };

            return invokeWith(impl, error)
                .should.be.rejectedWith(Error, { message: 'boom' });
        });
    });
});

describe('c.promise with optional results', function () {

    var optionalNumberPromise = c.promise({ result: c.optional(c.number) }).withError(c.string);
    var returnsOptionalNumberPromise = c.fun().returns(optionalNumberPromise);
    var invokeWith = function (impl, value) {
        return returnsOptionalNumberPromise.wrap(impl)();
    };

    context('resolves with no result', function () {
        it('fultills normally', function () {
            var impl = function () { return Promise.resolve(); };

            return invokeWith(impl)
                .should.be.fulfilledWith(undefined);
        });
    });

    context('resolves with a result', function () {
        it('fulfills normally', function () {
            var value = 0;

            var impl = function (value) { return Promise.resolve(value); };

            return invokeWith(impl, value)
                .should.be.fulfilledWith(value);
        });
    });

    context('resolves with an incorrect result', function () {
        it('rejects with a contract error', function () {
            var value = '0';

            var impl = function (value) { return Promise.resolve(value); };

            return invokeWith(impl, value)
                .should.be.rejectedWith(c.ContractError);
        });
    });

    context('invoked with an incorrect error', function () {
        it('rejects with a contract error', function () {
            var value = '0';

            var impl = function (value) { return Promise.reject(value); };

            return invokeWith(impl, value)
                .should.be.rejectedWith(c.ContractError);
        });
    });
});

describe('c.callback with a custom error contract', function () {

    var errorContract = c.array(c.error);
    var optionalNumberPromise = c.promise({ result: c.optional(c.number) }).withError(errorContract);
    var returnsOptionalNumberPromise = c.fun().returns(optionalNumberPromise);
    var invokeWith = function (impl, value) {
        return returnsOptionalNumberPromise.wrap(impl)();
    };

    context('invoked with a good error', function () {
        it('returns the error', function () {
            var goodErrors = [
                [Error(), Error()],
                [Error()],
                [],
            ];

            var impl = function (value) { return Promise.reject(value); };

            return Promise.all(
                goodErrors.map(function (badResult) {
                    return invokeWith(impl, badResult)
                        .should.be.rejectedWith(badResult);
                })
            );
        });
    });

    context('invoked with an incorrect error', function () {
        it('returns a contract error', function () {
            var badError = Error();

            var impl = function (value) { return Promise.reject(value); };

            return invokeWith(impl, badError)
                        .should.be.rejectedWith(c.ContractError);
        });
    });
});

// describe('c.callback.withDefaultError invoked with c.error', function () {
//     var newCallback = require('./node-style-callback').withDefaultError(c.error);
//     var contract = newCallback({ result: c.bool });
//     var wrapped = contract.wrap(function () { });

//     it('refuses string as an error', function () {
//         bad(function () { wrapped("boom"); });
//     });
//     it('accepts `Error()`s', function () {
//         good(function () { wrapped(Error()); });
//     });
//     it('accepts a success invocation', function () {
//         good(function () { wrapped(null, false); });
//     });
//     it('refuses an incorrect success invocation', function () {
//         bad(function () { wrapped(null, 5); });
//     });

// });
