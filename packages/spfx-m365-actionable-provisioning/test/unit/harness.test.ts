import { describe, expect, it } from 'vitest';

describe('test harness', () => {
  it('runs package tests in JSDOM', () => {
    expect(document.createElement('div').nodeName).toBe('DIV');
  });
});
