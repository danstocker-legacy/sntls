Sntls
=====

*Pronounced: "Essentials"*

A collection of general purpose classes and behaviors (class traits) such as collections, dictionaries, trees, ordered lists, profiling, stateful objects, etc.

[Wiki](https://github.com/danstocker/sntls/wiki)

[Reference](http://danstocker.github.io/sntls/)

Examples
--------

[JSFiddle](http://jsfiddle.net/danstocker/EmeEU/)

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
    .mapContents(function (item, path) {
        return path.toPath().asArray[0] + " knows " + item;
    })
    .getValues()

    // [
    //  "Joe knows Al and David and Joan",
    //  "Joan knows Joe and Daniel and Pam"
    // ]
```
