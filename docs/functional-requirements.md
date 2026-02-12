# Functional Requirements

## Overview

This document outlines the core functional requirements for the TODO application.

## Core Features

### 1. Task Management

#### 1.1 Create Task
- User can add a new task with a title
- User can add an optional description to a task
- User can set a due date for a task
- User can assign a priority level (Low, Medium, High)

#### 1.2 Edit Task
- User can edit the title of an existing task
- User can modify the description
- User can update the due date
- User can change the priority level

#### 1.3 Delete Task
- User can delete a task
- User receives confirmation before deletion

#### 1.4 Complete Task
- User can mark a task as complete
- User can mark a completed task as incomplete
- Completed tasks are visually distinguished from incomplete tasks

### 2. Task Organization

#### 2.1 Sorting
- Tasks can be sorted by due date (earliest first)
- Tasks can be sorted by priority (highest first)
- Tasks can be sorted by creation date
- Tasks can be sorted alphabetically by title

#### 2.2 Filtering
- User can filter tasks by completion status (all, active, completed)
- User can filter tasks by priority level

### 3. Data Persistence

- All tasks are persisted via the backend API
- Tasks remain available after page refresh

### 4. User Interface

- Display total count of tasks
- Display count of completed vs incomplete tasks
- Show empty state when no tasks exist
- Responsive design for mobile and desktop
