Sntls
=====

*Pronounced: "Essentials"*

A collection of general purpose classes and behaviors (class traits) such as collections, dictionaries, trees, ordered lists, profiling, stateful objects, etc.

Examples
--------

Splitting multiple strings at once

```javascript
sntls.Collection.of(String).create(['foo', 'bar'])
    .split('')
    .items // [['f', 'o', 'o'], ['b', 'a', 'r']]
```

Queries

```javascript
var whoKnowsWho = {
    "Joe": { knows: ["Al", "David", "Joan"] },
    "Al": { knows: ["Joe"] },
    "Joan": { knows: ["Joe", "Daniel", "Pam"] }
};

// first-degree connections of persons with name "J..." formed into sentences
sntls.Collection.create(whoKnowsWho)
    .filterByPrefix('J') // filtering items where keys start with "J"
    .toTree() // conversion to tree
    .queryPathValuePairsAsHash('|>knows'.toQuery()) // querying 'knows' nodes
    .toCollection(sntls.Collection.of(Array)) // and interpreting results as collection of arrays
    .join(' and ') // joining all items
    .mapContents(function (item, path) {
        return path.toPath().asArray[0] + " knows " + item; // forming sentences
    })
    .getValues() // ["Joe knows Al and David and Joan", "Joan knows Joe and Daniel and Pam"]
```

[JSFiddle](http://jsfiddle.net/danstocker/EmeEU/)

[Wiki](https://github.com/danstocker/sntls/wiki)

[Reference](http://danstocker.github.io/sntls/)
