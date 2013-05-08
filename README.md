Sntls
=====

*Pronounced: "Essentials"*

A collection of general purpose classes and behaviors (class traits) such as collections, sets, profiling, stateful objects, etc.

Currently available:

- `sntls.Hash`: Base for all data-manipulating classes.
- `sntls.OrderedList`: For manipulating order-retaining lists of numbers and strings.
- `sntls.OrderedStringList`: Same as `OrderedList` but with extra string-specific functionality.
- `sntls.Dictionary`: For managing dictionaries and lookups.
- `sntls.Collection`: Offers a way of handling multiple objects as if they were single objects of the same kind.
- `sntls.JournalingCollection`: Collection that records changes.
- `sntls.Profile`: Offers a way of gathering statistics in a multi-level fashion.
- `sntls.Profiled`: *Behavior*, lets classes keep a profile.
- `sntls.StateMatrix`: Associates transitions between named states with arbitrary values.
- `sntls.Stateful`: *Behavior*, adds state matrices to class, triggering specified methods on transitions.
- `sntls.Path`: Represents paths within a tree-like structure.
- `sntls.Tree`: Accesses, traverses, and modifies tree-like object structures.

See the [Sntls wiki](https://github.com/danstocker/sntls/wiki) for reference and examples.

Planned (no guarantee that any of it will actually make it into the lib):

- `sntls.Set`: For simple set operations.
- `sntls.Documented`: *Behavior*, extending classes with essential meta information. (class name, GUID, inheritence path, etc)
