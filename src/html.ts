/// <reference path="../node_modules/dom-expressions/runtime.d.ts" />
import { createHTML } from 'lit-dom-expressions';
import * as r from './index';

export { root, cleanup } from './index';
export const html = createHTML(r);