'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['payments'],
  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  /**
   * This setting controls distributed tracing.
   * Set to `true` to enable distributed tracing.
   * Set to `false` to disable distributed tracing.
   *
   * @see https://docs.newrelic.com/docs/distributed-tracing
   */
  distributed_tracing: {
    enabled: true,
  },
  /**
   * Disable agent logging to files - we only want logs sent to New Relic API
   */
  logging: {
    enabled: false,
  },
  /**
   * Disable security agent to avoid compatibility issues with Turbopack
   */
  security: {
    enabled: false,
  },
  /**
   * Disable browser monitoring
   */
  browser_monitoring: {
    enabled: false,
  },
};
