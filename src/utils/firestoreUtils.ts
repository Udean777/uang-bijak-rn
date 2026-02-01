/**
 * Recursively removes all keys with 'undefined' values from an object.
 * This is necessary for Firestore because it does not support 'undefined' values
 * in set() or update() calls in some environments/configurations.
 */
export const stripUndefined = (obj: any): any => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(stripUndefined);
  }

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, stripUndefined(value)]),
  );
};
