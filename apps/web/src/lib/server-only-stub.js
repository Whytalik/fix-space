/* eslint-disable no-undef, no-unused-vars */
// Stub for server-only packages (NestJS, class-validator, etc.) in browser builds.
// These packages use Node.js APIs and cannot run in the browser.
// All their exports are replaced with no-ops since the web app only imports
// domain DTOs for type checking, not for runtime NestJS behaviour.
module.exports = new Proxy(
  {},
  {
    get(_, key) {
      if (key === "__esModule") return true;
      if (key === "default") return module.exports;
      // Return a function that returns itself so decorator chaining works
      const fn = (..._args) => fn;
      fn.prototype = {};
      return fn;
    },
  },
);
