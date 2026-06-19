# Implementation Plan: To-Do Life Dashboard

## Overview

Implement a purely client-side single-page productivity dashboard consisting of four independent widgets (Greeting, Timer, Todo, Links) plus a global theme toggle and localStorage persistence layer. The project is three files: `index.html`, `css/style.css`, and `js/app.js`. No build step or framework is required.

Implementation proceeds in layers: HTML skeleton → CSS theming foundation → Storage module → widget-by-widget logic → accessibility polish → property-based and unit tests.

---

## Tasks

- [x] 1. Scaffold project structure and HTML skeleton
  - Create `index.html` at the workspace root with semantic landmark regions: `<header>` for the theme toggle, `<main>` containing four `<section>` elements for Greeting, Timer, Todo, and Links widgets.
  - Create `css/style.css` (empty placeholder with file-level comment).
  - Create `js/app.js` (empty placeholder with file-level comment).
  - Link `css/style.css` and `js/app.js` from `index.html` with correct relative paths.
  - Add all required form inputs, buttons, and container `<div>` / `<ul>` / `<ol>` elements per the design's component interfaces, with `id` and `class` attributes that the JS modules will target.
  - Add `aria-label`, `aria-describedby` placeholders and `role` attributes required by Requirement 10.6.
  - _Requirements: 9.3, 10.6_

- [x] 2. Implement CSS theming and base styles
  - [x] 2.1 Define CSS custom properties and base layout
    - Declare `:root` CSS custom properties for light theme colors (background, text, accent, border, focus-ring).
    - Declare `[data-theme="dark"]` overrides for all the same properties.
    - Write base layout: dashboard grid/flexbox, widget card styles, base font size ≥ 14 px (Requirement 10.1), and responsive behaviour.
    - _Requirements: 7.1, 7.4, 10.1, 10.3_
  - [x] 2.2 Add interactive-element styles and focus indicators
    - Style all buttons, inputs, checkboxes, and link buttons.
    - Add visible focus indicator: `:focus-visible` outline ≥ 2 px, clearly distinguishable from background (Requirement 10.2).
    - Ensure color contrast ≥ 4.5:1 for text/background pairs in both themes (Requirement 10.3).
    - Style completed task title with `text-decoration: line-through` (Requirement 5.5).
    - Style inline validation error messages.
    - _Requirements: 5.5, 10.2, 10.3_

- [x] 3. Implement Storage module
  - [x] 3.1 Write the `Storage` module in `js/app.js`
    - Declare `Storage.KEYS` with the five namespaced keys: `tld_tasks`, `tld_links`, `tld_presets`, `tld_name`, `tld_theme` (Requirement 8.2).
    - Implement `Storage.read(key)`: parse JSON, catch `SyntaxError` → display warning banner, return `null` (Requirements 8.3, 8.5).
    - Implement `Storage.save(key, value)`: JSON-stringify and write; catch `QuotaExceededError` / `DOMException` → display error banner, return `false` (Requirement 8.4).
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
    

- [x] 4. Implement ThemeManager
  - [x] 4.1 Write the `ThemeManager` module
    - Implement `ThemeManager.init(storedTheme)`: apply the stored or default (`"light"`) theme; update the toggle button icon (sun/moon) to reflect current theme.
    - Implement `ThemeManager._apply(theme)`: set `data-theme` attribute on `<html>` element; update toggle icon.
    - Implement `ThemeManager._toggle()`: flip active theme (light ↔ dark), call `_apply()`, call `Storage.save()`.
    - Wire the theme toggle button's click event to `_toggle()`.
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
 

- [x] 5. Implement GreetingWidget
  - [ ] 5.1 Write `GreetingWidget._getGreeting(hour)` pure function
    - Implement hour-to-greeting mapping as specified:
      - 05–11 → "Good Morning", 12–17 → "Good Afternoon", 18–20 → "Good Evening", 21–23 and 00–04 → "Good Night"
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

    - [x] 5.3 Implement `GreetingWidget.init()` and `_tick()`
    - Implement `_tick()`: format and display time in HH:MM (Requirement 1.1), format and display date as "Weekday, DD Month YYYY" (Requirement 1.2), call `_getGreeting()` and update greeting text, detect day change across midnight and update date display (Requirement 1.7).
    - Implement `init(storedName)`: mount the setInterval tick (1 000 ms), call `_tick()` immediately on load.
    - _Requirements: 1.1, 1.2, 1.7_
  - [ ] 5.4 Implement `GreetingWidget._setName(name)`
    - Validate: reject empty / whitespace-only → remove stored name, display greeting without suffix (Requirements 2.4, 2.5); enforce max 50 chars (Requirement 2.1).
    - On valid name: append `", <name>"` to greeting (Requirement 2.2); call `Storage.save()`; catch failure and display error message (Requirement 2.6).
    - On page load: restore stored name into display and input field (Requirement 2.3).
    - Wire the name input's submit event (Enter key or Save button) to `_setName()`.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
 

- [x] 6. Checkpoint — Greeting and Theme
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement TimerWidget — core countdown
  - [ ] 7.1 Write `TimerWidget._formatTime(totalSeconds)` pure function
    - Return `MM:SS` string with zero-padded minutes and seconds for any integer in [0, 10 800].
    - _Requirements: 3.1, 3.4_
  
  - [x] 7.3 Implement `TimerWidget.init()`, `_startTimer()`, `_stopTimer()`, `_resetTimer()`, and `_tick()`
    - Initialize module state: `presets`, `activePreset`, `remainingSeconds`, `isRunning`, `intervalId`.
    - `_startTimer()`: start setInterval (1 000 ms); disable Start button, enable Stop button (Requirement 3.7).
    - `_stopTimer()`: clear interval; enable Start button, disable Stop button (Requirement 3.8).
    - `_resetTimer()`: call `_stopTimer()`, restore `remainingSeconds` to active preset's full duration (Requirement 3.4).
    - `_tick()`: decrement `remainingSeconds`, update display; when reaching 0 call `_onTimerComplete()` (Requirement 3.5).
    - `_onTimerComplete()`: stop interval, play audible alert via `AudioContext`, show notification text, set correct button states (Requirements 3.5, 3.6).
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 8. Implement TimerWidget — preset management
  - [ ] 8.1 Write `TimerWidget._validatePreset(name, minutes)`
    - Validate name: non-empty, ≤ 50 chars, not duplicate in current preset list.
    - Validate minutes: integer in [1, 180].
    - Return a `ValidationResult` with per-field error messages.
    - _Requirements: 4.1, 4.3, 4.7_
  - [ ] 8.2 Implement `_addPreset(name, minutes)` and `_deletePreset(name)`
    - `_addPreset()`: call `_validatePreset()`; if list length ≥ 20 display "Maximum of 20 presets reached" (Requirement 4.8); on success push to list, re-render preset selector, call `Storage.save()` (Requirement 4.6).
    - `_deletePreset()`: remove from list, re-render selector, call `Storage.save()` (Requirement 4.6).
    - If no presets remain after deletion, initialize default "Pomodoro" preset (Requirement 4.9).
    - _Requirements: 4.2, 4.3, 4.6, 4.7, 4.8, 4.9_
  - [ ] 8.3 Implement `_selectPreset(name)` and page-load initialization
    - If timer is running, stop it before switching preset (Requirement 4.5).
    - Update `activePreset` and `remainingSeconds`; update display (Requirement 4.4).
    - On page load with no stored presets, create and select the default "Pomodoro" preset (Requirement 4.9).
    - Wire preset selector change event and form submit event.
    - _Requirements: 4.4, 4.5, 4.9_
  

- [ ] 9. Checkpoint — Timer
  - Ensure all timer and preset tests pass, ask the user if questions arise.

- [ ] 10. Implement TodoWidget
  - [ ] 10.1 Write `TodoWidget._validateTitle(title)` and `_generateId()`
    - `_validateTitle()`: return false for empty / whitespace-only strings; enforce max 200 chars.
    - `_generateId()`: return a unique string in the format `"task_<timestamp>_<randomSuffix>"`.
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 10.3 Implement `_addTask(title)` and `_deleteTask(id)`
    - `_addTask()`: call `_validateTitle()`; on valid input create task object `{ id, title: title.trim(), completed: false, createdAt: ISO-8601 }`, push to state, call `_render()`, call `Storage.save()` (Requirement 5.11).
    - `_deleteTask()`: remove task by id, call `_render()`, call `Storage.save()` (Requirement 5.10).
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.10, 5.11_
  - [ ] 10.4 Implement `_toggleTask(id)` and `_render()`
    - `_toggleTask()`: flip `completed` field for the matching task, call `_render()`, call `Storage.save()`.
    - `_render()`: generate and replace the task list DOM; each task row includes checkbox, title span (line-through when completed), edit button, and delete button.
    - _Requirements: 5.4, 5.5, 5.11_
 
  - [ ] 10.6 Implement `_beginEdit(id)`, `_confirmEdit(id, newTitle)`, and `_cancelEdit(id)`
    - `_beginEdit()`: set `editingId`, re-render row in edit mode (input pre-filled with current title, Save and Cancel controls), focus the input (Requirement 5.6); trap keyboard focus within the edit row (Requirement 10.5).
    - `_confirmEdit()`: validate new title; on valid input update task title to trimmed value, clear `editingId`, call `_render()`, call `Storage.save()` (Requirement 5.7); on invalid display inline validation error and retain original title (Requirement 5.9).
    - `_cancelEdit()`: clear `editingId`, call `_render()`, restore original title — no changes saved (Requirement 5.8).
    - Wire Enter key to `_confirmEdit()`, Escape key to `_cancelEdit()`.
    - _Requirements: 5.6, 5.7, 5.8, 5.9, 10.5_
  
- [x] 11. Checkpoint — Todo
  - Ensure all todo tests pass, ask the user if questions arise.

- [ ] 12. Implement LinksWidget
  - [ ] 12.1 Write `LinksWidget._validateLink(label, url)`
    - Validate label: non-empty, ≤ 50 chars.
    - Validate URL: non-empty, begins with `http://` or `https://`, ≤ 2 048 chars.
    - Return per-field `ValidationResult`.
    - _Requirements: 6.1, 6.3_
  
  - [ ] 12.3 Implement `_addLink(label, url)` and `_deleteLink(id)`
    - `_addLink()`: call `_validateLink()`; if list length ≥ 20 display "Maximum of 20 links reached" (Requirement 6.4); on success generate id, push to state, call `_render()`, call `Storage.save()` (Requirement 6.7).
    - `_deleteLink()`: remove by id, call `_render()`, call `Storage.save()` (Requirement 6.7).
    - _Requirements: 6.2, 6.4, 6.6, 6.7_
  - [ ] 12.4 Implement `_render()` for LinksWidget
    - Render each link as a button that opens the URL in a new tab on click (Requirement 6.5).
    - Add a delete control on each link button (Requirement 6.6).
    - _Requirements: 6.5, 6.6_
 

- [x] 13. Implement page-load initialization and wire all modules
  - [x] 13.1 Write the `DOMContentLoaded` bootstrap block
    - Call `Storage.read()` for all five keys; initialize defaults where data is missing or corrupted (Requirement 8.3).
    - Call `ThemeManager.init()`, `GreetingWidget.init()`, `TimerWidget.init()`, `TodoWidget.init()`, `LinksWidget.init()` in order, passing restored data (Requirement 8.1).
    - Ensure all widgets are fully interactive before the browser's first paint where possible.
    - _Requirements: 8.1, 8.3, 9.1_
 

- [ ] 14. Accessibility polish
  - [ ] 14.1 Audit and fix keyboard navigation and focus management
    - Verify logical tab order (top-to-bottom, left-to-right) across all four widgets and the theme toggle (Requirement 10.4).
    - Ensure focus trap inside task inline-edit row (Requirement 10.5); test with keyboard-only navigation.
    - Associate all validation error messages with their corresponding inputs via `aria-describedby` (design Error Handling section).
    - _Requirements: 10.4, 10.5_
  - [ ] 14.2 Verify semantic HTML landmarks and ARIA attributes
    - Confirm `<header>`, `<main>`, and per-widget `<section>` elements are present with descriptive `aria-label` values (Requirement 10.6).
    - Add `aria-live="polite"` regions for timer notifications, error banners, and storage warning banners so assistive technologies announce them.
    - _Requirements: 3.5, 8.4, 8.5, 10.6_

- [ ] 15. Final checkpoint — full suite
  - Ensure all property-based tests and unit tests pass; confirm no JavaScript console errors; ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Property-based tests use [fast-check](https://github.com/dubzzz/fast-check) and run in Node (no browser required).
- Each property task references the property number and the specific requirements it validates.
- Unit tests cover pure functions and the Storage module's error paths.
- Checkpoints after each major widget ensure incremental validation before moving on.
- The entire app is exactly three files: `index.html`, `css/style.css`, `js/app.js` — no build toolchain.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "3.1"] },
    { "id": 1, "tasks": ["2.2", "3.2", "3.3", "4.1"] },
    { "id": 2, "tasks": ["4.2", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3"] },
    { "id": 4, "tasks": ["5.4", "7.1"] },
    { "id": 5, "tasks": ["5.5", "7.2", "7.3"] },
    { "id": 6, "tasks": ["7.4", "8.1"] },
    { "id": 7, "tasks": ["8.2", "8.3"] },
    { "id": 8, "tasks": ["8.4", "10.1"] },
    { "id": 9, "tasks": ["10.2", "10.3"] },
    { "id": 10, "tasks": ["10.4"] },
    { "id": 11, "tasks": ["10.5", "10.6"] },
    { "id": 12, "tasks": ["10.7", "12.1"] },
    { "id": 13, "tasks": ["12.2", "12.3"] },
    { "id": 14, "tasks": ["12.4"] },
    { "id": 15, "tasks": ["12.5", "13.1"] },
    { "id": 16, "tasks": ["13.2", "14.1"] },
    { "id": 17, "tasks": ["14.2"] }
  ]
}
```
