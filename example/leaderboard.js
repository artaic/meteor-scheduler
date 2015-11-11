Games = new Mongo.Collection('orders');
Players = new Mongo.Collection('customers');
Characters = new Mongo.Collection('characters');
PlayerQueue = new Scheduler('player_queue', Players);

if (Meteor.isClient) {
  Template.jobs.helpers({
    ready: () => Template.instance().gameReady.get(),
    queue: () => PlayerQueue.find()
  });

  Template.jobs.events({
    'click button[data-action="join-game"]': function (e, template) {
    }
  });

  Template.jobs.onRendered(function () {
    this.gameReady = new ReactiveVar(false);
    PlayerQueue.on('');
  });
} else {
  Meteor.startup(function () {
    [{
      name: 'Genji',
      url: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcS16yESVbqTvFQRs0yfFUMppNdRNJJq82li4yu5D35AokXkP7vd'
    }].forEach(character => Characters.upsert({ name: character.name }, { $set: character }));

    Players.upsert({
      name: 'Steve',
    }, {
      $set: { status: 'ready' },
      $setOnInsert: { score: 0 }
    });
  });
}
