/**
 * @class Scheduler
 * @extends EventEmitter Mongo.Collection
 * @property {Array} jobs all of the jobs that are ready.
 */
const defaultConfig = {
  jobLimit: 28,
  removeOnComplete: false,
  selector: {},
};

Scheduler = class Scheduler extends Mongo.Collection {
  constructor(name, collection, options) {
    check(name, String);
    check(collection, Mongo.Collection);

    const config = Object.assign(defaultConfig, options);
    super(name, config);
    this.transform = function (doc) {
      console.log(doc);
      console.log(this);
    }

    _.extend(this, new EventEmitter());
    this._config = config;

    if (Meteor.isServer) {
      this.observer = collection.find(this._config.selector).observeChanges({
        added: this.queue.bind(this),
        removed: this.dequeue.bind(this)
      });
    }
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
      this.upsert({
        count: { $lt: this._config.jobLimit }
      }, {
        $setOnInsert: {
          queue: [],
          createdAt: new Date,
          count: 0
        },
        $addToSet: {
          queue: {
            $each: [{
              _id: id,
              addedAt: new Date,
              status: 'queued'
            }],
            $slice: this._config.jobLimit,
            $sort: { addedAt: 1 }
          }
        },
        $inc: { count: 1 }
      });
      this.emit('job added', id);
    }
  }

  dequeue(id) {
    check(id, String);
    return this.update({
      'queue._id': id
    }, {
      $pull: {
        'queue': {
          _id: id
        }
      },
      $inc: { count: -1 }
    });
  }

  complete(id) {
    check(id, String);

    if (this._config.removeOnComplete) {
      return this.update({
        'queue._id': id
      }, {
        $set: {
          'queue.$.status': 'complete'
        }
      });
    } else {
      this.remove({ 'queue._id': id });
    }
    this.emit('job complete', id);
  }

  lockCycle(id) {
    check(id, String);
    this.update(id, {
      $set: { status: 'locked' }
    });
    this.emit('cycle locked', id);
  }
}
