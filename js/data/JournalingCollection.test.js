/*global sntls, module, test, ok, equal, strictEqual, deepEqual, raises, expect */
(function () {
    "use strict";

    module("Journaling collection");

    test("Type conversion", function () {
        var hash = sntls.Hash.create(),
            collection = hash.toJournalingCollection();

        ok(collection.isA(sntls.JournalingCollection), "Hash converted to journaling collection");
    });

    test("Array conversion", function () {
        var buffer = [1, 2, 3, 4],
            hash = buffer.toJournalingCollection();

        ok(hash.isA(sntls.JournalingCollection), "Is journaling collecton");
        strictEqual(hash.items, buffer, "Same buffer");
    });

    test("Logging", function () {
        var collection = sntls.JournalingCollection.create();

        expect(6);

        collection.setItem('i1', "foo");
        deepEqual(
            collection.log,
            [
                {
                    method: 'add',
                    key   : 'i1',
                    item  : "foo"
                }
            ],
            "History after first set"
        );

        collection.setItem('i2', "bar");
        deepEqual(
            collection.log,
            [
                {
                    method: 'add',
                    key   : 'i2',
                    item  : "bar"
                },
                {
                    method: 'add',
                    key   : 'i1',
                    item  : "foo"
                }
            ],
            "History after another set"
        );

        collection.deleteItem('i1');
        deepEqual(
            collection.log,
            [
                {
                    method: 'remove',
                    key   : 'i1',
                    item  : "foo"
                },
                {
                    method: 'add',
                    key   : 'i2',
                    item  : "bar"
                },
                {
                    method: 'add',
                    key   : 'i1',
                    item  : "foo"
                }
            ],
            "History after unset"
        );

        collection.setItem('i2', "hello");
        deepEqual(
            collection.log,
            [
                {
                    method: 'change',
                    key   : 'i2',
                    item  : "hello"
                },
                {
                    method: 'remove',
                    key   : 'i1',
                    item  : "foo"
                },
                {
                    method: 'add',
                    key   : 'i2',
                    item  : "bar"
                },
                {
                    method: 'add',
                    key   : 'i1',
                    item  : "foo"
                }
            ],
            "History after changing existing item"
        );

        collection.resetLog();
        deepEqual(collection.log, [], "Log empty after reset");

        sntls.JournalingCollection.addMocks({
            resetLog: function () {
                ok("Log re-set during clear");
            }
        });

        collection.clear();

        sntls.JournalingCollection.removeMocks();
    });

    test("Specified journ. collection", function () {
        var Specified = sntls.JournalingCollection.of(String),
            collection = Specified.create({
                a: "foo",
                b: "bar"
            });

        deepEqual(
            collection.split('').items,
            {
                a: ['f', 'o', 'o'],
                b: ['b', 'a', 'r']
            },
            "Specified collection OK"
        );

        deepEqual(collection.log, [], "No log change");

        collection.deleteItem('a');

        deepEqual(
            collection.split('').items,
            {
                b: ['b', 'a', 'r']
            },
            "Specified collection after removal"
        );

        deepEqual(
            collection.log,
            [
                {
                    method: 'remove',
                    key   : 'a',
                    item  : "foo"
                }
            ],
            "Removal registered"
        );
    });
}());
