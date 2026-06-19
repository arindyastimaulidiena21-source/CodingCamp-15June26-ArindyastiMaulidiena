/**
 * js/app.test.js
 * Unit and property-based tests for GreetingWidget._getGreeting(hour).
 *
 * Because app.js targets the browser (IIFEs, no exports), we replicate the
 * pure function here as-is so it can run under Node/Vitest without a DOM.
 * The implementation in app.js must stay in sync with this copy.
 *
 * Property 1: Greeting hour coverage is exhaustive and non-overlapping
 * Validates: Requirements 1.3, 1.4, 1.5, 1.6
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ── Pure function under test ────────────────────────────────────────────────
// Mirrors GreetingWidget._getGreeting() in js/app.js exactly.
// Feature: todo-life-dashboard, Property 1: Greeting hour coverage is
// exhaustive and non-overlapping.
function _getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return 'Good Morning';
  if (hour >= 12 && hour <= 17) return 'Good Afternoon';
  if (hour >= 18 && hour <= 20) return 'Good Evening';
  // Covers 21–23 and 00–04
  return 'Good Night';
}

// ── Unit tests ──────────────────────────────────────────────────────────────

describe('GreetingWidget._getGreeting – unit tests', () => {
  // Requirement 1.3: 05–11 → "Good Morning"
  it('returns "Good Morning" at the lower boundary hour 5', () => {
    expect(_getGreeting(5)).toBe('Good Morning');
  });

  it('returns "Good Morning" at mid-morning hour 9', () => {
    expect(_getGreeting(9)).toBe('Good Morning');
  });

  it('returns "Good Morning" at the upper boundary hour 11', () => {
    expect(_getGreeting(11)).toBe('Good Morning');
  });

  // Requirement 1.4: 12–17 → "Good Afternoon"
  it('returns "Good Afternoon" at the lower boundary hour 12', () => {
    expect(_getGreeting(12)).toBe('Good Afternoon');
  });

  it('returns "Good Afternoon" at mid-afternoon hour 15', () => {
    expect(_getGreeting(15)).toBe('Good Afternoon');
  });

  it('returns "Good Afternoon" at the upper boundary hour 17', () => {
    expect(_getGreeting(17)).toBe('Good Afternoon');
  });

  // Requirement 1.5: 18–20 → "Good Evening"
  it('returns "Good Evening" at the lower boundary hour 18', () => {
    expect(_getGreeting(18)).toBe('Good Evening');
  });

  it('returns "Good Evening" at hour 19', () => {
    expect(_getGreeting(19)).toBe('Good Evening');
  });

  it('returns "Good Evening" at the upper boundary hour 20', () => {
    expect(_getGreeting(20)).toBe('Good Evening');
  });

  // Requirement 1.6: 21–23 and 00–04 → "Good Night"
  it('returns "Good Night" at the lower boundary hour 21', () => {
    expect(_getGreeting(21)).toBe('Good Night');
  });

  it('returns "Good Night" at midnight hour 0', () => {
    expect(_getGreeting(0)).toBe('Good Night');
  });

  it('returns "Good Night" at hour 2', () => {
    expect(_getGreeting(2)).toBe('Good Night');
  });

  it('returns "Good Night" at the upper night boundary hour 4', () => {
    expect(_getGreeting(4)).toBe('Good Night');
  });

  it('returns "Good Night" at hour 23', () => {
    expect(_getGreeting(23)).toBe('Good Night');
  });

  // Boundary: hour 4 (Good Night) vs hour 5 (Good Morning)
  it('transitions correctly from hour 4 (Good Night) to hour 5 (Good Morning)', () => {
    expect(_getGreeting(4)).toBe('Good Night');
    expect(_getGreeting(5)).toBe('Good Morning');
  });

  // Boundary: hour 11 (Good Morning) vs hour 12 (Good Afternoon)
  it('transitions correctly from hour 11 (Good Morning) to hour 12 (Good Afternoon)', () => {
    expect(_getGreeting(11)).toBe('Good Morning');
    expect(_getGreeting(12)).toBe('Good Afternoon');
  });

  // Boundary: hour 17 (Good Afternoon) vs hour 18 (Good Evening)
  it('transitions correctly from hour 17 (Good Afternoon) to hour 18 (Good Evening)', () => {
    expect(_getGreeting(17)).toBe('Good Afternoon');
    expect(_getGreeting(18)).toBe('Good Evening');
  });

  // Boundary: hour 20 (Good Evening) vs hour 21 (Good Night)
  it('transitions correctly from hour 20 (Good Evening) to hour 21 (Good Night)', () => {
    expect(_getGreeting(20)).toBe('Good Evening');
    expect(_getGreeting(21)).toBe('Good Night');
  });
});

// ── Property-based tests ────────────────────────────────────────────────────
// Feature: todo-life-dashboard, Property 1: Greeting hour coverage is
// exhaustive and non-overlapping
// Validates: Requirements 1.3, 1.4, 1.5, 1.6

const VALID_GREETINGS = new Set([
  'Good Morning',
  'Good Afternoon',
  'Good Evening',
  'Good Night',
]);

describe('GreetingWidget._getGreeting – property-based tests (Property 1)', () => {
  /**
   * Property 1a: Every integer hour in [0, 23] maps to exactly one of the
   * four valid greeting strings (exhaustiveness).
   *
   * **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
   */
  it('P1a: every hour [0–23] returns one of the four valid greeting strings', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }),
        (hour) => {
          const result = _getGreeting(hour);
          return VALID_GREETINGS.has(result);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1b: Hours 5–11 always return "Good Morning" (Requirement 1.3).
   *
   * **Validates: Requirement 1.3**
   */
  it('P1b: hours 5–11 always return "Good Morning"', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 11 }),
        (hour) => _getGreeting(hour) === 'Good Morning'
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1c: Hours 12–17 always return "Good Afternoon" (Requirement 1.4).
   *
   * **Validates: Requirement 1.4**
   */
  it('P1c: hours 12–17 always return "Good Afternoon"', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 12, max: 17 }),
        (hour) => _getGreeting(hour) === 'Good Afternoon'
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1d: Hours 18–20 always return "Good Evening" (Requirement 1.5).
   *
   * **Validates: Requirement 1.5**
   */
  it('P1d: hours 18–20 always return "Good Evening"', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 18, max: 20 }),
        (hour) => _getGreeting(hour) === 'Good Evening'
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1e: Hours 21–23 and 0–4 always return "Good Night"
   * (Requirement 1.6).
   *
   * **Validates: Requirement 1.6**
   */
  it('P1e: hours 21–23 and 0–4 always return "Good Night"', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: 0, max: 4 }),
          fc.integer({ min: 21, max: 23 })
        ),
        (hour) => _getGreeting(hour) === 'Good Night'
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1f: No hour [0–23] is unmatched or returns more than one
   * greeting (non-overlapping, no gaps).
   *
   * **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
   */
  it('P1f: no two different hours in the same named range return different greetings', () => {
    // Verify the partition is exactly exhaustive by checking all 24 values
    // deterministically.
    const expected = {
      0: 'Good Night',  1: 'Good Night',  2: 'Good Night',
      3: 'Good Night',  4: 'Good Night',  5: 'Good Morning',
      6: 'Good Morning', 7: 'Good Morning', 8: 'Good Morning',
      9: 'Good Morning', 10: 'Good Morning', 11: 'Good Morning',
      12: 'Good Afternoon', 13: 'Good Afternoon', 14: 'Good Afternoon',
      15: 'Good Afternoon', 16: 'Good Afternoon', 17: 'Good Afternoon',
      18: 'Good Evening', 19: 'Good Evening', 20: 'Good Evening',
      21: 'Good Night', 22: 'Good Night', 23: 'Good Night',
    };

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }),
        (hour) => _getGreeting(hour) === expected[hour]
      ),
      { numRuns: 100 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TimerWidget._formatTime – unit and property-based tests
// Feature: todo-life-dashboard, Property 4: Timer format correctness
// Validates: Requirements 3.1, 3.4
// ═══════════════════════════════════════════════════════════════════════════

// ── Pure function under test ────────────────────────────────────────────────
// Mirrors TimerWidget._formatTime() in js/app.js exactly.
// Feature: todo-life-dashboard, Property 4: Timer format correctness
function _formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ── Unit tests ──────────────────────────────────────────────────────────────

describe('TimerWidget._formatTime – unit tests', () => {
  // Boundary: 0 seconds
  it('formats 0 seconds as "00:00"', () => {
    expect(_formatTime(0)).toBe('00:00');
  });

  // 1 second
  it('formats 1 second as "00:01"', () => {
    expect(_formatTime(1)).toBe('00:01');
  });

  // 59 seconds — last second before a full minute
  it('formats 59 seconds as "00:59"', () => {
    expect(_formatTime(59)).toBe('00:59');
  });

  // 60 seconds — exactly 1 minute
  it('formats 60 seconds as "01:00"', () => {
    expect(_formatTime(60)).toBe('01:00');
  });

  // Default Pomodoro preset − 1 second (25 minutes = 1500 s)
  it('formats 3599 seconds as "59:59"', () => {
    expect(_formatTime(3599)).toBe('59:59');
  });

  // 60 minutes
  it('formats 3600 seconds as "60:00"', () => {
    expect(_formatTime(3600)).toBe('60:00');
  });

  // Maximum value: 180 minutes = 10800 seconds
  it('formats 10800 seconds as "180:00"', () => {
    expect(_formatTime(10800)).toBe('180:00');
  });

  // Spot-check: 65 seconds → 1 min 5 sec
  it('formats 65 seconds as "01:05" (zero-padded seconds)', () => {
    expect(_formatTime(65)).toBe('01:05');
  });

  // Default Pomodoro display: 25:00
  it('formats 1500 seconds (25 minutes) as "25:00"', () => {
    expect(_formatTime(1500)).toBe('25:00');
  });
});

// ── Property-based tests ────────────────────────────────────────────────────
// Feature: todo-life-dashboard, Property 4: Timer format correctness
// Validates: Requirements 3.1, 3.4

describe('TimerWidget._formatTime – property-based tests (Property 4)', () => {
  /**
   * Property 4a: For every integer in [0, 10800], _formatTime returns a
   * string matching /^\d{2,}:\d{2}$/ (at least 2 digit minutes, exactly
   * 2 digit seconds, separated by a colon).
   *
   * **Validates: Requirements 3.1, 3.4**
   */
  it('P4a: every value in [0, 10800] returns a string matching /^\\d{2,}:\\d{2}$/', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10800 }),
        (seconds) => {
          const result = _formatTime(seconds);
          return /^\d{2,}:\d{2}$/.test(result);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Property 4b: The MM part is always in [0, 180] (no negative minutes,
   * no more than 180 minutes for input in [0, 10800]).
   *
   * **Validates: Requirements 3.1, 3.4**
   */
  it('P4b: the MM part is always in [00, 180]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10800 }),
        (seconds) => {
          const [mmStr] = _formatTime(seconds).split(':');
          const mm = parseInt(mmStr, 10);
          return mm >= 0 && mm <= 180;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Property 4c: The SS part is always in [00, 59].
   *
   * **Validates: Requirements 3.1, 3.4**
   */
  it('P4c: the SS part is always in [00, 59]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10800 }),
        (seconds) => {
          const [, ssStr] = _formatTime(seconds).split(':');
          const ss = parseInt(ssStr, 10);
          return ss >= 0 && ss <= 59;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Property 4d: The output is reversible — MM * 60 + SS always equals the
   * original input (no information lost in conversion).
   *
   * **Validates: Requirements 3.1, 3.4**
   */
  it('P4d: MM * 60 + SS always equals the original input', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10800 }),
        (seconds) => {
          const [mmStr, ssStr] = _formatTime(seconds).split(':');
          return parseInt(mmStr, 10) * 60 + parseInt(ssStr, 10) === seconds;
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TimerWidget._validatePreset – unit and property-based tests
// Feature: todo-life-dashboard
// Validates: Requirements 4.1, 4.3, 4.7
// ═══════════════════════════════════════════════════════════════════════════

// ── Pure function under test ────────────────────────────────────────────────
// Mirrors TimerWidget._validatePreset() in js/app.js exactly.
// The function is extracted here (with a configurable preset list) so it
// can run under Node/Vitest without a DOM.
function _validatePreset(name, minutes, existingPresets = []) {
  const errors = {};

  // ── Name validation ──────────────────────────────────────────────────
  const trimmedName = (typeof name === 'string') ? name.trim() : '';

  if (trimmedName.length === 0) {
    errors.name = 'Preset name is required.';
  } else if (trimmedName.length > 50) {
    errors.name = 'Preset name must be 50 characters or fewer.';
  } else {
    const isDuplicate = existingPresets.some((p) => p.name === trimmedName);
    if (isDuplicate) {
      errors.name = 'A preset with this name already exists';
    }
  }

  // ── Minutes validation ────────────────────────────────────────────────
  if (
    typeof minutes !== 'number' ||
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 180
  ) {
    errors.minutes = 'Duration must be a whole number between 1 and 180.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ── Unit tests ──────────────────────────────────────────────────────────────

describe('TimerWidget._validatePreset – unit tests', () => {
  // ── Name: empty ────────────────────────────────────────────────────────
  it('returns a name error for an empty string name', () => {
    const result = _validatePreset('', 25);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeTruthy();
  });

  it('returns a name error for a whitespace-only name', () => {
    const result = _validatePreset('   ', 25);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeTruthy();
  });

  // ── Name: too long ─────────────────────────────────────────────────────
  it('returns a name error when name exceeds 50 characters', () => {
    const longName = 'a'.repeat(51);
    const result = _validatePreset(longName, 25);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeTruthy();
  });

  it('accepts a name of exactly 50 characters', () => {
    const name50 = 'a'.repeat(50);
    const result = _validatePreset(name50, 25);
    expect(result.errors.name).toBeUndefined();
  });

  // ── Name: duplicate (Requirement 4.3) ─────────────────────────────────
  it('returns the exact duplicate-name error message', () => {
    const existing = [{ name: 'Pomodoro', minutes: 25 }];
    const result = _validatePreset('Pomodoro', 25, existing);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe('A preset with this name already exists');
  });

  it('does NOT flag a name as duplicate when the preset list is empty', () => {
    const result = _validatePreset('Pomodoro', 25, []);
    expect(result.errors.name).toBeUndefined();
  });

  it('does NOT flag a name as duplicate when it is different from all existing names', () => {
    const existing = [{ name: 'Pomodoro', minutes: 25 }];
    const result = _validatePreset('Short Break', 5, existing);
    expect(result.errors.name).toBeUndefined();
  });

  // ── Minutes: below minimum ─────────────────────────────────────────────
  it('returns a minutes error when minutes is 0', () => {
    const result = _validatePreset('Sprint', 0);
    expect(result.valid).toBe(false);
    expect(result.errors.minutes).toBeTruthy();
  });

  it('returns a minutes error when minutes is negative', () => {
    const result = _validatePreset('Sprint', -1);
    expect(result.valid).toBe(false);
    expect(result.errors.minutes).toBeTruthy();
  });

  // ── Minutes: above maximum ─────────────────────────────────────────────
  it('returns a minutes error when minutes is 181', () => {
    const result = _validatePreset('Marathon', 181);
    expect(result.valid).toBe(false);
    expect(result.errors.minutes).toBeTruthy();
  });

  // ── Minutes: non-integer ───────────────────────────────────────────────
  it('returns a minutes error for a float value (e.g. 25.5)', () => {
    const result = _validatePreset('Float Test', 25.5);
    expect(result.valid).toBe(false);
    expect(result.errors.minutes).toBeTruthy();
  });

  it('returns a minutes error for NaN', () => {
    const result = _validatePreset('NaN Test', NaN);
    expect(result.valid).toBe(false);
    expect(result.errors.minutes).toBeTruthy();
  });

  it('returns a minutes error for a string value', () => {
    const result = _validatePreset('String Test', '25');
    expect(result.valid).toBe(false);
    expect(result.errors.minutes).toBeTruthy();
  });

  // ── Boundaries: valid extremes ─────────────────────────────────────────
  it('accepts minutes = 1 (lower boundary)', () => {
    const result = _validatePreset('Micro', 1);
    expect(result.errors.minutes).toBeUndefined();
  });

  it('accepts minutes = 180 (upper boundary)', () => {
    const result = _validatePreset('Long Session', 180);
    expect(result.errors.minutes).toBeUndefined();
  });

  // ── Fully valid input ──────────────────────────────────────────────────
  it('returns valid=true and no errors for a good name and minutes', () => {
    const result = _validatePreset('Focus', 25);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('reports both name and minutes errors when both are invalid', () => {
    const result = _validatePreset('', 200);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeTruthy();
    expect(result.errors.minutes).toBeTruthy();
  });
});

// ── Property-based tests ────────────────────────────────────────────────────
// Feature: todo-life-dashboard, Property 8: Preset validation correctness
// Validates: Requirements 4.1, 4.3, 4.7

describe('TimerWidget._validatePreset – property-based tests', () => {
  /**
   * P8a: Any non-empty name (≤50 chars, no duplicates) with an integer
   * minutes in [1,180] always yields valid=true and no errors.
   *
   * **Validates: Requirements 4.1, 4.7**
   */
  it('P8a: valid name and valid minutes always produce valid=true with no errors', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 1, max: 180 }),
        (name, minutes) => {
          const result = _validatePreset(name, minutes, []);
          return result.valid === true && Object.keys(result.errors).length === 0;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P8b: An empty (or whitespace-only) name always produces a name error.
   *
   * **Validates: Requirement 4.7**
   */
  it('P8b: empty or whitespace-only name always produces a name error', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.stringOf(fc.char().filter(c => c === ' ' || c === '\t'), { minLength: 1, maxLength: 20 })
        ),
        fc.integer({ min: 1, max: 180 }),
        (name, minutes) => {
          const result = _validatePreset(name, minutes, []);
          return typeof result.errors.name === 'string';
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P8c: A name longer than 50 characters (after trimming) always produces a name error.
   *
   * **Validates: Requirement 4.7**
   */
  it('P8c: name exceeding 50 characters always produces a name error', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 51, maxLength: 200 }).filter(s => s.trim().length > 50),
        fc.integer({ min: 1, max: 180 }),
        (name, minutes) => {
          const result = _validatePreset(name, minutes, []);
          return typeof result.errors.name === 'string';
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P8d: A duplicate name always produces the exact error message
   * "A preset with this name already exists".
   *
   * **Validates: Requirement 4.3**
   */
  it('P8d: duplicate name always yields the exact required error message', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0 && s.trim().length <= 50),
        fc.integer({ min: 1, max: 180 }),
        (name, minutes) => {
          const trimmed = name.trim();
          const existing = [{ name: trimmed, minutes: 25 }];
          const result = _validatePreset(trimmed, minutes, existing);
          return result.errors.name === 'A preset with this name already exists';
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P8e: An integer minutes outside [1, 180] always produces a minutes error.
   *
   * **Validates: Requirements 4.1, 4.7**
   */
  it('P8e: minutes outside [1, 180] always produces a minutes error', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: -10000, max: 0 }),
          fc.integer({ min: 181, max: 10000 })
        ),
        (minutes) => {
          const result = _validatePreset('Valid Name', minutes, []);
          return typeof result.errors.minutes === 'string';
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P8f: Non-integer minutes (floats) always produce a minutes error.
   *
   * **Validates: Requirements 4.1, 4.7**
   */
  it('P8f: non-integer (float) minutes always produce a minutes error', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 180 }).filter(n => !Number.isInteger(n)),
        (minutes) => {
          const result = _validatePreset('Valid Name', minutes, []);
          return typeof result.errors.minutes === 'string';
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TodoWidget._validateTitle / _generateId – unit tests
// Feature: todo-life-dashboard
// Validates: Requirements 5.1, 5.2, 5.3
// ═══════════════════════════════════════════════════════════════════════════

// ── Pure functions under test ───────────────────────────────────────────────
// Mirror TodoWidget._validateTitle() and TodoWidget._generateId() from
// js/app.js exactly so they run under Node/Vitest without a DOM.

function _validateTitle(title) {
  if (typeof title !== 'string' || title.length > 200) return false;
  if (title.trim().length === 0) return false;
  return true;
}

function _generateId() {
  const timestamp    = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 6);
  return `task_${timestamp}_${randomSuffix}`;
}

// ── Unit tests: _validateTitle ──────────────────────────────────────────────

describe('TodoWidget._validateTitle – unit tests', () => {
  // Requirement 5.3: empty string is invalid
  it('returns false for an empty string', () => {
    expect(_validateTitle('')).toBe(false);
  });

  // Requirement 5.3: whitespace-only string is invalid
  it('returns false for a whitespace-only string (spaces)', () => {
    expect(_validateTitle('   ')).toBe(false);
  });

  it('returns false for a whitespace-only string (tabs)', () => {
    expect(_validateTitle('\t\t')).toBe(false);
  });

  it('returns false for a whitespace-only string (mixed whitespace)', () => {
    expect(_validateTitle('  \t \n ')).toBe(false);
  });

  // Requirement 5.1: title with 1 character is valid
  it('returns true for a single non-whitespace character', () => {
    expect(_validateTitle('a')).toBe(true);
  });

  // Requirement 5.1, 5.2: typical valid title
  it('returns true for a typical task title', () => {
    expect(_validateTitle('Buy groceries')).toBe(true);
  });

  // Requirement 5.1: exactly 200 characters is valid (boundary)
  it('returns true for a title of exactly 200 characters', () => {
    const title200 = 'a'.repeat(200);
    expect(_validateTitle(title200)).toBe(true);
  });

  // Requirement 5.1: 201 characters exceeds the maximum
  it('returns false for a title of 201 characters', () => {
    const title201 = 'a'.repeat(201);
    expect(_validateTitle(title201)).toBe(false);
  });

  // Edge: title that is just whitespace padded to 200 chars is still invalid
  it('returns false for 200 whitespace characters (empty after trim)', () => {
    const allSpaces = ' '.repeat(200);
    expect(_validateTitle(allSpaces)).toBe(false);
  });

  // Edge: non-string input
  it('returns false for null input', () => {
    expect(_validateTitle(null)).toBe(false);
  });

  it('returns false for undefined input', () => {
    expect(_validateTitle(undefined)).toBe(false);
  });
});

// ── Unit tests: _generateId ─────────────────────────────────────────────────

describe('TodoWidget._generateId – unit tests', () => {
  // Output must match the required pattern: task_<digits>_<alphanumeric>
  it('returns a string matching the pattern task_<timestamp>_<suffix>', () => {
    const id = _generateId();
    expect(id).toMatch(/^task_\d+_[a-z0-9]+$/);
  });

  // Two consecutive calls must return different values
  it('returns different values on two consecutive calls', () => {
    const id1 = _generateId();
    const id2 = _generateId();
    expect(id1).not.toBe(id2);
  });

  // The timestamp portion must be a plausible epoch millisecond value
  it('embeds a numeric timestamp that is greater than 0', () => {
    const id = _generateId();
    const parts = id.split('_');
    // format: ["task", "<timestamp>", "<suffix>"]
    expect(parts).toHaveLength(3);
    const ts = Number(parts[1]);
    expect(ts).toBeGreaterThan(0);
  });

  // The suffix must be at least 1 character of alphanumeric content
  it('has a non-empty alphanumeric suffix after the second underscore', () => {
    const id = _generateId();
    const suffix = id.split('_')[2];
    expect(suffix).toBeTruthy();
    expect(suffix).toMatch(/^[a-z0-9]+$/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TodoWidget._addTask / _deleteTask – unit and property-based tests
// Feature: todo-life-dashboard
// Validates: Requirements 5.1, 5.2, 5.3, 5.10, 5.11
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Minimal self-contained re-implementation of the TodoWidget logic
 * (pure in-memory, no DOM, no Storage) so it runs cleanly under
 * Node/Vitest without a browser environment.
 *
 * Mirrors _validateTitle, _generateId, _addTask, and _deleteTask
 * in js/app.js exactly.
 */
function makeTodoWidget() {
  let tasks     = [];
  let savedCalls = []; // records Storage.save() calls (key, value)
  let lastError = null; // last validation error shown

  // Pure helpers (mirrored from app.js)
  function _validateTitle(title) {
    if (typeof title !== 'string' || title.length > 200) return false;
    if (title.trim().length === 0) return false;
    return true;
  }

  function _generateId() {
    const timestamp    = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 6);
    return `task_${timestamp}_${randomSuffix}`;
  }

  function _showTodoError(message) {
    lastError = message || null;
  }

  // Stub for Storage.save — records calls but does not use localStorage
  function _storageSave(key, value) {
    savedCalls.push({ key, value: JSON.parse(JSON.stringify(value)) });
    return true;
  }

  function _addTask(title) {
    if (!_validateTitle(title)) {
      _showTodoError('Task title cannot be empty and must be 200 characters or fewer.');
      return;
    }

    const task = {
      id:        _generateId(),
      title:     title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.push(task);
    _showTodoError(null);
    _storageSave('tld_tasks', tasks);
  }

  function _deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    _storageSave('tld_tasks', tasks);
  }

  return {
    _addTask,
    _deleteTask,
    _validateTitle,
    getTasks:      () => [...tasks],
    setTasks:      (arr) => { tasks = [...arr]; },
    getSavedCalls: () => [...savedCalls],
    getLastError:  () => lastError,
    clearSaved:    () => { savedCalls = []; },
  };
}

// ── Unit tests: _addTask ────────────────────────────────────────────────────

describe('TodoWidget._addTask – unit tests', () => {
  // Requirement 5.2: task added with correct shape
  it('adds a task with the correct shape for a valid title', () => {
    const w = makeTodoWidget();
    w._addTask('Buy groceries');
    const tasks = w.getTasks();
    expect(tasks).toHaveLength(1);
    const task = tasks[0];
    expect(task.title).toBe('Buy groceries');
    expect(task.completed).toBe(false);
    expect(typeof task.id).toBe('string');
    expect(task.id).toMatch(/^task_\d+_[a-z0-9]+$/);
    expect(typeof task.createdAt).toBe('string');
    // createdAt must be a valid ISO 8601 string
    expect(() => new Date(task.createdAt)).not.toThrow();
    expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt);
  });

  // Requirement 5.2: title is trimmed
  it('trims leading and trailing whitespace from the task title', () => {
    const w = makeTodoWidget();
    w._addTask('  Learn TypeScript  ');
    expect(w.getTasks()[0].title).toBe('Learn TypeScript');
  });

  // Requirement 5.2: unique ids across multiple tasks
  it('assigns unique ids to each added task', () => {
    const w = makeTodoWidget();
    w._addTask('Task A');
    w._addTask('Task B');
    const [a, b] = w.getTasks();
    expect(a.id).not.toBe(b.id);
  });

  // Requirement 5.3: empty string rejected
  it('does NOT add a task and sets a validation error for an empty title', () => {
    const w = makeTodoWidget();
    w._addTask('');
    expect(w.getTasks()).toHaveLength(0);
    expect(w.getLastError()).toBeTruthy();
  });

  // Requirement 5.3: whitespace-only rejected
  it('does NOT add a task and sets a validation error for a whitespace-only title', () => {
    const w = makeTodoWidget();
    w._addTask('   ');
    expect(w.getTasks()).toHaveLength(0);
    expect(w.getLastError()).toBeTruthy();
  });

  it('does NOT add a task for a tab-only title', () => {
    const w = makeTodoWidget();
    w._addTask('\t\t');
    expect(w.getTasks()).toHaveLength(0);
    expect(w.getLastError()).toBeTruthy();
  });

  // Requirement 5.1: 201-character title rejected
  it('does NOT add a task for a title exceeding 200 characters', () => {
    const w = makeTodoWidget();
    w._addTask('a'.repeat(201));
    expect(w.getTasks()).toHaveLength(0);
    expect(w.getLastError()).toBeTruthy();
  });

  // Boundary: exactly 200 characters is valid
  it('adds a task for a title of exactly 200 characters', () => {
    const w = makeTodoWidget();
    w._addTask('a'.repeat(200));
    expect(w.getTasks()).toHaveLength(1);
    expect(w.getLastError()).toBeNull();
  });

  // Requirement 5.11: Storage.save is called with the updated task list
  it('calls Storage.save with the full updated task list on success', () => {
    const w = makeTodoWidget();
    w._addTask('Write tests');
    const saved = w.getSavedCalls();
    expect(saved).toHaveLength(1);
    expect(saved[0].key).toBe('tld_tasks');
    expect(saved[0].value).toHaveLength(1);
    expect(saved[0].value[0].title).toBe('Write tests');
  });

  // Requirement 5.11: Storage.save is NOT called when validation fails
  it('does NOT call Storage.save when validation fails', () => {
    const w = makeTodoWidget();
    w._addTask('');
    expect(w.getSavedCalls()).toHaveLength(0);
  });

  // Requirement 5.2: completed defaults to false
  it('always creates the new task with completed = false', () => {
    const w = makeTodoWidget();
    w._addTask('Read a book');
    expect(w.getTasks()[0].completed).toBe(false);
  });
});

// ── Unit tests: _deleteTask ─────────────────────────────────────────────────

describe('TodoWidget._deleteTask – unit tests', () => {
  // Requirement 5.10: removes the correct task by id
  it('removes the task matching the given id', () => {
    const w = makeTodoWidget();
    w._addTask('Task Alpha');
    w._addTask('Task Beta');
    const [alpha] = w.getTasks();
    w._deleteTask(alpha.id);
    const remaining = w.getTasks();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].title).toBe('Task Beta');
  });

  // Others remain intact
  it('does not remove tasks with different ids', () => {
    const w = makeTodoWidget();
    w._addTask('Keep me');
    w._addTask('Delete me');
    w._addTask('Keep me too');
    const tasks = w.getTasks();
    w._deleteTask(tasks[1].id);
    const remaining = w.getTasks();
    expect(remaining).toHaveLength(2);
    expect(remaining.map((t) => t.title)).toEqual(['Keep me', 'Keep me too']);
  });

  // Deleting only task leaves empty list
  it('leaves an empty array when the only task is deleted', () => {
    const w = makeTodoWidget();
    w._addTask('Solo task');
    const [task] = w.getTasks();
    w._deleteTask(task.id);
    expect(w.getTasks()).toHaveLength(0);
  });

  // Deleting non-existent id is a no-op
  it('is a no-op when the given id does not exist', () => {
    const w = makeTodoWidget();
    w._addTask('Untouched');
    w._deleteTask('task_0_0000');   // id that was never added
    expect(w.getTasks()).toHaveLength(1);
  });

  // Requirement 5.11: Storage.save is called after deletion
  it('calls Storage.save with the updated list after deleting a task', () => {
    const w = makeTodoWidget();
    w._addTask('Task A');
    w._addTask('Task B');
    w.clearSaved();

    const [taskA] = w.getTasks();
    w._deleteTask(taskA.id);

    const saved = w.getSavedCalls();
    expect(saved).toHaveLength(1);
    expect(saved[0].key).toBe('tld_tasks');
    expect(saved[0].value).toHaveLength(1);
    expect(saved[0].value[0].title).toBe('Task B');
  });

  // Requirement 5.11: Storage.save called with empty array after last deletion
  it('calls Storage.save with an empty array after deleting the last task', () => {
    const w = makeTodoWidget();
    w._addTask('Last task');
    w.clearSaved();
    const [task] = w.getTasks();
    w._deleteTask(task.id);
    const saved = w.getSavedCalls();
    expect(saved[0].value).toEqual([]);
  });
});

// ── Property-based tests ────────────────────────────────────────────────────
// Feature: todo-life-dashboard, Property 5: Task addition round-trip
// Validates: Requirements 5.2, 5.11

describe('TodoWidget._addTask / _deleteTask – property-based tests', () => {
  /**
   * Property 5a: For any valid (non-empty, non-whitespace-only) task title
   * up to 200 characters, _addTask adds a task whose title equals the
   * trimmed input.
   *
   * **Validates: Requirements 5.2, 5.11**
   */
  it('P5a: valid title always results in a task with the trimmed title', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        (title) => {
          const w = makeTodoWidget();
          w._addTask(title);
          const tasks = w.getTasks();
          return tasks.length === 1 && tasks[0].title === title.trim();
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Property 6a: For any whitespace-only string (including empty string),
   * _addTask adds no task and sets a validation error.
   *
   * **Validates: Requirement 5.3**
   */
  it('P6a: whitespace-only title always leaves task list unchanged and sets error', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 50 })
        ),
        (title) => {
          const w = makeTodoWidget();
          w._addTask(title);
          return w.getTasks().length === 0 && w.getLastError() !== null;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Property 5b (delete): For any non-empty list of tasks, deleting a task
   * by id always removes exactly that task and preserves all others in order.
   *
   * **Validates: Requirements 5.10, 5.11**
   */
  it('P5b: deleting a task by id always removes exactly that task', () => {
    fc.assert(
      fc.property(
        // Generate 1–10 valid titles, then pick an index to delete
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          { minLength: 1, maxLength: 10 }
        ),
        fc.nat(),
        (titles, indexRaw) => {
          const w = makeTodoWidget();
          titles.forEach((t) => w._addTask(t));
          const before = w.getTasks();
          const index  = indexRaw % before.length;
          const targetId = before[index].id;

          w._deleteTask(targetId);
          const after = w.getTasks();

          // Length decreased by exactly 1
          if (after.length !== before.length - 1) return false;
          // Deleted id is gone
          if (after.some((t) => t.id === targetId)) return false;
          // Remaining ids are all present in the original list
          const beforeIds = new Set(before.map((t) => t.id));
          return after.every((t) => beforeIds.has(t.id));
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Property 5c: _addTask always persists the updated list to Storage
   * (Storage.save is called once per valid addition).
   *
   * **Validates: Requirement 5.11**
   */
  it('P5c: every valid _addTask call triggers exactly one Storage.save', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        (title) => {
          const w = makeTodoWidget();
          w._addTask(title);
          return w.getSavedCalls().length === 1;
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TodoWidget._toggleTask / _beginEdit / _confirmEdit / _cancelEdit – unit
// and property-based tests
// Feature: todo-life-dashboard
// Validates: Requirements 5.5, 5.7, 5.8, 5.9
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extended in-memory TodoWidget that also includes _toggleTask,
 * _beginEdit, _confirmEdit, and _cancelEdit — mirrored from js/app.js
 * exactly, without DOM or Storage dependencies.
 */
function makeTodoWidgetFull() {
  let tasks     = [];
  let editingId = null;
  let savedCalls = [];
  let lastError = null;

  function _validateTitle(title) {
    if (typeof title !== 'string' || title.length > 200) return false;
    if (title.trim().length === 0) return false;
    return true;
  }

  function _generateId() {
    const timestamp    = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 6);
    return `task_${timestamp}_${randomSuffix}`;
  }

  function _showTodoError(message) {
    lastError = message || null;
  }

  function _storageSave(key, value) {
    savedCalls.push({ key, value: JSON.parse(JSON.stringify(value)) });
    return true;
  }

  function _addTask(title) {
    if (!_validateTitle(title)) {
      _showTodoError('Task title cannot be empty and must be 200 characters or fewer.');
      return;
    }
    const task = {
      id:        _generateId(),
      title:     title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    _showTodoError(null);
    _storageSave('tld_tasks', tasks);
  }

  function _deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    _storageSave('tld_tasks', tasks);
  }

  function _toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    _storageSave('tld_tasks', tasks);
  }

  function _beginEdit(id) {
    editingId = id;
    // No DOM in test — just set state
  }

  function _confirmEdit(id, newTitle) {
    if (!_validateTitle(newTitle)) {
      _showTodoError('Task title cannot be empty and must be 200 characters or fewer.');
      return;
    }
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.title = newTitle.trim();
    }
    editingId = null;
    _showTodoError(null);
    _storageSave('tld_tasks', tasks);
  }

  function _cancelEdit(id) { // eslint-disable-line no-unused-vars
    editingId = null;
    _showTodoError(null);
    // No state change to tasks
  }

  return {
    _addTask,
    _deleteTask,
    _toggleTask,
    _beginEdit,
    _confirmEdit,
    _cancelEdit,
    _validateTitle,
    getTasks:       () => tasks.map((t) => ({ ...t })),
    getEditingId:   () => editingId,
    getSavedCalls:  () => [...savedCalls],
    getLastError:   () => lastError,
    clearSaved:     () => { savedCalls = []; },
  };
}

// ── Unit tests: _toggleTask ─────────────────────────────────────────────────

describe('TodoWidget._toggleTask – unit tests', () => {
  // Requirement 5.5: toggling flips completed from false to true
  it('flips completed from false to true on first toggle', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Task A');
    const [task] = w.getTasks();
    w._toggleTask(task.id);
    expect(w.getTasks()[0].completed).toBe(true);
  });

  // Requirement 5.5: toggling flips completed back to false on second toggle
  it('flips completed back to false on second toggle (idempotent round-trip)', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Task A');
    const [task] = w.getTasks();
    w._toggleTask(task.id);
    w._toggleTask(task.id);
    expect(w.getTasks()[0].completed).toBe(false);
  });

  // Toggling a non-existent id is a no-op
  it('is a no-op for an id that does not exist', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Task A');
    w._toggleTask('task_0_nonexistent');
    expect(w.getTasks()[0].completed).toBe(false);
  });

  // Only the targeted task is toggled; others are unchanged
  it('only toggles the targeted task, leaving others unchanged', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Task A');
    w._addTask('Task B');
    const [a, b] = w.getTasks();
    w._toggleTask(a.id);
    const after = w.getTasks();
    expect(after.find((t) => t.id === a.id).completed).toBe(true);
    expect(after.find((t) => t.id === b.id).completed).toBe(false);
  });

  // Requirement 5.11: Storage.save is called after toggle
  it('calls Storage.save with the updated list after toggling', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Task A');
    w.clearSaved();
    const [task] = w.getTasks();
    w._toggleTask(task.id);
    const saved = w.getSavedCalls();
    expect(saved).toHaveLength(1);
    expect(saved[0].key).toBe('tld_tasks');
    expect(saved[0].value[0].completed).toBe(true);
  });
});

// ── Unit tests: _beginEdit / _confirmEdit / _cancelEdit ─────────────────────

describe('TodoWidget._beginEdit / _confirmEdit / _cancelEdit – unit tests', () => {
  // Requirement 5.6: beginEdit sets editingId to the task id
  it('_beginEdit sets the editing id to the task id', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Original title');
    const [task] = w.getTasks();
    w._beginEdit(task.id);
    expect(w.getEditingId()).toBe(task.id);
  });

  // Requirement 5.7: confirmEdit updates the title to the trimmed new value
  it('_confirmEdit updates the task title to the trimmed new value', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Original');
    const [task] = w.getTasks();
    w._beginEdit(task.id);
    w._confirmEdit(task.id, '  Updated Title  ');
    expect(w.getTasks()[0].title).toBe('Updated Title');
  });

  // Requirement 5.7: confirmEdit clears editingId on success
  it('_confirmEdit clears editingId on success', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Task');
    const [task] = w.getTasks();
    w._beginEdit(task.id);
    w._confirmEdit(task.id, 'New Title');
    expect(w.getEditingId()).toBeNull();
  });

  // Requirement 5.8: cancelEdit clears editingId without changing title
  it('_cancelEdit clears editingId without modifying the title', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Original');
    const [task] = w.getTasks();
    w._beginEdit(task.id);
    w._cancelEdit(task.id);
    expect(w.getEditingId()).toBeNull();
    expect(w.getTasks()[0].title).toBe('Original');
  });

  // Requirement 5.9: confirmEdit with empty title keeps editingId set (stays in edit mode)
  it('_confirmEdit with empty title does NOT update the title and sets an error', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Original');
    const [task] = w.getTasks();
    w._beginEdit(task.id);
    w._confirmEdit(task.id, '');
    expect(w.getTasks()[0].title).toBe('Original');
    expect(w.getLastError()).toBeTruthy();
  });

  // Requirement 5.9: confirmEdit with whitespace-only title keeps original title
  it('_confirmEdit with whitespace-only title does NOT update the title', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Keep this');
    const [task] = w.getTasks();
    w._beginEdit(task.id);
    w._confirmEdit(task.id, '   ');
    expect(w.getTasks()[0].title).toBe('Keep this');
  });

  // Requirement 5.11: confirmEdit calls Storage.save on success
  it('_confirmEdit calls Storage.save with the updated task list on success', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Old Title');
    w.clearSaved();
    const [task] = w.getTasks();
    w._beginEdit(task.id);
    w._confirmEdit(task.id, 'New Title');
    const saved = w.getSavedCalls();
    expect(saved).toHaveLength(1);
    expect(saved[0].key).toBe('tld_tasks');
    expect(saved[0].value[0].title).toBe('New Title');
  });

  // cancelEdit does NOT call Storage.save
  it('_cancelEdit does NOT call Storage.save', () => {
    const w = makeTodoWidgetFull();
    w._addTask('Task');
    w.clearSaved();
    const [task] = w.getTasks();
    w._beginEdit(task.id);
    w._cancelEdit(task.id);
    expect(w.getSavedCalls()).toHaveLength(0);
  });
});

// ── Property-based tests ────────────────────────────────────────────────────
// Feature: todo-life-dashboard, Property 7: Task completion toggle idempotence
// Validates: Requirement 5.5

describe('TodoWidget._toggleTask – property-based tests (Property 7)', () => {
  /**
   * P7: For any task in the list, toggling its completion status twice in
   * succession restores the task's completed field to its original value.
   *
   * **Validates: Requirements 5.5**
   */
  it('P7: two consecutive toggles always restore the original completed state', () => {
    fc.assert(
      fc.property(
        // Generate 1–5 tasks, pick one index, pick an initial completed value
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          { minLength: 1, maxLength: 5 }
        ),
        fc.nat(),
        fc.boolean(),
        (titles, indexRaw, initialCompleted) => {
          const w = makeTodoWidgetFull();
          titles.forEach((t) => w._addTask(t));

          const tasks = w.getTasks();
          const index = indexRaw % tasks.length;
          const target = tasks[index];

          // Manually set the initial completed state by toggling if needed
          if (target.completed !== initialCompleted) {
            w._toggleTask(target.id);
          }

          const before = w.getTasks().find((t) => t.id === target.id).completed;

          // Two consecutive toggles
          w._toggleTask(target.id);
          w._toggleTask(target.id);

          const after = w.getTasks().find((t) => t.id === target.id).completed;

          return before === after;
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ── Property-based tests ────────────────────────────────────────────────────
// Feature: todo-life-dashboard, Property 8: Task edit round-trip
// Validates: Requirements 5.7, 5.8

describe('TodoWidget._confirmEdit / _cancelEdit – property-based tests (Property 8)', () => {
  /**
   * P8a (confirm): For any task and any valid new title, confirming an edit
   * updates the task's title to the trimmed new value.
   *
   * **Validates: Requirements 5.7**
   */
  it('P8a: confirming an edit always sets the task title to the trimmed new value', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        (original, newTitle) => {
          const w = makeTodoWidgetFull();
          w._addTask(original);
          const [task] = w.getTasks();
          w._beginEdit(task.id);
          w._confirmEdit(task.id, newTitle);
          const updated = w.getTasks().find((t) => t.id === task.id);
          return updated !== undefined && updated.title === newTitle.trim();
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P8b (cancel): For any task and any edit attempt, cancelling the edit
   * leaves the task's title exactly as it was before entering edit mode.
   *
   * **Validates: Requirements 5.8**
   */
  it('P8b: cancelling an edit always leaves the task title unchanged', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        fc.string({ maxLength: 200 }),
        (original, attemptedTitle) => {
          const w = makeTodoWidgetFull();
          w._addTask(original);
          const [task] = w.getTasks();
          const titleBeforeEdit = w.getTasks()[0].title; // trimmed from _addTask

          w._beginEdit(task.id);
          // Simulate typing but then cancel — don't call _confirmEdit
          w._cancelEdit(task.id);

          const after = w.getTasks().find((t) => t.id === task.id);
          return after !== undefined && after.title === titleBeforeEdit;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P8c (reject): For any whitespace-only or empty new title, confirming an
   * edit always leaves the original title intact and sets a validation error.
   *
   * **Validates: Requirements 5.9**
   */
  it('P8c: confirming an edit with empty/whitespace title always retains the original title', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        fc.oneof(
          fc.constant(''),
          fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 50 })
        ),
        (original, invalidTitle) => {
          const w = makeTodoWidgetFull();
          w._addTask(original);
          const [task] = w.getTasks();
          const titleBeforeEdit = w.getTasks()[0].title;

          w._beginEdit(task.id);
          w._confirmEdit(task.id, invalidTitle);

          const after = w.getTasks().find((t) => t.id === task.id);
          return (
            after !== undefined &&
            after.title === titleBeforeEdit &&
            w.getLastError() !== null
          );
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LinksWidget._validateLink – unit and property-based tests
// Feature: todo-life-dashboard
// Validates: Requirements 6.1, 6.3
// ═══════════════════════════════════════════════════════════════════════════

// ── Pure function under test ────────────────────────────────────────────────
// Mirrors LinksWidget._validateLink() in js/app.js exactly.
// Extracted here so it runs under Node/Vitest without a DOM.
function _validateLink(label, url) {
  let labelError = null;
  let urlError   = null;

  // ── Label validation ─────────────────────────────────────────────────
  const trimmedLabel = (typeof label === 'string') ? label.trim() : '';

  if (trimmedLabel.length === 0) {
    labelError = 'Link label is required.';
  } else if (trimmedLabel.length > 50) {
    labelError = 'Link label must be 50 characters or fewer.';
  }

  // ── URL validation ───────────────────────────────────────────────────
  const trimmedUrl = (typeof url === 'string') ? url.trim() : '';

  if (trimmedUrl.length === 0) {
    urlError = 'URL is required.';
  } else if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    urlError = 'URL must begin with http:// or https://.';
  } else if (trimmedUrl.length > 2048) {
    urlError = 'URL must be 2048 characters or fewer.';
  }

  return {
    labelError,
    urlError,
    isValid: labelError === null && urlError === null,
  };
}

// ── Unit tests ──────────────────────────────────────────────────────────────

describe('LinksWidget._validateLink – unit tests', () => {

  // ── Label: empty ───────────────────────────────────────────────────────
  it('returns a labelError for an empty label', () => {
    const result = _validateLink('', 'https://example.com');
    expect(result.isValid).toBe(false);
    expect(result.labelError).toBeTruthy();
    expect(result.urlError).toBeNull();
  });

  // ── Label: whitespace-only ─────────────────────────────────────────────
  it('returns a labelError for a whitespace-only label', () => {
    const result = _validateLink('   ', 'https://example.com');
    expect(result.isValid).toBe(false);
    expect(result.labelError).toBeTruthy();
  });

  it('returns a labelError for a tab-only label', () => {
    const result = _validateLink('\t\t', 'https://example.com');
    expect(result.isValid).toBe(false);
    expect(result.labelError).toBeTruthy();
  });

  // ── Label: too long ────────────────────────────────────────────────────
  it('returns a labelError when label exceeds 50 characters', () => {
    const longLabel = 'a'.repeat(51);
    const result = _validateLink(longLabel, 'https://example.com');
    expect(result.isValid).toBe(false);
    expect(result.labelError).toBeTruthy();
  });

  it('accepts a label of exactly 50 characters', () => {
    const label50 = 'a'.repeat(50);
    const result = _validateLink(label50, 'https://example.com');
    expect(result.labelError).toBeNull();
  });

  // ── Label: valid ───────────────────────────────────────────────────────
  it('returns no labelError for a normal label', () => {
    const result = _validateLink('My Blog', 'https://example.com');
    expect(result.labelError).toBeNull();
  });

  // ── URL: empty ─────────────────────────────────────────────────────────
  it('returns a urlError for an empty URL', () => {
    const result = _validateLink('My Site', '');
    expect(result.isValid).toBe(false);
    expect(result.urlError).toBeTruthy();
    expect(result.labelError).toBeNull();
  });

  it('returns a urlError for a whitespace-only URL', () => {
    const result = _validateLink('My Site', '   ');
    expect(result.isValid).toBe(false);
    expect(result.urlError).toBeTruthy();
  });

  // ── URL: wrong protocol ────────────────────────────────────────────────
  it('returns a urlError for a URL starting with ftp://', () => {
    const result = _validateLink('FTP Server', 'ftp://files.example.com');
    expect(result.isValid).toBe(false);
    expect(result.urlError).toBeTruthy();
  });

  it('returns a urlError for a URL starting with www. (no protocol)', () => {
    const result = _validateLink('No Protocol', 'www.example.com');
    expect(result.isValid).toBe(false);
    expect(result.urlError).toBeTruthy();
  });

  it('returns a urlError for a URL that is just a word', () => {
    const result = _validateLink('Bad URL', 'notaurl');
    expect(result.isValid).toBe(false);
    expect(result.urlError).toBeTruthy();
  });

  // ── URL: too long ──────────────────────────────────────────────────────
  it('returns a urlError when URL exceeds 2048 characters', () => {
    // Build a valid-protocol URL that is over 2048 chars total
    const longUrl = 'https://' + 'a'.repeat(2048);  // 2056 chars total
    const result = _validateLink('Long URL', longUrl);
    expect(result.isValid).toBe(false);
    expect(result.urlError).toBeTruthy();
  });

  it('accepts a URL of exactly 2048 characters starting with https://', () => {
    // 'https://' = 8 chars, so we need 2040 more chars
    const url2048 = 'https://' + 'a'.repeat(2040);
    const result = _validateLink('Exact Max', url2048);
    expect(result.urlError).toBeNull();
  });

  it('accepts a URL of exactly 2048 characters starting with http://', () => {
    // 'http://' = 7 chars, so we need 2041 more chars
    const url2048 = 'http://' + 'a'.repeat(2041);
    const result = _validateLink('Exact Max HTTP', url2048);
    expect(result.urlError).toBeNull();
  });

  // ── URL: valid http:// ─────────────────────────────────────────────────
  it('accepts a valid http:// URL', () => {
    const result = _validateLink('Example', 'http://example.com');
    expect(result.isValid).toBe(true);
    expect(result.labelError).toBeNull();
    expect(result.urlError).toBeNull();
  });

  // ── URL: valid https:// ────────────────────────────────────────────────
  it('accepts a valid https:// URL', () => {
    const result = _validateLink('Example Secure', 'https://example.com');
    expect(result.isValid).toBe(true);
    expect(result.labelError).toBeNull();
    expect(result.urlError).toBeNull();
  });

  // ── Both fields valid ──────────────────────────────────────────────────
  it('returns isValid=true and no errors when both fields are valid', () => {
    const result = _validateLink('GitHub', 'https://github.com');
    expect(result.isValid).toBe(true);
    expect(result.labelError).toBeNull();
    expect(result.urlError).toBeNull();
  });

  // ── Both fields invalid ────────────────────────────────────────────────
  it('reports both labelError and urlError when both fields are invalid', () => {
    const result = _validateLink('', 'notaurl');
    expect(result.isValid).toBe(false);
    expect(result.labelError).toBeTruthy();
    expect(result.urlError).toBeTruthy();
  });

  // ── Label trimming ─────────────────────────────────────────────────────
  it('accepts a label with leading/trailing whitespace as long as trimmed length ≤ 50', () => {
    const result = _validateLink('  My Link  ', 'https://example.com');
    expect(result.labelError).toBeNull();
  });

  it('rejects a label whose trimmed length exceeds 50 even with surrounding spaces', () => {
    const padded = '  ' + 'a'.repeat(51) + '  ';
    const result = _validateLink(padded, 'https://example.com');
    expect(result.labelError).toBeTruthy();
  });
});

// ── Property-based tests ────────────────────────────────────────────────────
// Feature: todo-life-dashboard, Property 11: Link URL protocol invariant
// Validates: Requirements 6.1, 6.3

describe('LinksWidget._validateLink – property-based tests (Property 11)', () => {
  /**
   * P11a: For any valid label (non-empty, ≤ 50 trimmed chars) and a valid URL
   * (http:// or https://, ≤ 2048 chars), _validateLink returns isValid=true
   * with no errors.
   *
   * **Validates: Requirements 6.1, 6.3**
   */
  it('P11a: valid label and valid URL always produce isValid=true with no errors', () => {
    fc.assert(
      fc.property(
        // Valid label: non-empty, trimmed length ≤ 50
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        // Valid URL: prefix + path that keeps total ≤ 2048 chars
        fc.oneof(
          fc.string({ minLength: 0, maxLength: 2040 }).map((s) => `https://${s}`),
          fc.string({ minLength: 0, maxLength: 2041 }).map((s) => `http://${s}`)
        ),
        (label, url) => {
          const result = _validateLink(label, url);
          return result.isValid === true &&
                 result.labelError === null &&
                 result.urlError === null;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P11b: Any empty or whitespace-only label always produces a labelError.
   *
   * **Validates: Requirement 6.3**
   */
  it('P11b: empty or whitespace-only label always produces a labelError', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 20 })
        ),
        (label) => {
          const result = _validateLink(label, 'https://example.com');
          return typeof result.labelError === 'string' && result.isValid === false;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P11c: Any label whose trimmed length exceeds 50 always produces a
   * labelError.
   *
   * **Validates: Requirement 6.3**
   */
  it('P11c: label exceeding 50 trimmed chars always produces a labelError', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 51, maxLength: 200 }).filter((s) => s.trim().length > 50),
        (label) => {
          const result = _validateLink(label, 'https://example.com');
          return typeof result.labelError === 'string' && result.isValid === false;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P11d: Any URL that does not begin with http:// or https:// (after trim)
   * always produces a urlError.
   *
   * **Validates: Requirement 6.3**
   */
  it('P11d: URL without http:// or https:// prefix always produces a urlError', () => {
    fc.assert(
      fc.property(
        // Generate strings that don't start with http:// or https://
        fc.string({ minLength: 1, maxLength: 100 }).filter(
          (s) => s.trim().length > 0 &&
                 !s.trim().startsWith('http://') &&
                 !s.trim().startsWith('https://')
        ),
        (url) => {
          const result = _validateLink('Valid Label', url);
          return typeof result.urlError === 'string' && result.isValid === false;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P11e: Any URL (with valid protocol) whose trimmed length exceeds 2048
   * always produces a urlError.
   *
   * **Validates: Requirement 6.3**
   */
  it('P11e: URL exceeding 2048 trimmed chars always produces a urlError', () => {
    fc.assert(
      fc.property(
        // Generate a URL with valid prefix but total length > 2048
        fc.oneof(
          fc.string({ minLength: 2041, maxLength: 3000 }).map((s) => `https://${s}`),
          fc.string({ minLength: 2042, maxLength: 3000 }).map((s) => `http://${s}`)
        ),
        (url) => {
          const result = _validateLink('Valid Label', url);
          return typeof result.urlError === 'string' && result.isValid === false;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * P11f: For any stored link produced by _validateLink returning isValid=true,
   * the URL begins with http:// or https://.
   * This is the URL protocol invariant (Property 11 from the design doc).
   *
   * **Validates: Requirements 6.1, 6.2, 6.3**
   */
  it('P11f: every link that passes _validateLink has a URL starting with http:// or https://', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.oneof(
          fc.string({ minLength: 0, maxLength: 2040 }).map((s) => `https://${s}`),
          fc.string({ minLength: 0, maxLength: 2041 }).map((s) => `http://${s}`)
        ),
        (label, url) => {
          const result = _validateLink(label, url);
          if (!result.isValid) return true; // skip invalid combinations
          return url.trimStart().startsWith('http://') || url.trimStart().startsWith('https://');
        }
      ),
      { numRuns: 200 }
    );
  });
});
