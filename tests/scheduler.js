Tinytest.add('Scheduler should be defined', function (test) {
  test.isNotUndefined(Scheduler);
});

Tinytest.add('Should be able to instance a scheduler', function (test) {
  let Fake = new Mongo.Collection();
  let Watcher = new Scheduler('watch_fake', Fake);
  test.isNotUndefined(Watcher);
});
