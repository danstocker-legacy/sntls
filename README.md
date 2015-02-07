Sntls
=====

*Pronounced: "Essentials"*

A collection of general purpose classes and behaviors (class traits) such as collections, dictionaries, trees, ordered lists, etc. The purpose of **Sntls** is to turn routines performed on multitudes (of data entries or class instances) into a series of linear transformations, akin to the CQS style of jQuery. The goal of Sntls is to make such complex transformations easy to follow and modify.

[Wiki](https://github.com/danstocker/sntls/wiki)

[Reference](http://danstocker.github.io/sntls/)

[Npm package](https://www.npmjs.com/package/sntls)

Examples
--------

[JSFiddle](http://jsfiddle.net/danstocker/EmeEU/)

**Splitting multiple strings at once**

    sntls.Collection.of(String).create(['foo', 'bar'])
        .split('')
        .items // [['f', 'o', 'o'], ['b', 'a', 'r']]

**Queries**

    var whoKnowsWho = {
        "Joe": { knows: ["Al", "David", "Joan"] },
        "Al": { knows: ["Joe"] },
        "Joan": { knows: ["Joe", "Daniel", "Pam"] }
    };

    // first-degree connections of persons with names like "J..."
    sntls.Collection.create(whoKnowsWho)
        // filtering items where keys start with "J"
        .filterByPrefix('J')
        // re-interpreting as Tree
        .toTree()
        // querying 'knows' nodes
        .queryPathValuePairsAsHash('|>knows'.toQuery())
        // and interpreting results as collection of arrays
        .toCollection(sntls.Collection.of(Array))
        .join(' and ') // joining all items
        // forming sentences
        .mapValues(function (item, path) {
            return path.toPath().asArray[0] + " knows " + item;
        })
        .getValues()

        // [
        //  "Joe knows Al and David and Joan",
        //  "Joan knows Joe and Daniel and Pam"
        // ]
