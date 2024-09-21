// import { nodeProfilingIntegration } from "@sentry/profiling-node";
// import { SENTRY_DSN } from "../Core/appConfig";

// const Sentry = require("@sentry/node");


// Sentry.init({
//   dsn: SENTRY_DSN,
//   integrations: [
//     new Sentry.Integrations.Http({ tracing: true }),
//     // new Sentry.Integrations.Express({ app }),
//     nodeProfilingIntegration(),
//   ],
//   tracesSampleRate: 1.0,
//   profilesSampleRate: 1.0,
// });