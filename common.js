/**
 * @class Scheduler
 * @extends EventEmitter Mongo.Collection
 * @property {Array} jobs all of the jobs that are ready.
 */
const defaultConfig = {
  jobLimit: 28,
  removeOnComplete: false,
  selector: {}
};

Scheduler = class Scheduler extends Mongo.Collection {
  constructor(name, collection, options=defaultConfig) {
    check(name, String);
    check(collection, Mongo.Collection);
    check(options, Match.ObjectIncluding({}));

    super(name, options);
    _.extend(this, new EventEmitter());

    if (Meteor.isServer) {
      this.observer = collection.find(options.selector).observeChanges({
        added: this.queue.bind(this),
        removed: this.dequeue.bind(this)
      });
    }

    this.config = options;
  }

  get settings() {
    return this.config;
  }

  configure(settings) {
    check(settings, Match.ObjectIncluding({}));
    this.config = Object.assign(this.config, settings);
  }

  get jobs() {
    return this.find()
      .map(doc => doc.queue.filter(job => job.status === 'queued'))
      .reduce((result, obj) => [...result, ...obj], []);
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
        count: { $lt: this.config.jobLimit }
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
            $slice: this.config.jobLimit,
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

    if (this.config.removeOnComplete) {
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
