Package.describe({
  name: 'insightfil:scheduler',
  version: '0.0.8',
  summary: 'Manage batches of jobs',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');

  api.use([
    'mongo',
    'ecmascript',
    'underscore',
    'raix:eventemitter',
  ]);

  api.export(['Scheduler', 'Steps']);
  api.addFiles(['scheduler.js', 'steps.js', 'agenda.js']);
});

Package.onTest(function(api) {
  api.use(['practicalmeteor:munit', 'underscore']);
  api.use('insightfil:scheduler');
  api.addFiles('scheduler-tests.js');
});
