/**
 * A helper that will return a Promise that resolves in the number of milliseconds passed
 *
 * @param ms - number os milliseconds to wait until resolving the returned Promise
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
