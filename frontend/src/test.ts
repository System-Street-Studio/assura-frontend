/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../node_modules/@angular/platform-browser-dynamic/types/testing.d.ts" />
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
