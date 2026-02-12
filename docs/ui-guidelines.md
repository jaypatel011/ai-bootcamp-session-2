# UI Guidelines

## Overview

This document defines the user interface guidelines for the TODO application to ensure a consistent, accessible, and user-friendly experience.

## Design System

### Component Library
- Use **Material UI (MUI)** components for all UI elements
- Maintain consistency with Material Design principles

### Color Palette

#### Primary Colors
- Primary: `#1976d2` (Blue)
- Primary Light: `#42a5f5`
- Primary Dark: `#1565c0`

#### Secondary Colors
- Secondary: `#9c27b0` (Purple)
- Secondary Light: `#ba68c8`
- Secondary Dark: `#7b1fa2`

#### Status Colors
- Success: `#2e7d32` (Green) - Completed tasks
- Warning: `#ed6c02` (Orange) - Medium priority
- Error: `#d32f2f` (Red) - High priority
- Info: `#0288d1` (Blue) - Low priority

#### Neutral Colors
- Background: `#fafafa`
- Surface: `#ffffff`
- Text Primary: `#212121`
- Text Secondary: `#757575`

## Typography

- Font Family: Roboto, sans-serif
- Headings: Use MUI Typography variants (h1-h6)
- Body Text: 16px base size
- Task Titles: Medium weight (500)
- Descriptions: Regular weight (400)

## Buttons

### Primary Actions
- Use contained buttons with primary color
- Examples: "Add Task", "Save"

### Secondary Actions
- Use outlined buttons
- Examples: "Cancel", "Clear Filters"

### Destructive Actions
- Use outlined buttons with error color
- Require confirmation dialog for delete operations

## Form Elements

- Use MUI TextField components with outlined variant
- Include clear labels and placeholder text
- Show validation errors inline below the field
- Use DatePicker component for due dates

## Layout

### Spacing
- Use 8px grid system (MUI default)
- Container max-width: 800px
- Card padding: 16px

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - xs: 0px
  - sm: 600px
  - md: 900px
  - lg: 1200px

## Accessibility

### Requirements
- All interactive elements must be keyboard accessible
- Maintain minimum contrast ratio of 4.5:1 for text
- Include ARIA labels for icon-only buttons
- Support screen readers
- Focus indicators must be visible

### Best Practices
- Use semantic HTML elements
- Provide alt text for images
- Ensure form inputs have associated labels

## Icons

- Use Material Icons library
- Common icons:
  - Add: `add` or `add_circle`
  - Delete: `delete`
  - Edit: `edit`
  - Complete: `check_circle`
  - Priority: `flag`
  - Due Date: `event`

## Task Display

### Task Card
- White background with subtle shadow
- Left border color indicates priority
- Checkbox for completion status
- Title prominently displayed
- Due date shown with calendar icon
- Edit and delete actions on hover/focus

### Completed Tasks
- Strikethrough text on title
- Reduced opacity (0.7)
- Green checkmark indicator
