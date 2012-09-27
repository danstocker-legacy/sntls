/*global sntls, module, test, ok, equal, deepEqual, raises, expect */
(function (JournalingCollection) {
    module("Journaling collection");

    test("Logging", function () {
        var collection = JournalingCollection.create();

        expect(6);

        collection.set('i1', "foo");
        deepEqual(
            collection.log,
            [
                {
                    method: 'add',
                    name  : 'i1',
                    item  : "foo"
                }
            ],
            "History after first set"
        );

        collection.set('i2', "bar");
        deepEqual(
            collection.log,
            [
                {
                    method: 'add',
                    name  : 'i2',
                    item  : "bar"
                },
                {
                    method: 'add',
                    name  : 'i1',
                    item  : "foo"
                }
            ],
            "History after another set"
        );

        collection.unset('i1');
        deepEqual(
            collection.log,
            [
                {
                    method: 'remove',
                    name  : 'i1',
                    item  : "foo"
                },
                {
                    method: 'add',
                    name  : 'i2',
                    item  : "bar"
                },
                {
                    method: 'add',
                    name  : 'i1',
                    item  : "foo"
                }
            ],
            "History after unset"
        );

        collection.set('i2', "hello");
        deepEqual(
            collection.log,
            [
                {
                    method: 'change',
                    name  : 'i2',
                    item  : "hello"
                },
                {
                    method: 'remove',
                    name  : 'i1',
                    item  : "foo"
                },
                {
                    method: 'add',
                    name  : 'i2',
                    item  : "bar"
                },
                {
                    method: 'add',
                    name  : 'i1',
                    item  : "foo"
                }
            ],
            "History after changing existing item"
        );

        collection.resetLog();
        deepEqual(collection.log, [], "Log empty after reset");

        JournalingCollection.addMock({
            resetLog: function () {
                ok("Log re-set during clear");
            }
        });

        collection.clear();

        JournalingCollection.removeMocks();
    });

    test("Specified journ. collection", function () {
        var Specified = JournalingCollection.of(String),
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

        collection.unset('a');

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
                    name  : 'a',
                    item  : "foo"
                }
            ],
            "Removal registered"
        );
    });
}(sntls.JournalingCollection));
