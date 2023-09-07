import type { GraphQLError } from '../error/GraphQLError';

import type { ObjMap } from './ObjMap';

export class MultipleErrors extends Error {
  public errors: ReadonlyArray<GraphQLError>;

  constructor(errors: ReadonlyArray<GraphQLError>) {
    super();
    this.errors = errors;
  }

  get [Symbol.toStringTag](): string {
    return 'MultipleErrors';
  }
}

/**
 * This function transforms a JS object `ObjMap<Promise<T>>` into a
 * `Promise<ObjMap<T>>`
 *
 * Always waits for all promises to resolve or reject. If any of the promises in
 * the object rejects, the returned promise rejects. Rejected promises are
 * collected into an array, and included in the reason of the returned promise.
 *
 * This is akin to bluebird's `Promise.props`, but implemented only using
 * `Promise.all` so it will work with any implementation of ES6 promises.
 */
export async function promiseForObject<T>(
  object: ObjMap<Promise<T>>,
): Promise<ObjMap<T>> {
  const maybeResolvedValues = await Promise.allSettled(Object.values(object));
  const errors = [];
  const resolvedObject = Object.create(null);
  for (const [i, key] of Object.keys(object).entries()) {
    if (maybeResolvedValues[i].status === 'rejected') {
      const reason = (maybeResolvedValues[i] as PromiseRejectedResult).reason;
      if (reason instanceof MultipleErrors) {
        errors.push(...reason.errors);
      } else {
        errors.push(reason);
      }
    } else {
      resolvedObject[key] = (
        maybeResolvedValues[i] as PromiseFulfilledResult<T>
      ).value;
    }
  }
  if (errors.length > 0) {
    throw new MultipleErrors(errors);
  }
  return resolvedObject;
}
