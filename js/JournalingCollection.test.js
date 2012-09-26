/*global sntls, module, test, ok, equal, deepEqual, raises, expect */
(function (JournalingCollection) {
    module("Journaling collection");

    test("Logging", function () {
        var collection = JournalingCollection.create();

        collection.set('i1', "foo");
        deepEqual(
            collection.log,
            [
                {
                    method: 'add',
                    name: 'i1',
                    item: "foo"
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
                    name: 'i2',
                    item: "bar"
                },
                {
                    method: 'add',
                    name: 'i1',
                    item: "foo"
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
                    name: 'i1',
                    item: "foo"
                },
                {
                    method: 'add',
                    name: 'i2',
                    item: "bar"
                },
                {
                    method: 'add',
                    name: 'i1',
                    item: "foo"
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
                    name: 'i2',
                    item: "hello"
                },
                {
                    method: 'remove',
                    name: 'i1',
                    item: "foo"
                },
                {
                    method: 'add',
                    name: 'i2',
                    item: "bar"
                },
                {
                    method: 'add',
                    name: 'i1',
                    item: "foo"
                }
            ],
            "History after changing existing item"
        );
    });
}(sntls.JournalingCollection));
