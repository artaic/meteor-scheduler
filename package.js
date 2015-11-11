Package.describe({
  name: 'insightfil:scheduler',
  version: '0.1.0',
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
    'raix:eventemitter',
  ]);

  api.use('cosmos:browserify', 'client');
  api.addFiles('src/babel-polyfill.browserify.js', 'client');

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

Npm.depends({
  'babel-polyfill': '6.1.4'
});
