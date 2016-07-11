/* global Promise */

var c = require('./promise').mixin(require('rho-contracts-fork'));

require('should');

describe('c.promise with a number result', function () {

    var returnsNumberPromise = c.fun().returnsPromise(c.number);
    var invoke = function (impl) {
        return returnsNumberPromise.wrap(impl)();
    };

    context('rejected with an error', function () {
        it('does not return a contract error', function () {
            var error = Error('boom');

            var impl = function () { return Promise.reject(error); };

            return invoke(impl)
                .should.be.rejectedWith(Error, { message: 'boom' });
        });
    });

    context('resolved with a number result', function () {
        it('does not return a contract error', function () {
            var result = 0;

            var impl = function () { return Promise.resolve(result); };

            return invoke(impl)
                .should.be.fulfilledWith(result);
        });
    });

    context('resolved with a bad result', function () {
        it('returns a contract error', function () {
            var badResults = ['0', null, undefined];

            return Promise.all(
                badResults.map(function (badResult) {
                    var impl = function () { return Promise.resolve(badResult); };

                    return invoke(impl)
                        .should.be.rejectedWith(c.ContractError);
                })
            );
        });
    });
});

describe('c.promise with no result', function () {

    var returnsEmptyPromise = c.fun().returnsPromise(c.value(undefined));
    var invoke = function (impl) {
        return returnsEmptyPromise.wrap(impl)();
    };

    context('resolves with no argument', function () {
        it('fulfills normally', function () {
            var impl = function () { return Promise.resolve(); };

            return invoke(impl)
                .should.be.fulfilledWith(undefined);
        });
    });

    context('resolves with a value', function () {
        it('returns a contract error', function () {
            var value = '0';

            var impl = function () { return Promise.resolve(value); };

            return invoke(impl)
                .should.be.rejectedWith(c.ContractError);
        });
    });

    context('rejected with an error', function () {
        it('does not return a contract error', function () {
            var error = Error('boom');

            var impl = function () { return Promise.reject(error); };

            return invoke(impl)
                .should.be.rejectedWith(Error, { message: 'boom' });
        });
    });
});

describe('c.promise with optional results', function () {

    var returnsOptionalNumberPromise = c.fun().returnsPromise(c.optional(c.number));
    var invoke = function (impl) {
        return returnsOptionalNumberPromise.wrap(impl)();
    };

    context('resolves with no result', function () {
        it('fultills normally', function () {
            var impl = function () { return Promise.resolve(); };

            return invoke(impl)
                .should.be.fulfilledWith(undefined);
        });
    });

    context('resolves with a result', function () {
        it('fulfills normally', function () {
            var value = 0;

            var impl = function () { return Promise.resolve(value); };

            return invoke(impl)
                .should.be.fulfilledWith(value);
        });
    });

    context('resolves with an incorrect result', function () {
        it('rejects with a contract error', function () {
            var value = '0';

            var impl = function () { return Promise.resolve(value); };

            return invoke(impl)
                .should.be.rejectedWith(c.ContractError);
        });
    });

    context('invoked with an incorrect error', function () {
        it('rejects with a contract error', function () {
            var value = '0';

            var impl = function () { return Promise.reject(value); };

            return invoke(impl)
                .should.be.rejectedWith(c.ContractError);
        });
    });
});

describe('c.callback with a custom error contract', function () {

    var errorContract = c.array(c.error);
    var returnsCustomErrorPromise = c.fun().returnsPromise(c.optional(c.number)).withError(errorContract);
    var invoke = function (impl) {
        return returnsCustomErrorPromise.wrap(impl)();
    };

    it('displays a good description', function () {
        returnsCustomErrorPromise.toString().should.eql(
            'c.fun( -> Promise(c.optional(c.number)).withError(c.array(c.error))');
    });

    context('invoked with a good error', function () {
        it('returns the error', function () {
            var goodErrors = [
                [Error(), Error()],
                [Error()],
                [],
            ];

            return Promise.all(
                goodErrors.map(function (goodError) {
                    var impl = function () { return Promise.reject(goodError); };

                    return invoke(impl)
                        .should.be.rejectedWith(goodError);
                })
            );
        });
    });

    context('invoked with an incorrect error', function () {
        it('returns a contract error', function () {
            var badError = Error();

            var impl = function () { return Promise.reject(badError); };

            return invoke(impl)
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
