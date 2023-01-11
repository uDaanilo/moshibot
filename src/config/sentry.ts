import * as Sentry from "@sentry/node"

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV !== "development",
  })
}
