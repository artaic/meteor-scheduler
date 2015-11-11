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
  connection: DDP.connect('http://localhost:4000/')
});
```

#### name {String}
name of the collection in the database

#### collection {Mongo.Collection}
The collection to watch.

#### options {Object}
- selector [{}] {Object}

The selector to watch. In the above example, it will wait for all
players who are online and ready to add to the queue

- jobLimit [28] {Number}

The number that should be allowed in the queue before created a new
batch.

- defaultEstimate [60000] {Number}

The number of milliseconds estimated for each job

_note_ `idGeneration`, `connection`, and `transform` will be passed to
the Collection instance on the `super` call (scheduler.js, line 18)

## Properties

- [Scheduler]#jobs

Returns all the jobs that are queued, sorted by the date they were
added.

- [Scheduler]#config

The current configuration

## Events

- **locked**

Once a cycle is set to locked, it will no longer automatically queue
documents.

Passes no parameters to the callback function.

- **unlocked**

Things can now be queued and dequeued.

- **cycle full**

Occurs when a cycle has reached the `config.limit` amount of jobs.
This will pass the `_id` of the cycle to the callback function.

- **cycle added**

Occurs when a new cycle has been inserted
passes the `_id` of the cycle to the callback.
