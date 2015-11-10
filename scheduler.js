Scheduler = class Scheduler extends Mongo.Collection {
  constructor(config, collectionOptions={}) {
    check(config, Match.ObjectIncluding({
      name: String,
      collection: Mongo.Collection
    }));

    super(config.name, _.extend(collectionOptions, {
      transform: doc => {
        doc.queue = doc.queue.map(entry => _.extend(_.omit(entry, '_id'), {
          document: this.config.collection.findOne(entry._id),
        }));
        return doc;
      }
    }));

    this.config = _.defaults(config, {
      jobLimit: 28,
      query: {}
    });

    this.find(config.query).observe({
      added: function (doc) {
      }
    });
  }

  add(id) {
    check(id, String);

    return this.upsert({
      count: { $lt: this.config.jobLimit }
    }, {
      $push: {
        queue: {
          $each: [{
            _id: id,
            addedAt: new Date,
            status: 'ready'
          }],
          $sort: {
            addedAt: 1
          },
          $slice: this.config.jobLimit * -1
        }
      },
      $setOnInsert: {
        queue: [],
        count: 0
      },
      $inc: {
        count: 1
      }
    });
  }

  cancel(id) {
    check(id, String);

    return this.update({
      'queue._id': id
    }, {
      $pull: {
        'queue': {
          _id: id
        }
      },
      $inc: {
        count: -1
      }
    });
  }
}
