Package.describe({
  name: 'insightfil:scheduler',
  version: '0.0.7',
  summary: 'Manage batches of jobs',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use([
    'mongo',
    'underscore',
    'grigio:babel@0.1.7'
  ]);

  api.export('Scheduler');
  api.addFiles('scheduler.es6');
});

Package.onTest(function(api) {
  api.use(['practicalmeteor:munit', 'underscore']);
  api.use('insightfil:scheduler');
  api.addFiles('scheduler-tests.js');
});
