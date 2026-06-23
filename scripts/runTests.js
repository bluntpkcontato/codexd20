import { runFixturesTests } from '../src/lib/rules/fixtures.js';

const { results, failed } = runFixturesTests();
console.log(results.join('\n'));
process.exit(failed ? 1 : 0);
