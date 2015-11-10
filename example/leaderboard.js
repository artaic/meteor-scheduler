Games = new Mongo.Collection('orders');
Players = new Mongo.Collection('customers');
PlayerQueue = new Scheduler({
  name: 'player_queue',
  collection: Players
});

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
  Meteor.startup(function () {
    Players.upsert({
      name: 'Steve'
    }, {
      $set: { name: 'Steve' },
      $setOnInsert: { score: 0 }
    });
  });
}
