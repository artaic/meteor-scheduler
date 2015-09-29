Package.describe({
  name: 'insightfil:scheduler',
  version: '0.0.8',
  summary: 'Manage batches of jobs',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.2');

  api.use([
    'mongo',
    'underscore',
    'ecmascript'
  ]);

  api.export('Scheduler');
  api.addFiles('scheduler.js');
});

Package.onTest(function(api) {
  api.use(['practicalmeteor:munit', 'underscore']);
  api.use('insightfil:scheduler');
  api.addFiles('scheduler-tests.js');
});
