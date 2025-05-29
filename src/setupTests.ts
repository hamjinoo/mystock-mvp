// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import structuredClone from '@ungap/structured-clone';
import 'fake-indexeddb/auto';
import { initDB } from './utils/db';

// structuredClone polyfill
global.structuredClone = structuredClone;

beforeEach(async () => {
  // IndexedDB 데이터베이스 초기화
  indexedDB = new IDBFactory();
  await initDB();
});
