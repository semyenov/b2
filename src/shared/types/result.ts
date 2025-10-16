/**
 * Result Pattern Types
 * Generic success/failure result types
 *
 * Provides type-safe error handling without exceptions:
 * - Result<T, E>: Generic result type
 * - Helper functions for working with results
 * - Type guards for discriminating success/failure
 */

/**
 * Generic Result type
 * Discriminated union for success/failure outcomes
 *
 * Inspired by Rust's Result<T, E> and functional programming patterns.
 * Provides explicit error handling without exceptions.
 *
 * @template T - Success value type
 * @template E - Error type (defaults to string)
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) {
 *     return { ok: false, error: 'Division by zero' }
 *   }
 *   return { ok: true, value: a / b }
 * }
 *
 * const result = divide(10, 2)
 * if (result.ok) {
 *   console.log(result.value) // 5
 * } else {
 *   console.error(result.error)
 * }
 * ```
 */
export type Result<T, E = string>
  = | { readonly ok: true, readonly value: T }
    | { readonly ok: false, readonly error: E }

/**
 * Success result factory
 * Creates a successful Result with the given value
 *
 * @param value - Success value
 * @returns Success Result
 */
export function ok<T, E = string>(value: T): Result<T, E> {
  return { ok: true, value }
}

/**
 * Failure result factory
 * Creates a failed Result with the given error
 *
 * @param error - Error value
 * @returns Failure Result
 */
export function err<T, E = string>(error: E): Result<T, E> {
  return { ok: false, error }
}

/**
 * Type guard to check if Result is successful
 *
 * @param result - Result to check
 * @returns True if result is successful
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true, value: T } {
  return result.ok === true
}

/**
 * Type guard to check if Result is failure
 *
 * @param result - Result to check
 * @returns True if result is failure
 */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false, error: E } {
  return result.ok === false
}

/**
 * Extract value from Result, or return default
 *
 * @param result - Result to unwrap
 * @param defaultValue - Default value if result is failure
 * @returns Value or default
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return isOk(result) ? result.value : defaultValue
}

/**
 * Extract value from Result, or throw error
 * Use sparingly - prefer explicit error handling
 *
 * @param result - Result to unwrap
 * @returns Value if successful
 * @throws Error if result is failure
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (isOk(result)) {
    return result.value
  }
  else if (isErr(result)) {
    throw new Error(`Unwrap failed: ${String(result.error)}`)
  }
  // This should never happen but TypeScript needs explicit handling
  throw new Error('Unwrap failed: unknown error')
}

/**
 * Map success value to new type
 * Leaves failure unchanged
 *
 * @param result - Result to map
 * @param fn - Mapping function
 * @returns Mapped Result
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  if (isOk(result)) {
    return ok(fn(result.value))
  }
  else if (isErr(result)) {
    return err(result.error)
  }
  // This should never happen but TypeScript needs explicit handling
  return err(result as unknown as E)
}

/**
 * Map error to new type
 * Leaves success unchanged
 *
 * @param result - Result to map
 * @param fn - Error mapping function
 * @returns Mapped Result
 */
export function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> {
  if (isErr(result)) {
    return err(fn(result.error))
  }
  else if (isOk(result)) {
    return ok(result.value)
  }
  // This should never happen but TypeScript needs explicit handling
  return ok(result as unknown as T)
}

/**
 * Chain Results (flatMap/bind)
 * Allows composing operations that return Results
 *
 * @param result - Result to chain
 * @param fn - Function that returns a Result
 * @returns Chained Result
 */
export function andThen<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  if (isOk(result)) {
    return fn(result.value)
  }
  else if (isErr(result)) {
    return err(result.error)
  }
  // This should never happen but TypeScript needs explicit handling
  return err(result as unknown as E)
}

/**
 * Combine multiple Results into single Result
 * Returns success only if all results are successful
 *
 * @param results - Array of Results
 * @returns Combined Result with array of values or first error
 */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = []

  for (const result of results) {
    if (isErr(result)) {
      return err(result.error)
    }
    if (isOk(result)) {
      values.push(result.value)
    }
  }

  return ok(values)
}

/**
 * Convert Result to Promise
 * Useful for interop with async/await code
 *
 * @param result - Result to convert
 * @returns Promise that resolves with value or rejects with error
 */
export function toPromise<T, E>(result: Result<T, E>): Promise<T> {
  if (isOk(result)) {
    return Promise.resolve(result.value)
  }
  else if (isErr(result)) {
    return Promise.reject(result.error)
  }
  // This should never happen but TypeScript needs explicit handling
  return Promise.reject(new Error('Unknown error'))
}

/**
 * Convert Promise to Result
 * Catches promise rejections and converts to Result
 *
 * @param promise - Promise to convert
 * @returns Promise resolving to Result
 */
export async function fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  try {
    const value = await promise
    return ok(value)
  }
  catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}
