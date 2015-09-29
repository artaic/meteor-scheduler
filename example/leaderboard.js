if (Meteor.isClient) {
  Template.jobs.helpers({
    cycles: function () {
      return Scheduler.getCycles();
    },
    duration: function (timeEstimate) {
      return moment.duration(timeEstimate).humanize();
    }
  });

  Template.jobs.events({
    'submit form.add-job': function (e, template) {
      e.preventDefault();

      let jobId = $(e.target).find('input[name="job-id"]').val();
      Meteor.call('addJob', jobId);
    }
  });
} else {
  Meteor.methods({
    'addJob': function (jobId) {
      check(jobId, String);
      Scheduler.addJob(jobId);
    }
  });
}
