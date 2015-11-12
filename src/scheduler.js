/**
 * @class Scheduler
 * @extends EventEmitter Mongo.Collection
 * @property {Array} jobs all of the jobs that are ready.
 */
const defaultConfig = {
  jobLimit: 28,
  removeOnComplete: false,
  selector: {},
  defaultEstimate: 60000
};

Scheduler = class Scheduler extends Mongo.Collection {
  constructor(collection, name, options) {
    check(collection, Mongo.Collection);
    check(name, String);

    console.log(name);

    let config = Object.assign(defaultConfig, options);

    super(name, config);
    this._config = config;

    _.extend(this, new EventEmitter());

    if (Meteor.server && !super.connection) {
      this._observer = collection.find(this._config.selector).observeChanges({
        added: id => this.queue.call(this, id),
        removed: id => this.dequeue.call(this, id)
      });
    }

    this._cycleWatcher = this.find({ count: config.jobLimit }).observeChanges({
      added: id => this.emit('cycle ready', id)
    });
  }

  get config() {
    return this._config;
  }

  get jobs() {
    return this.find()
      .map(doc => doc.queue.filter(job => job.status === 'queued'))
      .reduce((result, obj) => [...result, ...obj], []);
  }

  configure(settings) {
    check(settings, Match.ObjectIncluding({}));
    this._config = Object.assign(this._config, settings);
  }

  queue(id) {
    check(id, String);

    if (this.findOne({ 'queue._id': id })) {
      this.update({
        'queue._id': id
      }, {
        $set: {
          'queue.$.status': 'queued'
        }
      });
    } else {
      let res = this.upsert({
        locked: false,
        count: { $lt: this._config.jobLimit }
      }, {
        $setOnInsert: {
          queue: [],
          createdAt: new Date,
          count: 0,
          numberComplete: 0,
          locked: false,
          timeEstimate: 0
        },
        $addToSet: {
          queue: {
            $each: [{
              _id: id,
              addedAt: new Date,
              status: 'queued',
              timeEstimate: this.config.defaultEstimate
            }],
            $slice: this._config.jobLimit,
            $sort: { addedAt: 1 }
          }
        },
        $inc: {
          count: 1,
          timeEstimate: this.config.defaultEstimate
        }
      });

      this.emit('job added', id);
      if (res.insertedId) {
        this.emit('cycle added', res.insertedId);
      }
    }
  }

  dequeue(id) {
    check(id, String);
    this.update({
      locked: false,
      'queue._id': id
    }, {
      $pull: {
        'queue': { _id: id }
      },
      $inc: { count: -1 }
    });
    this.emit('job removed', id);
  }

  complete(id) {
    check(id, String);
    this.update({
      'queue._id': id
    }, {
      $set: { 'queue.$.status': 'complete' },
      $inc: { numberCompleted: 1 }
    });
    this.emit('job complete', id);
  }

  lockCycle(id) {
    check(id, String);
    this.update(id, {
      $set: { locked: true }
    });
    this.emit('cycle locked', id);
  }

  unlockCycle(id) {
    check(id, String);
    this.update(id, {
      $set: { locked: false }
    });
    this.emit('cycle unlocked');
  }

  nextAvailable() {
    return this.findOne({}, { sort: { createdAt: -1 } });
  }

  /**
   * Constructs a calendar between two time ranges.
   */
  calendar(startTime, endTime) {
  }

  getCycleForJob(id) {
    return this.findOne({
      'queue._id': id
    });
  }
}
