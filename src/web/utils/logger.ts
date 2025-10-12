/**
 * Production-Ready Logging and Error Monitoring Utility
 * Centralized logging with different levels and optional external service integration
 */

import { env } from '../config/env'

/** Log levels in order of severity */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/** Log entry structure */
interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  context?: Record<string, unknown>
  error?: Error
}

/**
 * Application logger with production-ready error tracking
 */
class Logger {
  private minLevel: LogLevel

  constructor() {
    // In production, only log warnings and errors
    this.minLevel = env.isProduction ? LogLevel.WARN : LogLevel.DEBUG
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log warnings that don't break functionality
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log errors that break functionality
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error)

    // In production, send to error tracking service
    if (env.isProduction) {
      this.sendToErrorTracking(message, error, context)
    }
  }

  /**
   * Internal logging implementation
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
  ): void {
    if (level < this.minLevel) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      error,
    }

    // Console output with appropriate method
    const consoleMethod = this.getConsoleMethod(level)
    const prefix = `[${LogLevel[level]}]`

    if (error) {
      consoleMethod(prefix, message, error, context || '')
    }
    else {
      consoleMethod(prefix, message, context || '')
    }
  }

  /**
   * Get appropriate console method for log level
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug
      case LogLevel.INFO:
        return console.info
      case LogLevel.WARN:
        return console.warn
      case LogLevel.ERROR:
        return console.error
      default:
        return console.log
    }
  }

  /**
   * Send errors to external tracking service (Sentry, LogRocket, etc.)
   * Override this method to integrate with your preferred service
   */
  private sendToErrorTracking(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ): void {
    // Placeholder for error tracking integration
    // Example: Sentry.captureException(error, { extra: { message, context } })

    // For now, store in sessionStorage for debugging
    try {
      const errors = JSON.parse(sessionStorage.getItem('app_errors') || '[]')
      errors.push({
        message,
        error: error?.message,
        stack: error?.stack,
        context,
        timestamp: Date.now(),
      })
      // Keep only last 50 errors
      sessionStorage.setItem('app_errors', JSON.stringify(errors.slice(-50)))
    }
    catch {
      // Silently fail if sessionStorage is unavailable
    }
  }
}

/**
 * Global logger instance
 * Use this throughout the application for consistent logging
 */
export const logger = new Logger()

/**
 * Get recent errors from session storage (for debugging)
 */
export function getRecentErrors(): unknown[] {
  try {
    return JSON.parse(sessionStorage.getItem('app_errors') || '[]')
  }
  catch {
    return []
  }
}

/**
 * Clear error log
 */
export function clearErrorLog(): void {
  try {
    sessionStorage.removeItem('app_errors')
  }
  catch {
    // Silently fail
  }
}
