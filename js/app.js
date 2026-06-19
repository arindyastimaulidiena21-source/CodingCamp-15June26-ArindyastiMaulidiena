/**
 * js/app.js
 * To-Do Life Dashboard — all application logic
 *
 * Module structure (each separated by a comment block):
 *   1. Storage        — localStorage read/write with error handling
 *   2. ThemeManager   — light/dark theme toggle
 *   3. GreetingWidget — live clock, date, greeting, custom name
 *   4. TimerWidget    — Pomodoro countdown + preset management
 *   5. TodoWidget     — task CRUD (add, edit, toggle, delete)
 *   6. LinksWidget    — quick-access link buttons
 *   7. Bootstrap      — DOMContentLoaded init block
 *
 * No frameworks, no build step. Runs directly in the browser from the
 * file system or any static server.
 *
 * Populated incrementally from Task 3 onwards.
 */

/* ============================================================
   1. STORAGE MODULE
   Centralizes all localStorage access. All other modules must
   read and write data exclusively through this module.
   Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
   ============================================================ */

const Storage = (() => {
  /**
   * Namespaced keys for every data category stored in localStorage.
   * Each key is unique to prevent collisions with other apps.
   * Requirement 8.2
   */
  const KEYS = {
    tasks:   'tld_tasks',
    links:   'tld_links',
    presets: 'tld_presets',
    name:    'tld_name',
    theme:   'tld_theme',
  };

  // ── Banner helpers ──────────────────────────────────────────────────────

  /**
   * Displays a message inside the given banner element and makes it visible.
   * The banner elements already exist in index.html with the `hidden` attribute;
   * this helper simply populates their text and removes `hidden`.
   *
   * @param {string} bannerId   - The element id ('storage-error-banner' or
   *                              'storage-warning-banner').
   * @param {string} message    - The human-readable message to display.
   */
  function _showBanner(bannerId, message) {
    const banner = document.getElementById(bannerId);
    if (!banner) return; // guard: element not in DOM yet (e.g. during tests)
    banner.textContent = message;
    banner.removeAttribute('hidden');
  }

  /**
   * Shows the error banner (assertive aria-live region).
   * Used when a save operation fails (e.g. QuotaExceededError).
   * Requirement 8.4
   *
   * @param {string} message
   */
  function _showErrorBanner(message) {
    _showBanner('storage-error-banner', message);
  }

  /**
   * Shows the warning banner (polite aria-live region).
   * Used when stored JSON cannot be parsed (corrupted data).
   * Requirement 8.5
   *
   * @param {string} message
   */
  function _showWarningBanner(message) {
    _showBanner('storage-warning-banner', message);
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Reads and JSON-parses a value from localStorage.
   *
   * - Returns the parsed value on success.
   * - Returns `null` if the key does not exist in localStorage.
   * - On JSON parse failure (corrupted data): logs the error, displays a
   *   warning banner, and returns `null` so the caller can fall back to
   *   the default value for that data category.
   *
   * Requirements: 8.1, 8.3, 8.5
   *
   * @param {string} key - One of the values from Storage.KEYS.
   * @returns {any|null}  Parsed value, or null on missing/corrupted data.
   */
  function read(key) {
    const raw = localStorage.getItem(key);

    // Key not present — not an error, caller will use default value
    if (raw === null) return null;

    try {
      return JSON.parse(raw);
    } catch (err) {
      // SyntaxError: stored string is not valid JSON
      console.warn(`[Storage] Corrupted data at key "${key}":`, err);
      _showWarningBanner('Corrupted data was reset.');
      return null;
    }
  }

  /**
   * JSON-serializes `value` and writes it to localStorage under `key`.
   *
   * - Returns `true` on success.
   * - On QuotaExceededError or any other DOMException: logs the error,
   *   displays an error banner, and returns `false` so the caller can
   *   surface a save-failure message to the user.
   *
   * Requirements: 8.1, 8.4
   *
   * @param {string} key   - One of the values from Storage.KEYS.
   * @param {any}    value - The data to persist; must be JSON-serializable.
   * @returns {boolean}    `true` if saved successfully, `false` on failure.
   */
  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      // QuotaExceededError is a DOMException; catch both named variants
      if (err instanceof DOMException) {
        console.error(`[Storage] Save failed for key "${key}" (QuotaExceededError or DOMException):`, err);
      } else {
        console.error(`[Storage] Unexpected save error for key "${key}":`, err);
      }
      _showErrorBanner('Data could not be saved.');
      return false;
    }
  }

  // Expose the public interface
  return { KEYS, read, save };
})();

/* ============================================================
   2. THEME MANAGER
   Manages light/dark theme switching. Applies the theme via a
   `data-theme` attribute on the root <html> element. CSS custom
   properties switch via the `[data-theme="dark"]` selector.
   Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
   ============================================================ */

const ThemeManager = (() => {
  /** The two valid theme values. */
  const THEMES = { LIGHT: 'light', DARK: 'dark' };

  /** Currently active theme — kept in module scope so _toggle() can flip it. */
  let _activeTheme = THEMES.LIGHT;

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Applies `theme` to the document and updates the toggle button UI to
   * reflect the active theme.
   *
   * - Sets `data-theme` attribute on <html>  (Requirement 7.4)
   * - Updates the toggle icon: ☀️ when light is active (you're switching TO
   *   dark), 🌙 when dark is active (you're switching TO light).
   * - Updates aria-label and aria-pressed on the button.  (Requirement 7.2)
   *
   * @param {string} theme - Either "light" or "dark".
   */
  function _apply(theme) {
    _activeTheme = theme;

    // Apply to root element so CSS custom properties pick it up immediately
    document.documentElement.setAttribute('data-theme', theme);

    // Update toggle button appearance
    const btn  = document.getElementById('theme-toggle');
    const icon = btn ? btn.querySelector('.theme-toggle-icon') : null;

    if (icon) {
      if (theme === THEMES.DARK) {
        // Dark is active → show moon icon; clicking will switch back to light
        icon.textContent = '🌙';
      } else {
        // Light is active → show sun icon; clicking will switch to dark
        icon.textContent = '☀️';
      }
    }

    if (btn) {
      const isPressed = theme === THEMES.DARK;
      btn.setAttribute('aria-pressed', String(isPressed));
      btn.setAttribute(
        'aria-label',
        theme === THEMES.DARK ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
  }

  /**
   * Flips the active theme (light ↔ dark), applies it, and persists the new
   * value to Storage.
   *
   * Requirements: 7.3, 7.4, 7.5
   */
  function _toggle() {
    const newTheme = _activeTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    _apply(newTheme);
    Storage.save(Storage.KEYS.theme, newTheme);
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Initialises the ThemeManager.
   *
   * - Applies `storedTheme` if it is a valid theme value; falls back to
   *   "light" if the value is null/undefined or unrecognised.  (Req 7.1, 7.6)
   * - Wires the theme-toggle button's click event to `_toggle()`.  (Req 7.2)
   *
   * @param {string|null} storedTheme - The theme value read from Storage, or
   *                                    null if nothing has been persisted yet.
   */
  function init(storedTheme) {
    // Validate the stored value; any unrecognised value defaults to light
    const theme =
      storedTheme === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;

    _apply(theme);

    // Wire toggle button
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', _toggle);
    }
  }

  return { init, _toggle, _apply };
})();

/* ============================================================
   3. GREETING WIDGET
   Displays the current time, date, and a time-of-day greeting.
   Supports a customizable user name appended to the greeting.
   Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1–2.6
   ============================================================ */

const GreetingWidget = (() => {

  // ── Module-level state ───────────────────────────────────────────────────

  /** The user's display name (empty string = no name set). */
  let _name = '';

  /**
   * The calendar day (0–6, from Date.getDay()) last rendered by _tick().
   * Used to detect midnight crossings without a page reload.
   * Initialised to -1 so the first tick always writes the date.
   * Requirement 1.7
   */
  let _lastDay = -1;

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Maps a local hour (0–23) to a time-of-day greeting string.
   *
   * Mapping:
   *   05–11  →  "Good Morning"
   *   12–17  →  "Good Afternoon"
   *   18–20  →  "Good Evening"
   *   21–23, 00–04  →  "Good Night"
   *
   * This is a pure function: given the same hour it always returns the
   * same string, with no side effects.
   *
   * Requirements: 1.3, 1.4, 1.5, 1.6
   *
   * @param {number} hour - Integer in the range [0, 23].
   * @returns {string} One of the four greeting strings.
   */
  function _getGreeting(hour) {
    if (hour >= 5 && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 17) return 'Good Afternoon';
    if (hour >= 18 && hour <= 20) return 'Good Evening';
    // Covers 21–23 and 00–04
    return 'Good Night';
  }

  /**
   * Updates the clock, date, and greeting elements in the DOM.
   * Called once per second by the setInterval started in init().
   *
   * - Formats and displays time in HH:MM (Requirement 1.1)
   * - Formats and displays date as "Weekday, DD Month YYYY" (Requirement 1.2)
   * - Updates greeting text via _getGreeting() (Requirements 1.3–1.6)
   * - Detects day change across midnight and updates date display (Requirement 1.7)
   */
  function _tick() {
    const now = new Date();

    // ── Clock: HH:MM (24-hour, zero-padded) ── Requirement 1.1
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const clockEl = document.getElementById('clock-display');
    if (clockEl) clockEl.textContent = `${hh}:${mm}`;

    // ── Date: detect day change (midnight crossing) ── Requirement 1.7
    const currentDay = now.getDay();
    if (currentDay !== _lastDay) {
      _lastDay = currentDay;

      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const weekday = DAYS[now.getDay()];
      const dd      = String(now.getDate()).padStart(2, '0');
      const month   = MONTHS[now.getMonth()];
      const yyyy    = now.getFullYear();

      const dateEl = document.getElementById('date-display');
      if (dateEl) dateEl.textContent = `${weekday}, ${dd} ${month} ${yyyy}`;
    }

    // ── Greeting text ── Requirements 1.3–1.6
    const greeting    = _getGreeting(now.getHours());
    const displayText = _name ? `${greeting}, ${_name}` : greeting;
    const greetingEl  = document.getElementById('greeting-text');
    if (greetingEl) greetingEl.textContent = displayText;
  }

  /**
   * Validates, saves, and applies a custom user name to the greeting.
   *
   * Validation rules:
   *   - Empty string or whitespace-only → remove stored name, show greeting
   *     without suffix, clear any previous error.  (Requirements 2.4, 2.5)
   *   - Name trimmed to more than 50 characters → show inline validation
   *     error, do not save.  (Requirement 2.1)
   *   - Valid name → trim, append to greeting, persist to Storage.
   *     If Storage.save() returns false, show an inline error message.
   *     (Requirements 2.2, 2.3, 2.6)
   *
   * @param {string} name - Raw value from the name input field.
   */
  function _setName(name) {
    const errorEl = document.getElementById('name-error');

    // Helper: show or hide the inline error paragraph
    function _showNameError(message) {
      if (!errorEl) return;
      if (message) {
        errorEl.textContent = message;
        errorEl.removeAttribute('hidden');
      } else {
        errorEl.textContent = '';
        errorEl.setAttribute('hidden', '');
      }
    }

    const trimmed = (typeof name === 'string') ? name.trim() : '';

    // ── Case 1: empty / whitespace-only ── Requirements 2.4, 2.5
    if (trimmed.length === 0) {
      _name = '';
      // Remove stored name from localStorage
      Storage.save(Storage.KEYS.name, '');
      _showNameError(null);
      // Force immediate greeting update
      _tick();
      return;
    }

    // ── Case 2: exceeds 50-character maximum ── Requirement 2.1
    if (trimmed.length > 50) {
      _showNameError('Name must be 50 characters or fewer.');
      return;
    }

    // ── Case 3: valid name ── Requirements 2.2, 2.3, 2.6
    _name = trimmed;
    _showNameError(null);

    // Persist to Storage; surface failure as an inline error (Requirement 2.6)
    const saved = Storage.save(Storage.KEYS.name, _name);
    if (!saved) {
      _showNameError('Your name could not be saved. Storage may be full.');
    }

    // Force immediate greeting update so the name appears without waiting
    // for the next 1-second tick
    _tick();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Initialises the GreetingWidget.
   *
   * - Applies the stored name (if any) to the greeting display.
   * - Starts the 1-second tick interval.
   * - Calls _tick() immediately so the clock is visible before the first
   *   interval fires.
   * - Wires the name input's submit event to _setName().
   *
   * Requirements: 1.1, 2.1, 2.3, 2.4
   *
   * @param {string|null} storedName - The name value read from Storage, or
   *                                   null/empty if nothing has been saved.
   */
  function init(storedName) {
    // Restore persisted name into module state and the input field
    _name = (typeof storedName === 'string' && storedName.trim().length > 0)
      ? storedName.trim()
      : '';

    const nameInput = document.getElementById('name-input');
    if (nameInput && _name) nameInput.value = _name;

    // Kick the clock immediately — no blank display on load
    _tick();

    // Start the 1-second update loop
    setInterval(_tick, 1000);

    // Wire name-save button click → _setName()  (Requirement 2.1–2.6)
    const saveBtn = document.getElementById('name-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const input = document.getElementById('name-input');
        if (input) _setName(input.value);
      });
    }

    // Also allow pressing Enter in the name input to save
    if (nameInput) {
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') _setName(nameInput.value);
      });
    }
  }

  return { init, _tick, _getGreeting, _setName };
})();

/* ============================================================
   4. TIMER WIDGET
   Pomodoro countdown timer with preset management.
   Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
   ============================================================ */

const TimerWidget = (() => {

  // ── Module state ─────────────────────────────────────────────────────────

  /** @type {{ name: string, minutes: number }[]} */
  let presets = [];

  /** @type {{ name: string, minutes: number } | null} */
  let activePreset = null;

  /** Remaining seconds left in the current countdown. */
  let remainingSeconds = 0;

  /** True while the setInterval is running. */
  let isRunning = false;

  /** The ID returned by setInterval, or null when stopped. */
  let intervalId = null;

  // ── DOM helpers ──────────────────────────────────────────────────────────

  /** Returns the timer display `<p>` element. */
  function _displayEl()      { return document.getElementById('timer-display'); }

  /** Returns the timer notification `<p>` element. */
  function _notificationEl() { return document.getElementById('timer-notification'); }

  /** Returns the Start button. */
  function _startBtn()       { return document.getElementById('timer-start-btn'); }

  /** Returns the Stop button. */
  function _stopBtn()        { return document.getElementById('timer-stop-btn'); }

  /** Returns the Reset button. */
  function _resetBtn()       { return document.getElementById('timer-reset-btn'); }

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Converts a total number of seconds into a zero-padded `MM:SS` string.
   *
   * This is a pure function: given the same input it always returns the same
   * output with no side effects.
   *
   * Examples:
   *   0     → "00:00"
   *   65    → "01:05"
   *   3600  → "60:00"
   *   10800 → "180:00"
   *
   * Requirements: 3.1, 3.4
   *
   * @param {number} totalSeconds - Integer in the range [0, 10800].
   * @returns {string} Time formatted as `MM:SS` where MM is at least 2 digits
   *                   and SS is always exactly 2 digits.
   */
  function _formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  /**
   * Updates the timer display element to show the current `remainingSeconds`.
   */
  function _updateDisplay() {
    const el = _displayEl();
    if (el) el.textContent = _formatTime(remainingSeconds);
  }

  /**
   * Sets the Start/Stop button enabled/disabled states to reflect whether
   * the timer is running or stopped/paused.
   *
   * @param {boolean} running - `true` = timer is running; `false` = stopped.
   *
   * Requirements: 3.6, 3.7, 3.8
   */
  function _setButtonStates(running) {
    const start = _startBtn();
    const stop  = _stopBtn();
    if (start) start.disabled = running;   // disabled while running (Req 3.7)
    if (stop)  stop.disabled  = !running;  // enabled while running (Req 3.7, 3.8)
  }

  /**
   * Starts the countdown interval. Called when the user clicks Start.
   *
   * - Creates a 1 000 ms setInterval that calls `_tick()`.
   * - Disables the Start button and enables the Stop button.
   *
   * Requirement 3.2, 3.7
   */
  function _startTimer() {
    if (isRunning) return; // guard: already running

    isRunning  = true;
    intervalId = setInterval(_tick, 1000);
    _setButtonStates(true);

    // Hide any leftover completion notification from a previous run
    const notif = _notificationEl();
    if (notif) notif.setAttribute('hidden', '');
  }

  /**
   * Pauses/stops the countdown interval without resetting the time.
   * Called when the user clicks Stop, or internally when the timer completes.
   *
   * - Clears the interval.
   * - Enables the Start button and disables the Stop button.
   *
   * Requirement 3.3, 3.8
   */
  function _stopTimer() {
    if (!isRunning) return; // guard: already stopped

    clearInterval(intervalId);
    intervalId = null;
    isRunning  = false;
    _setButtonStates(false);
  }

  /**
   * Stops any active countdown and restores `remainingSeconds` to the
   * currently selected preset's full duration. Updates the display.
   *
   * Requirement 3.4
   */
  function _resetTimer() {
    // Force-stop even if isRunning guard would prevent it
    if (isRunning) _stopTimer();
    // Also handle the case where _stopTimer() guard skipped (already stopped)
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning = false;
    _setButtonStates(false);

    // Restore to preset full duration
    if (activePreset) {
      remainingSeconds = activePreset.minutes * 60;
    }
    _updateDisplay();

    // Clear any completion notification
    const notif = _notificationEl();
    if (notif) notif.setAttribute('hidden', '');
  }

  /**
   * Called on every interval tick (every 1 000 ms while the timer is running).
   *
   * - Decrements `remainingSeconds` by one.
   * - Updates the display.
   * - When `remainingSeconds` reaches 0, calls `_onTimerComplete()`.
   *
   * Requirement 3.5
   */
  function _tick() {
    remainingSeconds -= 1;
    _updateDisplay();

    if (remainingSeconds <= 0) {
      remainingSeconds = 0; // clamp so display never goes negative
      _onTimerComplete();
    }
  }

  /**
   * Fires when the countdown reaches zero.
   *
   * - Clears the interval (stops counting).
   * - Sets button states to "stopped" (Start enabled, Stop disabled).
   * - Plays an audible alert using the Web Audio API (`AudioContext`).
   * - Shows a visible notification text in the timer display area.
   *
   * Requirements: 3.5, 3.6
   */
  function _onTimerComplete() {
    // Stop the interval directly (bypassing isRunning guard by manipulating
    // state manually, since _stopTimer() itself guards on isRunning)
    clearInterval(intervalId);
    intervalId = null;
    isRunning  = false;
    _setButtonStates(false); // Requirement 3.6: Start enabled, Stop disabled

    // ── Audible alert via AudioContext ───────────────────────────────────
    // Uses the Web Audio API to produce a short beep without any audio files.
    // Gracefully skipped if AudioContext is unavailable (e.g. in tests).
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx        = new AudioCtx();
        const oscillator = ctx.createOscillator();
        const gainNode   = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // A pleasant 880 Hz tone for 0.6 seconds
        oscillator.type      = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        // Fade out to avoid a hard click at the end
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.6);

        // Close context after playback to free resources
        oscillator.addEventListener('ended', () => ctx.close());
      }
    } catch (err) {
      console.warn('[TimerWidget] AudioContext alert failed:', err);
    }

    // ── Visible notification ─────────────────────────────────────────────
    // Requirement 3.5: display a visible notification in the timer display area
    const notif = _notificationEl();
    if (notif) {
      notif.textContent = '⏰ Time is up!';
      notif.removeAttribute('hidden');
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Initialises the TimerWidget.
   *
   * - Sets up module state: loads stored presets (or the default "Pomodoro"
   *   preset if none exist), selects the first preset as active, and sets
   *   `remainingSeconds` from that preset.
   * - Updates the timer display immediately.
   * - Wires Start, Stop, and Reset button click events.
   *
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 3.8, 4.9
   *
   * @param {Array|null} storedPresets - Array of preset objects from Storage,
   *                                     or null if nothing has been saved yet.
   */
  function init(storedPresets) {
    // ── Initialize presets ───────────────────────────────────────────────
    // Requirement 4.9: default "Pomodoro" preset when none are stored
    if (Array.isArray(storedPresets) && storedPresets.length > 0) {
      presets = storedPresets;
    } else {
      presets = [{ name: 'Pomodoro', minutes: 25 }];
    }

    // Select the first preset as the active one
    activePreset     = presets[0];
    remainingSeconds = activePreset.minutes * 60;
    isRunning        = false;
    intervalId       = null;

    // ── Update display ───────────────────────────────────────────────────
    _updateDisplay();
    _setButtonStates(false); // Start enabled, Stop disabled on load (Req 3.8)

    // ── Populate preset selector on load ─────────────────────────────────
    _renderPresetSelector();

    // ── Wire button events ───────────────────────────────────────────────
    const startBtn = _startBtn();
    const stopBtn  = _stopBtn();
    const resetBtn = _resetBtn();

    if (startBtn) startBtn.addEventListener('click', _startTimer);
    if (stopBtn)  stopBtn.addEventListener('click',  _stopTimer);
    if (resetBtn) resetBtn.addEventListener('click',  _resetTimer);

    // ── Wire preset-add button / form submit ─────────────────────────────
    // Requirement 4.2, 4.6, 4.7, 4.8
    // The button is type="submit" inside #preset-add-form, so both clicking
    // the button and pressing Enter in any input trigger the form submit event.
    const presetAddForm = document.getElementById('preset-add-form');
    if (presetAddForm) {
      presetAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput    = document.getElementById('preset-name-input');
        const minutesInput = document.getElementById('preset-minutes-input');
        const name    = nameInput    ? nameInput.value                  : '';
        const minutes = minutesInput ? parseInt(minutesInput.value, 10) : NaN;
        _addPreset(name, minutes);
      });
    }

    // ── Wire preset selector change ───────────────────────────────────────
    // Requirements 4.4, 4.5
    const selectorEl = document.getElementById('preset-selector');
    if (selectorEl) {
      selectorEl.addEventListener('change', () => {
        _selectPreset(selectorEl.value);
      });
    }
  }

  // ── Preset error display ─────────────────────────────────────────────────

  /**
   * Shows or hides the #preset-error element.
   *
   * @param {string|null} message - The error message to display, or null/empty
   *                                to hide the error element.
   */
  function _showPresetError(message) {
    const el = document.getElementById('preset-error');
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.removeAttribute('hidden');
    } else {
      el.textContent = '';
      el.setAttribute('hidden', '');
    }
  }

  // ── Preset selector renderer ─────────────────────────────────────────────

  /**
   * Re-renders the #preset-selector <select> element from the current
   * `presets` array.
   *
   * - Clears all existing <option> elements.
   * - Creates one <option> per preset with value=name and
   *   textContent="{name} ({minutes} min)".
   * - Selects the option whose value matches `activePreset.name` (if any).
   *
   * Requirements: 4.2
   */
  function _renderPresetSelector() {
    const select = document.getElementById('preset-selector');
    if (!select) return;

    // Clear existing options
    select.innerHTML = '';

    // Populate with current presets
    presets.forEach((preset) => {
      const option = document.createElement('option');
      option.value       = preset.name;
      option.textContent = `${preset.name} (${preset.minutes} min)`;
      select.appendChild(option);
    });

    // Reflect the active preset in the selector
    if (activePreset) {
      select.value = activePreset.name;
    }
  }

  // ── Preset CRUD ──────────────────────────────────────────────────────────

  /**
   * Adds a new preset after validating the supplied name and minutes.
   *
   * - Enforces the 20-preset maximum (Requirement 4.8).
   * - Delegates all field-level validation to `_validatePreset()` (Req 4.7).
   * - On success: trims name, pushes to `presets`, re-renders the selector,
   *   clears the add-form inputs, and persists via Storage (Requirement 4.6).
   *
   * @param {string} name    - Raw preset name from the input field.
   * @param {number} minutes - Duration in whole minutes from the input field.
   *
   * Requirements: 4.2, 4.3, 4.6, 4.7, 4.8
   */
  function _addPreset(name, minutes) {
    // Requirement 4.8: cap at 20 presets
    if (presets.length >= 20) {
      _showPresetError('Maximum of 20 presets reached');
      return;
    }

    // Requirement 4.7: per-field validation
    const { valid, errors } = _validatePreset(name, minutes);
    if (!valid) {
      // Build a single combined error message for the error element
      const messages = [];
      if (errors.name)    messages.push(errors.name);
      if (errors.minutes) messages.push(errors.minutes);
      _showPresetError(messages.join(' '));
      return;
    }

    // Valid — commit the new preset
    const trimmedName = name.trim();
    presets.push({ name: trimmedName, minutes });

    // Re-render selector and clear inputs (Requirement 4.2)
    _renderPresetSelector();

    const nameInput    = document.getElementById('preset-name-input');
    const minutesInput = document.getElementById('preset-minutes-input');
    if (nameInput)    nameInput.value    = '';
    if (minutesInput) minutesInput.value = '';

    // Clear any previous error
    _showPresetError(null);

    // Persist (Requirement 4.6)
    Storage.save(Storage.KEYS.presets, presets);
  }

  /**
   * Removes the preset whose name matches `name` from the `presets` array.
   *
   * - If no presets remain after deletion, initializes the default "Pomodoro"
   *   preset and selects it as active (Requirement 4.9).
   * - Re-renders the #preset-selector.
   * - Persists via Storage (Requirement 4.6).
   *
   * @param {string} name - The exact name of the preset to remove.
   *
   * Requirements: 4.6, 4.9
   */
  function _deletePreset(name) {
    presets = presets.filter((p) => p.name !== name);

    // Requirement 4.9: restore default if list is now empty
    if (presets.length === 0) {
      presets = [{ name: 'Pomodoro', minutes: 25 }];
      activePreset     = presets[0];
      remainingSeconds = activePreset.minutes * 60;
      _updateDisplay();
    } else if (!activePreset || !presets.some((p) => p.name === activePreset.name)) {
      // Active preset was deleted — fall back to first available
      activePreset     = presets[0];
      remainingSeconds = activePreset.minutes * 60;
      _updateDisplay();
    }

    // Re-render selector
    _renderPresetSelector();

    // Persist (Requirement 4.6)
    Storage.save(Storage.KEYS.presets, presets);
  }

  /**
   * Validates the name and minutes values for a new timer preset.
   *
   * Validation rules:
   *   - name (trimmed) must be non-empty.          (Requirement 4.7)
   *   - name (trimmed) must be ≤ 50 characters.    (Requirement 4.7)
   *   - name must not duplicate an existing preset. (Requirement 4.3)
   *   - minutes must be an integer in [1, 180].    (Requirement 4.1, 4.7)
   *
   * @param {string} name    - The proposed preset name (raw, may have whitespace).
   * @param {number} minutes - The proposed duration in whole minutes.
   * @returns {{ valid: boolean, errors: { name?: string, minutes?: string } }}
   *   A ValidationResult object. `valid` is true only when `errors` is empty.
   */
  function _validatePreset(name, minutes) {
    const errors = {};

    // ── Name validation ──────────────────────────────────────────────────
    const trimmedName = (typeof name === 'string') ? name.trim() : '';

    if (trimmedName.length === 0) {
      // Requirement 4.7: empty name is invalid
      errors.name = 'Preset name is required.';
    } else if (trimmedName.length > 50) {
      // Requirement 4.7: name exceeding 50 characters is invalid
      errors.name = 'Preset name must be 50 characters or fewer.';
    } else {
      // Requirement 4.3: duplicate name check (case-sensitive comparison)
      const isDuplicate = presets.some(
        (p) => p.name === trimmedName
      );
      if (isDuplicate) {
        errors.name = 'A preset with this name already exists';
      }
    }

    // ── Minutes validation ───────────────────────────────────────────────
    // Requirement 4.1, 4.7: must be a whole-number integer in [1, 180]
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

  /**
   * Selects a preset by name, stopping the timer first if it is running.
   *
   * - Finds the preset in the `presets` array by matching `name`.
   * - If not found, returns early without changing state.
   * - If the timer is running, stops it before switching (Requirement 4.5).
   * - Updates `activePreset` and `remainingSeconds` to the new preset's full
   *   duration, then refreshes the countdown display (Requirement 4.4).
   *
   * Requirements: 4.4, 4.5
   *
   * @param {string} name - The exact name of the preset to select.
   */
  function _selectPreset(name) {
    const found = presets.find((p) => p.name === name);
    if (!found) return;

    // Requirement 4.5: stop the timer before switching preset
    if (isRunning) _stopTimer();

    activePreset     = found;
    remainingSeconds = activePreset.minutes * 60;

    // Requirement 4.4: update the countdown display to the preset's full duration
    _updateDisplay();
  }

  return {
    init,
    _startTimer,
    _stopTimer,
    _resetTimer,
    _tick,
    _formatTime,
    _onTimerComplete,
    _validatePreset,
    _addPreset,
    _deletePreset,
    _renderPresetSelector,
    _selectPreset,
    // Expose state accessors for testing convenience
    _getState: () => ({ presets, activePreset, remainingSeconds, isRunning, intervalId }),
    // Expose preset list mutator for testing convenience
    _setPresets: (newPresets) => { presets = newPresets; },
  };
})();

/* ============================================================
   5. TODO WIDGET
   Task list CRUD: add, edit, toggle completion, delete.
   Requirements: 5.1–5.11
   ============================================================ */

const TodoWidget = (() => {

  // ── Module state ─────────────────────────────────────────────────────────

  /** @type {{ id: string, title: string, completed: boolean, createdAt: string }[]} */
  let tasks = [];

  /** The id of the task currently in edit mode, or null. */
  let editingId = null;

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Validates a task title string.
   *
   * Rules:
   *   - Returns `false` if `title` has a raw length > 200 characters
   *     (checked on the raw input before trimming). (Requirement 5.1)
   *   - Returns `false` if `title` is empty or whitespace-only
   *     (checked after trimming). (Requirement 5.3)
   *   - Returns `true` for any other string.
   *
   * This is a pure function: no side effects.
   *
   * Requirements: 5.1, 5.2, 5.3
   *
   * @param {string} title - The raw title value from the input field.
   * @returns {boolean} `true` if the title is valid; `false` otherwise.
   */
  function _validateTitle(title) {
    // Enforce maximum length on the raw (un-trimmed) input (Requirement 5.1)
    if (typeof title !== 'string' || title.length > 200) return false;
    // Reject empty / whitespace-only strings (Requirements 5.2, 5.3)
    if (title.trim().length === 0) return false;
    return true;
  }

  /**
   * Generates a unique task identifier in the format `"task_<timestamp>_<suffix>"`.
   *
   * - `<timestamp>` is `Date.now()` (milliseconds since epoch).
   * - `<suffix>` is a 4-character random alphanumeric string derived from
   *   `Math.random().toString(36).slice(2, 6)`.
   *
   * Example output: `"task_1718437200000_x3f2"`
   *
   * Requirement 5.2
   *
   * @returns {string} A unique task id string.
   */
  function _generateId() {
    const timestamp    = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 6);
    return `task_${timestamp}_${randomSuffix}`;
  }

  // ── DOM helpers ──────────────────────────────────────────────────────────

  /** Returns the todo text input element. */
  function _inputEl()  { return document.getElementById('todo-input'); }

  /** Returns the todo error paragraph element. */
  function _errorEl()  { return document.getElementById('todo-error'); }

  /** Returns the todo task list <ul> element. */
  function _listEl()   { return document.getElementById('todo-list'); }

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Shows or hides the inline validation error for the todo input.
   *
   * @param {string|null} message - Error text, or null/empty to clear.
   */
  function _showTodoError(message) {
    const el = _errorEl();
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.removeAttribute('hidden');
    } else {
      el.textContent = '';
      el.setAttribute('hidden', '');
    }
  }

  /**
   * Fully re-renders the task list from the current `tasks` state array.
   *
   * Each task item renders:
   *   - A checkbox to toggle completion (Requirement 5.5)
   *   - The task title (line-through when completed)
   *   - An Edit button (Requirement 5.6)
   *   - A Delete button (Requirement 5.10)
   *
   * When a task is in edit mode (`editingId === task.id`) the title is
   * replaced with a text input pre-filled with the current title and a
   * Save + Cancel button pair (Requirements 5.6, 5.7, 5.8).
   *
   * Requirement 5.4
   */
  function _render() {
    const list = _listEl();
    if (!list) return;

    list.innerHTML = '';

    tasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.dataset.id = task.id;

      // ── Checkbox (toggle completion) ── Requirement 5.5
      const checkbox = document.createElement('input');
      checkbox.type    = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.className = 'todo-item__checkbox';
      checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);
      checkbox.addEventListener('change', () => _toggleTask(task.id));

      li.appendChild(checkbox);

      if (editingId === task.id) {
        // ── Edit mode ── Requirements 5.6, 5.7, 5.8
        const editInput = document.createElement('input');
        editInput.type      = 'text';
        editInput.value     = task.title;
        editInput.maxLength = 200;
        editInput.className = 'todo-item__edit-input text-input';
        editInput.setAttribute('aria-label', 'Edit task title');
        editInput.setAttribute('aria-describedby', 'todo-error');

        const saveBtn = document.createElement('button');
        saveBtn.type      = 'button';
        saveBtn.className = 'btn btn--primary btn--sm';
        saveBtn.textContent = 'Save';
        saveBtn.setAttribute('aria-label', 'Save edit');
        saveBtn.addEventListener('click', () => _confirmEdit(task.id, editInput.value));

        const cancelBtn = document.createElement('button');
        cancelBtn.type      = 'button';
        cancelBtn.className = 'btn btn--secondary btn--sm';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.setAttribute('aria-label', 'Cancel edit');
        cancelBtn.addEventListener('click', () => _cancelEdit(task.id));

        // Enter = save, Escape = cancel (Requirement 5.7, 5.8)
        editInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter')  _confirmEdit(task.id, editInput.value);
          if (e.key === 'Escape') _cancelEdit(task.id);
        });

        li.appendChild(editInput);
        li.appendChild(saveBtn);
        li.appendChild(cancelBtn);

        // Requirement 5.6: focus the input when edit mode opens
        requestAnimationFrame(() => editInput.focus());

      } else {
        // ── Normal (view) mode ── Requirement 5.4
        const titleSpan = document.createElement('span');
        titleSpan.className  = 'todo-item__title';
        titleSpan.textContent = task.title;
        if (task.completed) {
          titleSpan.style.textDecoration = 'line-through'; // Requirement 5.5
        }

        const editBtn = document.createElement('button');
        editBtn.type      = 'button';
        editBtn.className = 'btn btn--secondary btn--sm';
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
        editBtn.addEventListener('click', () => _beginEdit(task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.type      = 'button';
        deleteBtn.className = 'btn btn--danger btn--sm';
        deleteBtn.textContent = 'Delete';
        deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
        deleteBtn.addEventListener('click', () => _deleteTask(task.id));

        li.appendChild(titleSpan);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
      }

      list.appendChild(li);
    });
  }

  // ── Task CRUD ────────────────────────────────────────────────────────────

  /**
   * Adds a new task from a raw title string.
   *
   * Steps:
   *   1. Calls `_validateTitle(title)` — on failure, shows an inline error
   *      and returns early without modifying state. (Requirement 5.3)
   *   2. Creates a task object:
   *      `{ id: _generateId(), title: title.trim(), completed: false, createdAt: ISO-8601 }`
   *      (Requirement 5.2)
   *   3. Pushes the task to the `tasks` array and clears the input field.
   *   4. Calls `_render()` to update the DOM.
   *   5. Calls `Storage.save()` to persist the updated list; surfaces failure
   *      as a user-visible error banner. (Requirement 5.11)
   *
   * Requirements: 5.1, 5.2, 5.3, 5.11
   *
   * @param {string} title - Raw title value from the input field.
   */
  function _addTask(title) {
    // Requirement 5.3: validate before doing anything
    if (!_validateTitle(title)) {
      _showTodoError('Task title cannot be empty and must be 200 characters or fewer.');
      return;
    }

    // Requirement 5.2: build the task object
    const task = {
      id:        _generateId(),
      title:     title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.push(task);

    // Clear the input and any previous validation error
    const input = _inputEl();
    if (input) input.value = '';
    _showTodoError(null);

    // Requirement 5.4 / 5.11: re-render DOM and persist
    _render();
    const saved = Storage.save(Storage.KEYS.tasks, tasks);
    if (!saved) {
      // Storage error is already surfaced by the Storage module's error banner
      console.error('[TodoWidget] Failed to persist tasks after _addTask.');
    }
  }

  /**
   * Removes the task with the given `id` from the `tasks` array.
   *
   * Steps:
   *   1. Filters `tasks` to exclude the task whose `id` matches.
   *   2. Calls `_render()` to update the DOM.
   *   3. Calls `Storage.save()` to persist the updated list. (Requirement 5.11)
   *
   * Requirements: 5.10, 5.11
   *
   * @param {string} id - The unique identifier of the task to remove.
   */
  function _deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);

    _render();
    const saved = Storage.save(Storage.KEYS.tasks, tasks);
    if (!saved) {
      console.error('[TodoWidget] Failed to persist tasks after _deleteTask.');
    }
  }

  /**
   * Toggles the `completed` field of the task with the given `id`.
   *
   * Requirement 5.5
   *
   * @param {string} id - The task id to toggle.
   */
  function _toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    _render();
    Storage.save(Storage.KEYS.tasks, tasks);
  }

  /**
   * Enters edit mode for the task with the given `id`.
   *
   * Sets `editingId` to `id` and calls `_render()` so the task row
   * switches to the editable input view.
   *
   * Requirement 5.6
   *
   * @param {string} id - The task id to begin editing.
   */
  function _beginEdit(id) {
    editingId = id;
    _render();
  }

  /**
   * Confirms an edit for the task with the given `id`.
   *
   * - Validates `newTitle` via `_validateTitle()`.
   * - On failure: shows an inline validation error; stays in edit mode.
   *   (Requirement 5.9)
   * - On success: trims title, updates the task, clears `editingId`,
   *   re-renders, and persists. (Requirements 5.7, 5.11)
   *
   * @param {string} id       - The task id being confirmed.
   * @param {string} newTitle - The proposed new title from the edit input.
   */
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
    _render();
    Storage.save(Storage.KEYS.tasks, tasks);
  }

  /**
   * Cancels an edit, restoring the task row to view mode without any changes.
   *
   * Clears `editingId` and re-renders. (Requirement 5.8)
   *
   * @param {string} id - The task id whose edit is being cancelled.
   */
  function _cancelEdit(id) {  // eslint-disable-line no-unused-vars
    editingId = null;
    _showTodoError(null);
    _render();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Initialises the TodoWidget.
   *
   * - Restores tasks from Storage.
   * - Performs initial render.
   * - Wires Add button click and Enter key in the todo input to `_addTask()`.
   *
   * Requirements: 5.1, 5.2, 5.3, 5.4
   *
   * @param {Array|null} storedTasks - Task array from Storage, or null.
   */
  function init(storedTasks) {
    tasks     = Array.isArray(storedTasks) ? storedTasks : [];
    editingId = null;

    // Initial render so stored tasks are immediately visible on page load
    _render();

    // Wire Add button click (Requirement 5.1)
    const addBtn = document.getElementById('todo-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const input = _inputEl();
        if (input) _addTask(input.value);
      });
    }

    // Wire Enter key in the todo input (Requirement 5.1)
    const input = _inputEl();
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') _addTask(input.value);
      });

      // Clear validation error as soon as the user starts typing again
      input.addEventListener('input', () => _showTodoError(null));
    }
  }

  return {
    init,
    _validateTitle,
    _generateId,
    _addTask,
    _deleteTask,
    _toggleTask,
    _beginEdit,
    _confirmEdit,
    _cancelEdit,
    _render,
    // Expose state accessor for testing convenience
    _getState: () => ({ tasks: [...tasks], editingId }),
    // Expose state mutator for testing convenience (allows pre-loading tasks)
    _setTasks: (newTasks) => { tasks = [...newTasks]; editingId = null; },
  };
})();

/* ============================================================
   6. LINKS WIDGET
   Quick-access bookmark link buttons.
   Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
   ============================================================ */

const LinksWidget = (() => {

  // ── Module state ─────────────────────────────────────────────────────────

  /** @type {{ id: string, label: string, url: string }[]} */
  let links = [];

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Validates the label and URL fields for a new link.
   *
   * Validation rules:
   *   label:
   *     - Must be a non-empty, non-whitespace-only string (after trim).
   *       (Requirement 6.1, 6.3)
   *     - Must be ≤ 50 characters after trimming.  (Requirement 6.1, 6.3)
   *   url:
   *     - Must be a non-empty, non-whitespace-only string (after trim).
   *       (Requirement 6.1, 6.3)
   *     - Must begin with `http://` or `https://`.  (Requirement 6.1, 6.3)
   *     - Must be ≤ 2048 characters after trimming. (Requirement 6.1, 6.3)
   *
   * Returns a ValidationResult with per-field error strings (null when the
   * field is valid) and a top-level `isValid` boolean that is true only when
   * both fields pass all checks.
   *
   * Requirements: 6.1, 6.3
   *
   * @param {string} label - The raw label value from the input field.
   * @param {string} url   - The raw URL value from the input field.
   * @returns {{ labelError: string|null, urlError: string|null, isValid: boolean }}
   */
  function _validateLink(label, url) {
    let labelError = null;
    let urlError   = null;

    // ── Label validation ─────────────────────────────────────────────────
    const trimmedLabel = (typeof label === 'string') ? label.trim() : '';

    if (trimmedLabel.length === 0) {
      // Requirement 6.3: empty / whitespace-only label is invalid
      labelError = 'Link label is required.';
    } else if (trimmedLabel.length > 50) {
      // Requirement 6.3: label exceeding 50 characters is invalid
      labelError = 'Link label must be 50 characters or fewer.';
    }

    // ── URL validation ───────────────────────────────────────────────────
    const trimmedUrl = (typeof url === 'string') ? url.trim() : '';

    if (trimmedUrl.length === 0) {
      // Requirement 6.3: empty / whitespace-only URL is invalid
      urlError = 'URL is required.';
    } else if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      // Requirement 6.3: URL must begin with http:// or https://
      urlError = 'URL must begin with http:// or https://.';
    } else if (trimmedUrl.length > 2048) {
      // Requirement 6.3: URL exceeding 2048 characters is invalid
      urlError = 'URL must be 2048 characters or fewer.';
    }

    return {
      labelError,
      urlError,
      isValid: labelError === null && urlError === null,
    };
  }

  /**
   * Generates a unique link identifier in the format `"link_<timestamp>_<suffix>"`.
   *
   * @returns {string} A unique link id string.
   */
  function _generateId() {
    const timestamp    = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 6);
    return `link_${timestamp}_${randomSuffix}`;
  }

  // ── DOM helpers ──────────────────────────────────────────────────────────

  /** Returns the link label error element. */
  function _labelErrorEl() { return document.getElementById('link-label-error'); }

  /** Returns the link URL error element. */
  function _urlErrorEl()   { return document.getElementById('link-url-error'); }

  /** Returns the link list container element. */
  function _listEl()       { return document.getElementById('links-list'); }

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Shows or hides the inline validation error for the label input.
   *
   * @param {string|null} message - Error text, or null/empty to clear.
   */
  function _showLabelError(message) {
    const el = _labelErrorEl();
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.removeAttribute('hidden');
    } else {
      el.textContent = '';
      el.setAttribute('hidden', '');
    }
  }

  /**
   * Shows or hides the inline validation error for the URL input.
   *
   * @param {string|null} message - Error text, or null/empty to clear.
   */
  function _showUrlError(message) {
    const el = _urlErrorEl();
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.removeAttribute('hidden');
    } else {
      el.textContent = '';
      el.setAttribute('hidden', '');
    }
  }

  /**
   * Fully re-renders the link list from the current `links` state array.
   *
   * Each link renders as a button that opens the URL in a new tab, with a
   * delete control to remove the link.
   *
   * Requirements: 6.2, 6.5, 6.6
   */
  function _render() {
    const list = _listEl();
    if (!list) return;

    list.innerHTML = '';

    links.forEach((link) => {
      const li = document.createElement('li');
      li.className = 'links-item';
      li.dataset.id = link.id;

      // Link button — opens URL in new tab (Requirement 6.5)
      const btn = document.createElement('a');
      btn.href      = link.url;
      btn.target    = '_blank';
      btn.rel       = 'noopener noreferrer';
      btn.className = 'btn btn--primary links-item__btn';
      btn.textContent = link.label;

      // Delete button (Requirement 6.6)
      const deleteBtn = document.createElement('button');
      deleteBtn.type      = 'button';
      deleteBtn.className = 'btn btn--danger btn--sm';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', `Delete link: ${link.label}`);
      deleteBtn.addEventListener('click', () => _deleteLink(link.id));

      li.appendChild(btn);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  }

  // ── Link CRUD ────────────────────────────────────────────────────────────

  /**
   * Adds a new link after validating the supplied label and URL.
   *
   * - Enforces the 20-link maximum (Requirement 6.4).
   * - Delegates all field-level validation to `_validateLink()` (Req 6.3).
   * - On success: trims inputs, pushes to `links`, re-renders, and persists
   *   via Storage (Requirement 6.7).
   *
   * @param {string} label - Raw label value from the input field.
   * @param {string} url   - Raw URL value from the input field.
   *
   * Requirements: 6.2, 6.3, 6.4, 6.7
   */
  function _addLink(label, url) {
    // Requirement 6.4: cap at 20 links
    if (links.length >= 20) {
      _showLabelError('Maximum of 20 links reached');
      return;
    }

    // Requirement 6.3: per-field validation
    const { labelError, urlError, isValid } = _validateLink(label, url);
    _showLabelError(labelError);
    _showUrlError(urlError);

    if (!isValid) return;

    // Valid — commit the new link
    const link = {
      id:    _generateId(),
      label: label.trim(),
      url:   url.trim(),
    };

    links.push(link);

    // Clear form inputs and errors
    const labelInput = document.getElementById('link-label-input');
    const urlInput   = document.getElementById('link-url-input');
    if (labelInput) labelInput.value = '';
    if (urlInput)   urlInput.value   = '';
    _showLabelError(null);
    _showUrlError(null);

    // Re-render and persist (Requirements 6.2, 6.7)
    _render();
    Storage.save(Storage.KEYS.links, links);
  }

  /**
   * Removes the link with the given `id` from the `links` array.
   *
   * Requirements: 6.6, 6.7
   *
   * @param {string} id - The unique identifier of the link to remove.
   */
  function _deleteLink(id) {
    links = links.filter((l) => l.id !== id);
    _render();
    Storage.save(Storage.KEYS.links, links);
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Initialises the LinksWidget.
   *
   * - Restores links from Storage.
   * - Performs initial render.
   * - Wires the add-link form submit to `_addLink()`.
   *
   * Requirements: 6.1, 6.2, 6.3
   *
   * @param {Array|null} storedLinks - Link array from Storage, or null.
   */
  function init(storedLinks) {
    links = Array.isArray(storedLinks) ? storedLinks : [];

    // Initial render so stored links are visible on page load
    _render();

    // Wire add-link form submit (Requirement 6.1)
    const addForm = document.getElementById('link-add-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const labelInput = document.getElementById('link-label-input');
        const urlInput   = document.getElementById('link-url-input');
        const label = labelInput ? labelInput.value : '';
        const url   = urlInput   ? urlInput.value   : '';
        _addLink(label, url);
      });
    }
  }

  return {
    init,
    _validateLink,
    _addLink,
    _deleteLink,
    _render,
    // Expose state accessor for testing convenience
    _getState: () => ({ links: [...links] }),
    // Expose state mutator for testing convenience
    _setLinks:  (newLinks) => { links = [...newLinks]; },
  };
})();

/* ============================================================
   7. BOOTSTRAP
   Reads persisted data from Storage and initialises each module.
   Additional modules will be wired in here as they are implemented.
   Requirement: 8.1
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Read all persisted values up-front (null = not yet stored → use default)
  const storedTheme   = Storage.read(Storage.KEYS.theme);
  const storedName    = Storage.read(Storage.KEYS.name);
  const storedPresets = Storage.read(Storage.KEYS.presets);
  const storedTasks   = Storage.read(Storage.KEYS.tasks);
  const storedLinks   = Storage.read(Storage.KEYS.links);

  // Initialise theme first so the correct color scheme is visible immediately
  ThemeManager.init(storedTheme);

  // Initialise greeting widget (clock, date, greeting, stored name)
  GreetingWidget.init(storedName);

  // Initialise timer widget (countdown + presets)
  TimerWidget.init(storedPresets);

  // Initialise todo widget (task list CRUD)
  TodoWidget.init(storedTasks);

  // Initialise links widget (quick-access bookmarks)
  LinksWidget.init(storedLinks);
});
