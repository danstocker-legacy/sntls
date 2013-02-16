Sntls
=====

*Pronounced: "Essentials"*

A collection of general purpose classes and traits that formalize frequent operations or constructs such as collections, sets, profiling, stateful objects, etc.

Currently available:

- `sntls.Collection`: Offers to use collections of objects as if they were single objects.
- `sntls.JournalingCollection`: Collection that records changes
- `sntls.Profile`: Registers a set of counters that objects may increase or decrease. Offers a way of gathering statistics.
- `sntls.Profiled`: *Trait* allowing such objects to be profiled and/or contribute to profiles of other objects.

See the [Sntls wiki](https://github.com/danstocker/sntls/wiki) for reference and examples.

In the making:

- `sntls.Set`: For simple set operations.
- `sntls.Stateful`: *Trait* allowing objects to define a state matrix and events to be called on transitions between states.
