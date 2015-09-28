/**
 * @module Scheduler
 *
 * @property {Object} config the configuration object
 * @property {Number} config.jobsPerCycle how many jobs to add on each cycle
 * @property {Boolean} config.useTimeEstimates Whether or not to add estimates to the time.
 * @property {Mongo.Collection} Scheduler#cycles the collection of cycles
 */

let initialState = {
  jobs: [],
  jobCount: 0,
  createdAt: new Date,
  status: 'open',
  numberCompleted: 0
}

Scheduler = {
  config: {
    jobsPerCycle: 28,
    useTimeEstimates: true,
    defaultTimeEstimate: 60 * 1000,
    collectionOptions: {}
  },
  cycles: new Mongo.Collection('scheduled_jobs'),

  /**
   * Change configuration options.
   *
   * @method Scheduler#configure
   * @param {Object} conf the configuration object to use
   * @example
   * Scheduler.configure({
   *   jobsPerCycle: 2
   * });
   */
  configure: function (conf) {
    check(conf, Object);
    _.extend(this.config, conf);
  },

  /**
   * Updates the current status of a job to "completed".
   * Updates the count of completed cycles.
   *
   * @method Scheduler#setJobCompleted
   * @param {String} jobId the id of the job to find.
   * @throws Match.Error if the job id is not a string.
   * @returns {Number} the result of the Mongo operation.
   */
  setJobCompleted: function (jobId) {
    check(jobId, String);

    return this.cycles.update({
      'jobs._id': jobId
    }, {
      $set: { 'jobs.$.status': 'completed' },
      $inc: { 'numberCompleted': 1 }
    });
  },

  /**
   * Gets the _id of every job in a cycle that is open.
   *
   * @method Scheduler#getJobQueue
   * @param {String} cycleId the id of the job to find.
   * @throws Match.Error if the job id is not a string.
   * @returns {Array} an array of _ids representing the open jobs.
   */
  getJobQueue: function (cycleId) {
    check(cycleId, String);
    return _.pluck(_.filter(this.cycles.findOne(cycleId).jobs, { status: 'open' }), '_id');
  },

  /**
   * Gets whatever cycle is currently available.
   * If none are available, it will create a new cycle and return that
   *
   * @method Scheduler#getAvailableCycle
   * @returns {Object} The mongo document of the next available cycle
   */
  getAvailableCycle: function () {
    let cycle = Scheduler.cycles.findOne({
      jobCount: {
        $lt: this.config.jobsPerCycle
      }
    });
    if (cycle) {
      return cycle;
    } else {
      return this.cycles.findOne(this.cycles.insert(initialState));
    }
  },

  /**
   * Adds a job any available cycle
   *
   * @method Scheduler#addJobToCycle
   * @param {String} docId the id of the document to add as a job
   * @param {Number} estimate the estimate until completion. This defaults to one minute
   *
   * @todo make the time estimates optional
   * @todo make first parameter available as object or array (currently only string)
   * @todo add a priority marker
   */
  addJob: function (docId, estimate) {
    check(docId, Match.OneOf(String));
    var estimate = estimate || this.config.defaultTimeEstimate;
    check(estimate, Number);

    if (this.cycles.findOne({ 'jobs._id': docId })) {
      throw new Meteor.Error(500, `Job already exists, cannot insert duplicate jobs ${docId}`);
    }

    this.cycles.upsert({
      jobCount: {
        $lt: this.config.jobsPerCycle
      }
    }, {
      $setOnInsert: initialState,
      $push: {
        jobs: {
          $each: [{
            _id: docId,
            addedAt: new Date,
            timeEstimate: estimate,
            status: 'open'
          }],
          $sort: { addedAt: 1 },
          $slice: this.config.jobsPerCycle * -1
        }
      },
      $inc: {
        jobCount: 1,
        timeEstimate: estimate
      }
    });
  },

  /**
   * Remove a job from any cycles it occurs in.
   *
   * @method Scheduler#removeJob
   * @returns {Number} the number of documents successfully updated. Should be 1 or 0.
   */
  removeJob: function (jobId) {
    let job = this.cycles.findOne({
      'jobs._id': jobId
    }, {
      fields: {
        'jobs.$': 1
      }
    });

    return this.cycles.update({
      'jobs._id': jobId
    }, {
      $pull: {
        jobs: {
          _id: jobId
        }
      },
      $inc: {
        jobCount: -1,
      }
    });
  },

  /**
   * Find the entire cycle for a job
   *
   * @method Scheduler#getCycleForJob
   * @param {String} jobId the id of the job to find.
   * @returns {Object} the cycle containing the job
   */
  getCycleForJob: function (jobId) {
    return this.cycles.findOne({
      'jobs._id': jobId
    });
  },

  /**
   * returns all the cycles. Can provide mongo-style query and projection
   *
   * @method Schedule#getCycles
   * @param {Object} query the mongo query to use. Optional.
   * @param {Object} projection the mongo style projection to use. Optional.
   * @returns {Mongo.Cursor} a cursor of cycles
   */
  getCycles: function (query={}, projection={}) {
    check(query, Object);
    check(projection, Object);
    return this.cycles.find(query, projection);
  },

  getCycle: function (cycleId) {
    check(cycleId, String);
    return this.cycles.findOne(cycleId);
  }
};

