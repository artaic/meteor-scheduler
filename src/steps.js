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
    this.current = this.next();
  }
  /**
   * Checks the given set of steps on initialization to see if they're valid
   * Each step must contain:
   *   - name {String} the name of the step
   *   - complete {Boolean} the state of the step.
   * Optional properties for each step are:
   *   - tasks {[Object]}
   *     A list containing steps, where steps have the same format listed here (recursive definition)
   *     Each task can also contain tasks. This is a tree-like structure.
   *   - description {String} a string (example: 'Cut tomatoes into 1/4 inch thick cubes')
   *
   * @private
   * @module Steps
   * @function Steps#_isStepsValid
   *
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
          return tasks.length > 0 && this._isStepsValid(tasks);
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
