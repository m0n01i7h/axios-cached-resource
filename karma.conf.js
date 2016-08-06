// Karma configuration

module.exports = config =>
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      { pattern: 'dist/specs.js', included: true, watched: true }
    ],
    exclude: [
    ],
    preprocessors: {
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity
  });
