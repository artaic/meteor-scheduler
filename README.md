# Scheduler

A little library for scheduling "batches" of jobs based on actions on
some collection

## Basic usage

```
Players = new Mongo.Collection('players');
PlayerQueue = new Scheduler('player_queue', Players, {
  selector: {
    $and: [
      { online: true },
      { status: 'ready' }
    ]
  },
  collection
  connection: DDP.connect('http://localhost:4000/')
});
```

#### name {String}
name of the collection in the database

#### collection {Mongo.Collection}
The collection to watch

#### options {Object}
- selector
The selector to watch. In the above example, it will wait for all
players who are online and ready to add to the queue

*_special note_*
if something is _removed_ from this collection, it will also be removed
from the schedule.


## Events

```
locked
```
Occurs when a cycle has become locked. When a cycle is locked, it will
not be added to or removed from automatically.

Passes no parameters to the callback function.

```
cycle full
```
Occurs when a cycle has reached the `config.limit` amount of jobs.
This will pass the `_id` of the cycle to the callback function.

```
cycle added
```
Occurs when a new cycle has been inserted
passes the `_id` of the cycle to the callback.
