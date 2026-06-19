# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side web application built with HTML, CSS, and Vanilla JavaScript. It provides a single-page personal productivity dashboard that combines a live greeting, a Pomodoro focus timer, a task manager, and a quick links panel — all persisted locally in the browser's Local Storage with no backend required. The app supports light/dark themes, a customizable user name, and configurable timer presets.

---

## Glossary

- **Dashboard**: The single-page web application that hosts all widgets.
- **Greeting_Widget**: The UI component that displays the current time, date, and a personalized greeting.
- **Timer_Widget**: The UI component that runs Pomodoro-style countdown sessions.
- **Todo_Widget**: The UI component that manages the user's task list.
- **Links_Widget**: The UI component that stores and renders quick-access link buttons.
- **Storage**: The browser's `localStorage` API used as the sole persistence layer.
- **Task**: A single to-do item with a title, completion status, and creation timestamp.
- **Preset**: A named timer configuration containing a duration in minutes.
- **Theme**: The visual color scheme of the Dashboard — either `light` or `dark`.
- **User**: The person using the Dashboard in their browser.

---

## Requirements

### Requirement 1: Live Greeting

**User Story:** As a User, I want to see the current time, date, and a greeting that reflects the time of day, so that I feel oriented and welcomed when I open the Dashboard.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current local time in 24-hour HH:MM format (e.g., "09:05", "14:30"), updated every second.
2. THE Greeting_Widget SHALL display the current local date in the format "Weekday, DD Month YYYY" (e.g., "Monday, 15 June 2026").
3. WHEN the local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the local hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the local hour is between 18:00 and 20:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the local hour is between 21:00 and 04:59 (inclusive), THE Greeting_Widget SHALL display the greeting "Good Night".
7. WHEN the local clock crosses midnight (00:00), THE Greeting_Widget SHALL update the displayed date to the new calendar day without requiring a page reload.

---

### Requirement 2: Custom Name in Greeting

**User Story:** As a User, I want to set my name so that the greeting addresses me personally.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display a text input field that allows the User to enter a custom name of up to 50 characters.
2. WHEN the User submits a non-empty, non-whitespace-only name, THE Greeting_Widget SHALL append the name to the greeting text using a comma and space as separator (e.g., "Good Morning, Alex").
3. WHEN the User saves a name, THE Storage SHALL persist the name so that it is restored on the next page load.
4. WHEN no name has been saved, THE Greeting_Widget SHALL display the greeting without a name suffix.
5. IF the User submits an empty string or a whitespace-only string as the name, THEN THE Greeting_Widget SHALL remove the stored name and display the greeting without a name suffix.
6. IF a Storage write operation fails when saving the name, THEN THE Greeting_Widget SHALL display a user-visible error message indicating that the name could not be saved.

---

### Requirement 3: Focus Timer (Pomodoro)

**User Story:** As a User, I want a countdown timer I can start, stop, and reset, so that I can structure my work into focused sessions.

#### Acceptance Criteria

1. THE Timer_Widget SHALL display a countdown in MM:SS format; on initial load it SHALL display 25:00.
2. WHEN the User clicks the Start button, THE Timer_Widget SHALL begin counting down from the current displayed time at one-second intervals.
3. WHEN the User clicks the Stop button while the timer is running, THE Timer_Widget SHALL pause the countdown and retain the remaining time.
4. WHEN the User clicks the Reset button, THE Timer_Widget SHALL stop any active countdown and restore the display to the currently selected preset's full duration in MM:SS format.
5. WHEN the countdown reaches 00:00, THE Timer_Widget SHALL stop automatically, play an audible alert, AND display a visible notification in the timer display area.
6. WHEN the countdown reaches 00:00 and stops automatically, THE Timer_Widget SHALL enable the Start button and disable the Stop button.
7. WHILE the timer is running, THE Timer_Widget SHALL disable the Start button and enable the Stop button.
8. WHILE the timer is stopped or paused, THE Timer_Widget SHALL enable the Start button and disable the Stop button.

---

### Requirement 4: Custom Timer Presets

**User Story:** As a User, I want to create, name, and save timer presets with custom durations, so that I can switch between different focus session lengths without reconfiguring each time.

#### Acceptance Criteria

1. THE Timer_Widget SHALL display a form that accepts a preset name (non-empty string, maximum 50 characters) and a duration in whole minutes between 1 and 180 (inclusive).
2. WHEN the User submits a valid preset name and duration, THE Timer_Widget SHALL save the preset and make it selectable from a preset list, provided the preset list contains fewer than 20 presets and the name is not a duplicate of an existing preset name.
3. IF the User submits a preset name that duplicates an existing preset name, THEN THE Timer_Widget SHALL display a validation error stating "A preset with this name already exists" and SHALL NOT save the preset.
4. WHEN the User selects a preset from the list and the timer is not running, THE Timer_Widget SHALL update the countdown display to that preset's full duration in MM:SS format.
5. WHEN the User selects a preset from the list and the timer is currently running, THE Timer_Widget SHALL stop the timer and then update the countdown display to that preset's full duration in MM:SS format.
6. WHEN a preset is saved or deleted, THE Storage SHALL persist the updated preset list so that it is restored on the next page load.
7. IF the User submits a preset with an empty name, a name exceeding 50 characters, or a duration outside 1–180, THEN THE Timer_Widget SHALL display a per-field validation error message and SHALL NOT save the preset.
8. IF the preset list already contains 20 presets, THEN THE Timer_Widget SHALL display a validation error stating "Maximum of 20 presets reached" and SHALL NOT save the new preset.
9. WHEN no presets exist in Storage on page load, THE Timer_Widget SHALL initialize a default preset named "Pomodoro" with a duration of 25 minutes and select it as the active preset.

---

### Requirement 5: To-Do List

**User Story:** As a User, I want to add, edit, complete, and delete tasks, so that I can track what I need to accomplish throughout the day.

#### Acceptance Criteria

1. THE Todo_Widget SHALL display a text input (maximum 200 characters) and an Add button for creating new tasks.
2. WHEN the User submits a non-empty, non-whitespace-only task title, THE Todo_Widget SHALL add a new Task with a unique identifier, the trimmed title, a completion status of `false`, and a creation timestamp.
3. IF the User submits an empty string or whitespace-only string as a task title, THEN THE Todo_Widget SHALL display a validation error and SHALL NOT add the Task.
4. THE Todo_Widget SHALL render each Task with its title, a checkbox to toggle completion, an edit button, and a delete button.
5. WHEN the User toggles the checkbox of a Task, THE Todo_Widget SHALL update that Task's completion status and visually distinguish completed tasks with `text-decoration: line-through` applied to the task title.
6. WHEN the User clicks the edit button of a Task, THE Todo_Widget SHALL replace the task title with an editable text input pre-filled with the current title and focus the input.
7. WHEN the User confirms an edit by pressing Enter or clicking a Save button, and the input contains a non-empty, non-whitespace-only title, THE Todo_Widget SHALL update the Task's title to the trimmed value and exit edit mode.
8. WHEN the User cancels an edit by pressing Escape or clicking a Cancel button, THE Todo_Widget SHALL exit edit mode and restore the original title without modifications.
9. IF the User confirms an edit with an empty or whitespace-only title, THEN THE Todo_Widget SHALL display a validation error and retain the original title.
10. WHEN the User clicks the delete button of a Task, THE Todo_Widget SHALL remove the Task from the list.
11. WHEN any Task is added, updated, or deleted, THE Storage SHALL persist the full task list so that it is restored on the next page load.

---

### Requirement 6: Quick Links

**User Story:** As a User, I want to save and access my favorite website links as buttons, so that I can navigate to them quickly from the Dashboard.

#### Acceptance Criteria

1. THE Links_Widget SHALL display a form that accepts a link label (non-empty string, maximum 50 characters) and a URL (non-empty string beginning with `http://` or `https://`, maximum 2048 characters).
2. WHEN the User submits a valid label and URL, and the link list contains fewer than 20 links, THE Links_Widget SHALL add a new link button to the panel.
3. IF the User submits an empty or whitespace-only label, a URL that does not begin with `http://` or `https://`, a label exceeding 50 characters, or a URL exceeding 2048 characters, THEN THE Links_Widget SHALL display a per-field validation error and SHALL NOT add the link.
4. IF the link list already contains 20 links, THEN THE Links_Widget SHALL display a validation error stating "Maximum of 20 links reached" and SHALL NOT add the new link.
5. WHEN the User clicks a link button, THE Links_Widget SHALL open the corresponding URL in a new browser tab.
6. THE Links_Widget SHALL provide a delete control on each link button that, when activated, removes that link from the panel.
7. WHEN any link is added or deleted, THE Storage SHALL persist the updated link list so that it is restored on the next page load.

---

### Requirement 7: Light / Dark Theme Toggle

**User Story:** As a User, I want to switch between a light and dark color scheme, so that the Dashboard is comfortable to use in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL apply the light theme (white or near-white background with dark text) by default on first load when no theme preference is stored.
2. THE Dashboard SHALL display a toggle control that indicates the currently active theme (e.g., a sun icon for light, a moon icon for dark) and switches between the two themes when activated.
3. WHEN the User activates the theme toggle, THE Dashboard SHALL switch the active theme to the opposite value (light → dark or dark → light).
4. WHEN the theme changes, THE Dashboard SHALL apply the new color scheme to all visible elements without a full page reload.
5. WHEN the User changes the theme, THE Storage SHALL persist the selected theme value so that it is restored on the next page load.
6. WHEN the persisted theme is restored on page load, THE toggle control SHALL visually reflect the restored theme.

---

### Requirement 8: Local Storage Persistence

**User Story:** As a User, I want my tasks, links, timer presets, name, and theme preference to survive page reloads, so that I do not lose my data when I close or refresh the browser tab.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Storage SHALL read and restore all persisted data (tasks, links, timer presets, user name, and theme) before rendering any widget.
2. THE Storage SHALL store each data category under a distinct, namespaced key, with no two categories sharing the same key.
3. IF a Storage read operation returns no data for a key, THEN THE Dashboard SHALL initialize that category with its default value: tasks as an empty array, links as an empty array, presets as a single entry named "Pomodoro" with a duration of 25 minutes, name as an empty string, and theme as "light".
4. IF a Storage write operation fails (e.g., quota exceeded), THEN THE Dashboard SHALL display a user-visible error message indicating that data could not be saved.
5. IF a Storage read operation returns data that cannot be parsed as valid JSON, THEN THE Dashboard SHALL discard the corrupted data, initialize that category with its default value, and display a user-visible warning indicating that corrupted data was reset.

---

### Requirement 9: Performance and Compatibility

**User Story:** As a User, I want the Dashboard to load and respond quickly on modern browsers without any installation or setup, so that it is immediately usable.

#### Acceptance Criteria

1. WHEN the Dashboard is loaded from a local file system or static server over a connection of at least 25 Mbps, THE Dashboard SHALL become fully interactive (all UI elements visible and responding to user input) within 3 seconds.
2. THE Dashboard SHALL display without layout breaks, overflow, or missing elements, and all features defined in this requirements document SHALL operate without JavaScript errors, on the latest stable releases of Chrome, Firefox, Edge, and Safari.
3. THE Dashboard SHALL consist of exactly one HTML file, one CSS file located in `css/`, and one JavaScript file located in `js/`, with no build step or server required.
4. WHEN any user interaction triggers a UI update (e.g., adding a task, toggling theme), THE Dashboard SHALL reflect the change visually in the viewport within 100 milliseconds.

---

### Requirement 10: Accessible and Readable UI

**User Story:** As a User, I want clear visual hierarchy, readable typography, and keyboard-accessible controls, so that the Dashboard is easy to use without strain.

#### Acceptance Criteria

1. THE Dashboard SHALL use a base font size of at least 14px for all body text.
2. THE Dashboard SHALL provide a visible focus indicator — an outline or border of at least 2px that is clearly distinguishable from the surrounding background — on all interactive elements (buttons, inputs, checkboxes, links).
3. THE Dashboard SHALL maintain a color contrast ratio of at least 4.5:1 between text and its background in both the light and dark themes.
4. WHEN the User interacts with the Dashboard using only the keyboard, THE Dashboard SHALL allow full access to all controls in a logical tab order that follows the visual reading order (top-to-bottom, left-to-right).
5. WHEN an inline edit field opens for a Task, THE Dashboard SHALL trap keyboard focus within that edit field and its associated Save and Cancel controls until the edit is confirmed or cancelled.
6. THE Dashboard SHALL use semantic landmark regions (`<header>`, `<main>`, and `<section>` or `<aside>` per widget) so that keyboard and assistive-technology users can navigate between widgets efficiently.
