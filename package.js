Package.describe({
  name: 'insightfil:scheduler',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use(['grigio:babel', 'mongo', 'underscore']);
  api.export('Scheduler');
  api.addFiles('scheduler.es6');
});

Package.onTest(function(api) {
  api.use(['practicalmeteor:munit', 'underscore']);
  api.use('insightfil:scheduler');
  api.addFiles('scheduler-tests.js');
});

