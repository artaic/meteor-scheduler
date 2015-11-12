Package.describe({
  name: 'insightfil:scheduler',
  version: '0.2.0',
  summary: 'Manage batches of jobs',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');

  api.use([
    'mongo',
    'check',
    'ecmascript',
    'underscore',
    'raix:eventemitter@0.1.3',
  ]);

  api.export(['Scheduler', 'Steps']);
  api.addFiles([
    'src/scheduler.js',
    'src/steps.js',
    'src/agenda.js'
  ]);
});

Package.onTest(function(api) {
  api.use(['tinytest', 'ecmascript', 'mongo']);
  api.use('insightfil:scheduler');
  api.addFiles('tests/scheduler.js');
});
