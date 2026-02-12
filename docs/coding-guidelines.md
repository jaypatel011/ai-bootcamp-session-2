# Coding Guidelines

## Overview

This document outlines the coding standards and best practices for the TODO application. Following these guidelines ensures consistency, maintainability, and high-quality code across the project.

## General Principles

### DRY (Don't Repeat Yourself)
Avoid code duplication. Extract common logic into reusable functions, components, or utilities. If you find yourself copying and pasting code, consider refactoring it into a shared module.

### KISS (Keep It Simple, Stupid)
Write simple, straightforward code. Avoid over-engineering solutions. Choose clarity over cleverness—code is read far more often than it is written.

### Single Responsibility
Each function, component, or module should have one clear purpose. If a function does too many things, break it into smaller, focused functions.

## Code Formatting

### General Rules
- Use 2 spaces for indentation (no tabs)
- Maximum line length: 100 characters
- Use single quotes for strings in JavaScript
- Always use semicolons
- Add a trailing newline at the end of files

### JavaScript/React Formatting
```javascript
// Good
const greeting = 'Hello, World!';

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad
const greeting = "Hello, World!"
function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0) }
```

## Import Organization

Organize imports in the following order, with a blank line between each group:

1. **External dependencies** (React, third-party libraries)
2. **Internal modules** (components, hooks, utilities)
3. **Styles and assets**

```javascript
// External dependencies
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Internal modules
import TaskList from './components/TaskList';
import { formatDate } from './utils/dateHelpers';

// Styles
import './App.css';
```

## Naming Conventions

### Variables and Functions
- Use camelCase for variables and functions: `taskCount`, `handleSubmit`
- Use descriptive names that convey purpose: `isLoading`, `fetchTasks`
- Boolean variables should use prefixes: `is`, `has`, `should`, `can`

### Components
- Use PascalCase for React components: `TaskList`, `AddTaskForm`
- Component files should match the component name: `TaskList.js`

### Constants
- Use UPPER_SNAKE_CASE for constants: `MAX_TASKS`, `API_BASE_URL`

### Files and Folders
- Use kebab-case for folders: `task-utils/`
- Use PascalCase for component files: `TaskItem.js`
- Use camelCase for utility files: `dateHelpers.js`

## Code Quality

### Linting
Use ESLint to enforce code quality and catch errors early. The project includes ESLint configuration—run it before committing:

```bash
npm run lint
```

Fix all linting errors and warnings before pushing code.

### Comments
- Write self-documenting code; use comments sparingly
- Use comments to explain "why," not "what"
- Use JSDoc for function documentation when needed

```javascript
// Good: Explains why
// Debounce to prevent API spam during rapid typing
const debouncedSearch = debounce(searchTasks, 300);

// Bad: Explains what (obvious from code)
// Set count to 0
setCount(0);
```

### Error Handling
- Always handle errors gracefully
- Provide meaningful error messages
- Use try/catch for async operations

```javascript
try {
  const tasks = await fetchTasks();
  setTasks(tasks);
} catch (error) {
  console.error('Failed to fetch tasks:', error);
  setError('Unable to load tasks. Please try again.');
}
```

## Best Practices

### Functions
- Keep functions small and focused (< 20 lines ideally)
- Use arrow functions for callbacks
- Use default parameters instead of conditional checks

### React Components
- Prefer functional components with hooks
- Keep components small and focused
- Extract logic into custom hooks when reusable
- Use destructuring for props

```javascript
// Good
function TaskItem({ title, dueDate, onComplete }) {
  return (
    <div>
      <span>{title}</span>
      <span>{formatDate(dueDate)}</span>
      <button onClick={onComplete}>Complete</button>
    </div>
  );
}
```

### State Management
- Keep state as close to where it's used as possible
- Lift state only when necessary
- Use meaningful state variable names

### API Calls
- Centralize API logic in service files
- Handle loading and error states
- Use async/await over raw promises

## Version Control

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Keep the first line under 50 characters
- Be descriptive but concise

```
Add task filtering by priority level

- Implement filter dropdown component
- Add filter logic to task list
- Update API to support filter query params
```

### Branches
- Use descriptive branch names: `feature/add-due-dates`, `fix/task-deletion-bug`
- Keep branches focused on a single feature or fix
