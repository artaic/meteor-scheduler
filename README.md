# Scheduler

This is a basic scheduler for making "batches" of jobs. Here is an
example of what you can expect.

```
// sets the max jobs per cycle to 5 (default: 28)
// mostly because I don't want to type too much.
Scheduler.configure({
  jobsPerCycle: 5
});

// gets whatever cycle is currently available.
// if no cycles are available, it will return a new cycle.
Scheduler.getAvailableCycle();
{
  _id: "1",
  createdAt: ISODate(),
  jobs: [],
  jobCount: 0
}

// adds a few jobs to the cycle
Scheduler.addJob("1");
Scheduler.addJob("2");
Scheduler.addJob("3");

// now, getNextAvailableCycle will return this cycle because it's not
yet full
Scheduler.getAvailableCycle();
{
  _id: "1",
  createdAt: ISODate(),
  jobs: ["1", "2", "3"],
  jobCount: 3
}

// trying to add a duplicate job will result in an error
Scheduler.addJob("1");
> Error: Can't add duplicate jobs

// you can still remove jobs
// will return the number of documents updated, which should be 1 or 0
Scheduler.removeJob("1");
> 1

// it will add cycles as needed
_.each(_.range(4, 10), function (i) {
  Scheduler.addJob(i);
});

// view the cycles. Returns a cursor, so you have to fetch.
Scheduler.getCycles().fetch();
[{
  _id: "1",
  createdAt: ISODate,
  jobs: ["2", "3", "4", "5", "6"],
  jobCount: 5
}, {
  _id: "2",
  createdAt: ISODate,
  jobs: ["7", "8", "9"],
  jobCount: 3
}]
```


