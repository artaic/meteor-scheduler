describe('Initialization and configuration', function () {
  it('Should export an object', function (test) {
    test.instanceOf(Scheduler, Object);
  });

  it('Should have a configuration', function (test) {
    test.instanceOf(Scheduler.config, Object);
  });

  it('Should be able to change the configuration', function (test) {
    test.equal(Scheduler.config.jobsPerCycle, 28, 'Should be set to its default'); // default value
    Scheduler.configure({ jobsPerCycle: 4 });
    test.equal(Scheduler.config.jobsPerCycle, 4, 'Should be changed to four');
  });
});

describe('Test fetching and adding cycles', function () {
  beforeAll(function () {
    stubs.restoreAll();
    spies.restoreAll();
  });
  it('should initialize with no cycles', function (test) {
    test.equal(Scheduler.cycles.find().count(), 0);
  });
});

describe('Test job adding and removal', function () {
  beforeAll(function () {
    stubs.restoreAll();
    spies.restoreAll();
  });
  beforeEach(function (test) {
    stubs.create('findOne', Scheduler.cycles, 'findOne');
    stubs.create('addJob', Scheduler, 'addJob');
  });
  it('Should be able to add a job', function (test) {
    console.log(stubs.addJob);
    stubs.addJob('1');
    console.log(stubs.findOne());
  });
});

