# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Root-level commands (monorepo)

- `npm install` - Install all dependencies across workspaces
- `npm run lint` - Run linting across all workspaces
- `npm run lint:fix` - Run linting with auto-fix across all workspaces
- `npm run test` - Run tests across all workspaces
- `npm run build` - Build all packages
- `npm run clean` - Clean all workspaces

### Mobile app development

- `npm run mobile:start` - Start Metro bundler for React Native
- `npm run mobile:android` - Run Android app
- `npm run mobile:ios` - Run iOS app (macOS only)
- `npm run mobile:test` - Run mobile app tests
- `npm run mobile:lint` - Lint mobile app code

### Running tests for specific packages

- `npm run test --workspace=apps/mobile` - Test mobile app only
- `npm run test --workspace=packages/shared` - Test shared package only
- `npm run test --workspace=packages/database` - Test database package only

### Dependency Management

- `npm run deps:check` - Check for dependency updates across all workspaces
- `npm run deps:update` - Update all dependencies and install
- `npm run deps:check-external` - Check only external dependencies (excludes @expense-tracker/*)
- `npm run deps:update-external` - Update only external dependencies
- `npm run deps:interactive` - Interactive mode for selective dependency updates

## Architecture Overview

This is a **monorepo** using npm workspaces with the following structure:

### Workspace Organization

- `apps/mobile/` - React Native mobile application (main app)
- `apps/desktop/` - Desktop app placeholder (future development)
- `packages/shared/` - Shared types, utilities, and constants
- `packages/database/` - SQLite database layer with DatabaseManager
- `packages/ui/` - Shared UI components (future)

### Key Architectural Patterns

**State Management**: Zustand store in `apps/mobile/src/store/useExpenseStore.ts`

- Single store with subscribeWithSelector middleware
- Handles all expense, category, currency, and user preference operations
- Includes loading states and error handling
- Database operations are async and update store state

**Database Layer**: Centralized in `packages/database/src/DatabaseManager.ts`

- Singleton pattern for database access
- SQLite with react-native-sqlite-storage
- All database operations return Promises
- Schema defined in `packages/database/src/schema.ts`

**Data Flow**: UI Components → Zustand Store → DatabaseManager → SQLite

- Components call store actions
- Store actions call DatabaseManager methods
- DatabaseManager handles all SQL operations
- Store state updates trigger UI re-renders

**Type System**: Shared types in `packages/shared/src/types.ts`

- Workspace references: `@expense-tracker/shared`, `@expense-tracker/database`
- All interfaces are TypeScript with strict typing enabled

### Navigation Structure

- React Navigation v7 with native stack navigator
- Main screens: Home, Add Expense, Expense List, Reports
- Navigation config in `apps/mobile/src/navigation/AppNavigator.tsx`

### Key Dependencies

- React Native 0.75.5 with TypeScript 5.6.0
- Zustand 5.0.1 for state management
- react-native-sqlite-storage 6.0.1 for data persistence
- React Native Elements 3.4.3 for UI components
- date-fns 4.1.0 for date handling

## Development Workflow

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- React Native development environment (Android Studio/Xcode)

### iOS Setup (macOS only)

After installing dependencies, run: `cd apps/mobile/ios && pod install && cd ../../../`

### Adding New Features

1. **Shared logic**: Add to `packages/shared/src/`
2. **Database operations**: Add to `packages/database/src/DatabaseManager.ts`
3. **UI components**: Add to `apps/mobile/src/components/`
4. **New screens**: Add to `apps/mobile/src/screens/`
5. **Store actions**: Update `apps/mobile/src/store/useExpenseStore.ts`

### Code Conventions

- All code must be TypeScript typed
- Use PascalCase for components, camelCase for functions
- Follow ESLint v9 flat config rules with TypeScript support
- Code formatted with Prettier 3.6.2
- Database operations must be async and handle errors

### Code Quality Tools

- **ESLint v9**: Flat config format with TypeScript rules
- **Prettier**: Code formatting (integrated with ESLint)
- **TypeScript**: Strict type checking enabled
- Run `npm run lint` to check code quality
- Run `npm run lint:fix` to auto-fix linting issues

### Testing Strategy

- Jest 30.0.4 for unit testing
- Tests should cover store actions and database operations
- Run `npm run mobile:test -- --watch` for development

### Build System

- TypeScript compilation with project references for dependency order
- `packages/shared` must build before `packages/database` (due to imports)
- Uses `tsc -b` (build mode) to handle project references automatically
- All packages compile to `dist/` directories with both `.js` and `.d.ts` files

## Package Dependencies

### Workspace References

When importing between packages, use workspace syntax:

- `@expense-tracker/shared` - Types, utilities, constants
- `@expense-tracker/database` - DatabaseManager and schema

### Key Imports

- Types: `import { Expense, ExpenseCategory } from '@expense-tracker/shared'`
- Database: `import { DatabaseManager } from '@expense-tracker/database'`
- Store: `import { useExpenseStore } from '../store/useExpenseStore'`

## Dependency Management Workflow

### Using npm-check-updates (ncu) with Workspaces

This monorepo uses npm-check-updates to manage dependency updates across all workspaces. The commands are orchestrated from the root:

**Recommended workflow:**
1. `npm run deps:check` - See what dependencies can be updated
2. `npm run deps:update` - Update all and install (or use `deps:update-external` for external only)

**Internal vs External Dependencies:**
- **Internal**: `@expense-tracker/shared`, `@expense-tracker/database` (use `*` versions, don't update)
- **External**: All other npm packages (React Native, TypeScript, etc.)

**Command Details:**
- `deps:check` - Shows updates for all workspaces + root
- `deps:update` - Updates all package.json files, cleans workspace node_modules, then runs `npm install`
- `deps:check-external` - Excludes internal `@expense-tracker/*` packages
- `deps:update-external` - Updates only external dependencies, cleans workspace node_modules, then runs `npm install`
- `deps:interactive` - Choose which dependencies to update

**Alternative: Direct ncu commands**
```bash
ncu --workspaces --root                    # Check all
ncu --workspaces --root -u && npm install # Update all
ncu --workspace apps/mobile                # Check specific workspace
```

## Important Notes

- This is an **offline-first** application using SQLite for local storage
- All database operations go through the DatabaseManager singleton
- State management is centralized in a single Zustand store
- The mobile app is the primary platform; desktop is planned for future
- Use workspace commands from the root for monorepo operations
- Internal workspace dependencies should remain at `*` versions
