/**
 * Iterator like functions for managing steps on each schedule.
 *
 * @class Steps
 */
Steps = class Steps {
  constructor(steps) {
    if (!this._isStepsValid(steps)) {
      throw new Meteor.Error(400, 'Invalid steps definition');
    }
    this.steps = steps;
    this.current = steps;
  }
  /**
   * Checks the given set of steps on initialization to see if they're valid
   * Each step should have a name, optional description, and a completion state
   * Optionally, it can have an array called "tasks" that references child tasks to complete
   *
   * @function Steps#_isStepsValid
   * @module Steps
   * @private
   * @param {Array} steps the steps to check
   * @returns {Boolean} the validity of the given object
   */
  _isStepsValid(steps) {
    for (let step of steps) {
      const isValid = Match.test(step, Match.ObjectIncluding({
        name: String,
        description: Match.Optional(String),
        complete: Boolean,
        tasks: Match.Optional(Match.Where(function (tasks) {
          check(tasks, [Object]);
          return tasks.length > 0;
        }))
      }));

      if (!isValid) {
        return false;
      }

      if (step.tasks instanceof Array && !step.complete) {
        return this.next(step.tasks);
      }
    }
    return true;
  }
  /**
   * Sets the current step to the next incomplete step
   * The next available step is defined as the deepest step that _is not complete_ and _does not have child tasks_
   *
   * @module Steps
   * @function Steps#next
   * @returns {Object}
   */
  next(steps=this.current) {
    for(let step of steps) {
      if (step.tasks instanceof Array && !step.complete) {
        return this.next(step.tasks);
      }
      return this.current = step;
    }
  }
  /**
   * Sets the current step to the previous step
   */
  previous(steps=this.steps) {
  }
}
