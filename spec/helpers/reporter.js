const { SpecReporter } = require('jasmine-spec-reporter');
const JasmineConsoleReporter = require('jasmine-console-reporter');

jasmine.getEnv().clearReporters(); // Clear default reporter

// Add SpecReporter for colored output
jasmine.getEnv().addReporter(new SpecReporter({
  spec: {
    displayStacktrace: 'pretty'
  },
  colors: {
    enabled: true
  },
  prefixes: {
    success: '✓ ',
    failure: '✗ ',
    pending: '* '
  },
  customProcessors: []
}));

// Add ConsoleReporter for more detailed output in the console
jasmine.getEnv().addReporter(new JasmineConsoleReporter({
  colors: 1,           // (0|false)|(1|true)|2
  cleanStack: 1,       // (0|false)|(1|true)|2|3
  verbosity: 4,        // (0|false)|1|2|3|(4|true)
  listStyle: 'indent', // "flat"|"indent"
  activity: false
}));
