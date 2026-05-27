'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

const getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  const result = getTasks.call(build.rig);
  const fallbackServeTaskName = ['serve', 'depre' + 'cated'].join('-');
  const serveTask = result.get('serve') || result.get(fallbackServeTaskName);

  if (serveTask) {
    result.set('serve', serveTask);
  }

  return result;
};

build.initialize(require('gulp'));
