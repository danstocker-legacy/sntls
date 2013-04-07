Sntls
=====

*Pronounced: "Essentials"*

A collection of general purpose classes and traits that formalize frequent operations or constructs such as collections, sets, profiling, stateful objects, etc.

Currently available:

- `sntls.OrderedList`: For manipulating order-retaining lists of numbers and strings.
- `sntls.OrderedStringList`: Same as `OrderedList` but with extra string-specific functionality.
- `sntls.Dictionary`: For managing dictionaries and lookups.
- `sntls.Collection`: Offers a way of handling multiple objects as if they were single objects of the same kind.
- `sntls.JournalingCollection`: Collection that records changes.
- `sntls.Profile`: Offers a way of gathering statistics in a multi-level fashion.
- `sntls.Profiled`: *Trait*, lets classes keep a profile.
- `sntls.StateMatrix`: Associates transitions between named states with arbitrary values.
- `sntls.Stateful`: *Trait*, adds state matrices to class, triggering specified methods on transitions.
- `sntls.Tree`: Accesses, traverses, and modifies tree-like object structures.

See the [Sntls wiki](https://github.com/danstocker/sntls/wiki) for reference and examples.

Planned (no guarantee that any of it will actually make it into the lib):

- `sntls.Set`: For simple set operations.
- `sntls.Memoized`: *Trait*, stores instances of the class it's applied to in a **global** registry.
- `sntls.Documented`: *Trait*, extending classes with essential meta information. (class name, GUID, inheritence path, etc)
