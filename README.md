# Expense Tracker

A modern, cross-platform expense tracking application built with React Native and a monorepo architecture.

[![CI/CD Pipeline](https://github.com/manastalukdar/expense-tracker/actions/workflows/main.yml/badge.svg)](https://github.com/manastalukdar/expense-tracker/actions/workflows/main.yml)
[![Code Quality](https://github.com/manastalukdar/expense-tracker/actions/workflows/linter.yml/badge.svg)](https://github.com/manastalukdar/expense-tracker/actions/workflows/linter.yml)
[![React Native](https://github.com/manastalukdar/expense-tracker/actions/workflows/react-native.yml/badge.svg)](https://github.com/manastalukdar/expense-tracker/actions/workflows/react-native.yml)
[![Security](https://github.com/manastalukdar/expense-tracker/actions/workflows/security.yml/badge.svg)](https://github.com/manastalukdar/expense-tracker/actions/workflows/security.yml)
[![OSSAR](https://github.com/manastalukdar/expense-tracker/actions/workflows/ossar.yml/badge.svg)](https://github.com/manastalukdar/expense-tracker/actions/workflows/ossar.yml)

[![React Native](https://img.shields.io/badge/React%20Native-0.75.5-blue)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.0-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Monorepo](https://img.shields.io/badge/Monorepo-Workspaces-green)](https://docs.npmjs.com/cli/v7/using-npm/workspaces)

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Technology Stack](#technology-stack)
6. [Getting Started](#getting-started)
7. [Development](#development)
8. [Project Management](#project-management)
9. [Contributing](#contributing)
10. [License](#license)

## Overview

Expense Tracker is a comprehensive personal finance management application designed to help users track their spending, categorize expenses, and gain insights into their financial habits. Built with modern React Native architecture, it provides a seamless experience across iOS and Android platforms.

### Key Highlights

- 🏗️ **Monorepo Architecture**: Organized codebase with shared packages
- 📱 **Cross-Platform**: Single codebase for iOS and Android
- 💾 **Local Storage**: SQLite database for offline-first functionality
- 🎨 **Modern UI**: Clean, intuitive interface with React Native Elements
- 📊 **Analytics**: Visual reports and spending insights
- 🔄 **State Management**: Efficient Zustand-based state management
- 🌍 **Multi-Currency**: Support for multiple currencies
- 🏷️ **Tagging System**: Organize expenses with custom tags

## Features

### Core Functionality

- ✅ Add, edit, and delete expenses
- ✅ Categorize expenses with custom categories
- ✅ Multi-currency support
- ✅ Tag-based organization
- ✅ Search and filter expenses
- ✅ Offline-first data storage

### Analytics & Reporting

- ✅ Visual charts (Pie charts, Line graphs)
- ✅ Category-wise spending breakdown
- ✅ Monthly/period summaries
- ✅ Spending trends analysis

### User Experience

- ✅ Intuitive navigation
- ✅ Pull-to-refresh functionality
- ✅ Empty state handling
- ✅ Loading states and error handling
- ✅ Theme support (Light/Dark)

### Planned Features

- 🔄 Budget management and tracking
- 🔄 Receipt scanning and OCR
- 🔄 Data export (CSV, PDF)
- 🔄 Cloud sync and backup
- 🔄 Desktop application (Electron/Tauri)
- 🔄 Web application companion

## Architecture

The application follows a modern monorepo architecture with clear separation of concerns:

### Design Principles

- **Modular Architecture**: Shared packages for reusable code
- **Domain-Driven Design**: Business logic separated from UI concerns
- **Offline-First**: Local SQLite database with future sync capabilities
- **Component-Based UI**: Reusable UI components with consistent theming
- **Type Safety**: Full TypeScript coverage for better developer experience

### Data Flow

```plaintext
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Components │ ──→│  Zustand Store   │ ──→│ Database Layer  │
│                 │    │                  │    │                 │
│  React Native   │ ←──│  State Management│ ←──│    SQLite       │
│   Elements      │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Directory Structure

```plaintext
expense-tracker/
├── apps/                              # Application packages
│   ├── mobile/                        # React Native mobile app
│   │   ├── src/
│   │   │   ├── components/            # Reusable UI components
│   │   │   ├── navigation/            # Navigation configuration
│   │   │   ├── screens/               # Screen components
│   │   │   ├── store/                 # Zustand state management
│   │   │   ├── theme/                 # UI theme configuration
│   │   │   └── types/                 # Type definitions
│   │   ├── android/                   # Android-specific files
│   │   ├── ios/                       # iOS-specific files
│   │   └── package.json
│   │
│   └── desktop/                       # Desktop app (planned)
│       └── .gitkeep                   # Placeholder for future development
│
├── packages/                          # Shared packages
│   ├── shared/                        # Shared utilities and types
│   │   └── src/
│   │       ├── types.ts               # TypeScript interfaces
│   │       ├── utils.ts               # Utility functions
│   │       ├── constants.ts           # App constants
│   │       └── index.ts               # Package exports
│   │
│   ├── database/                      # Database layer
│   │   └── src/
│   │       ├── DatabaseManager.ts    # SQLite operations
│   │       ├── schema.ts              # Database schema
│   │       └── index.ts               # Package exports
│   │
│   └── ui/                           # Shared UI components (future)
│       └── src/
│           └── components/            # Cross-platform components
│
├── documentation/                     # Project documentation
│   ├── development/                   # Development guides
│   ├── product/                       # Product documentation
│   └── project/                       # Project metadata
│
├── tools/                            # Build tools and scripts (future)
├── package.json                      # Root workspace configuration
├── README.md                         # This file
└── LICENSE                           # MIT License
```

## Technology Stack

### Core Technologies

| Technology                                    | Version | Purpose                         |
| --------------------------------------------- | ------- | ------------------------------- |
| [React Native](https://reactnative.dev/)      | 0.75.5  | Cross-platform mobile framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.6.0   | Type-safe JavaScript            |
| [React](https://reactjs.org/)                 | 18.3.1  | UI library                      |

### State Management & Data

| Technology                                                                           | Version | Purpose                      |
| ------------------------------------------------------------------------------------ | ------- | ---------------------------- |
| [Zustand](https://github.com/pmndrs/zustand)                                         | 5.0.1   | Lightweight state management |
| [SQLite](https://www.sqlite.org/)                                                    | -       | Local database storage       |
| [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage) | 6.0.1   | SQLite React Native bindings |

### UI & Navigation

| Technology                                                                        | Version | Purpose              |
| --------------------------------------------------------------------------------- | ------- | -------------------- |
| [React Native Elements](https://reactnativeelements.com/)                         | 3.4.3   | UI component library |
| [React Navigation](https://reactnavigation.org/)                                  | 7.x     | Navigation library   |
| [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons) | 10.2.0  | Icon library         |
| [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)   | 6.12.0  | Data visualization   |

### Development Tools

| Technology                         | Version | Purpose            |
| ---------------------------------- | ------- | ------------------ |
| [ESLint](https://eslint.org/)      | 9.15.0  | Code linting       |
| [Prettier](https://prettier.io/)   | 3.3.0   | Code formatting    |
| [Jest](https://jestjs.io/)         | 29.7.0  | Testing framework  |
| [Metro](https://metrobundler.dev/) | -       | JavaScript bundler |

### Utilities

| Technology                                                                                | Version | Purpose           |
| ----------------------------------------------------------------------------------------- | ------- | ----------------- |
| [date-fns](https://date-fns.org/)                                                         | 4.1.0   | Date manipulation |
| [React Native Async Storage](https://github.com/react-native-async-storage/async-storage) | 2.1.0   | Async storage     |

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **React Native CLI** or **Expo CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/manastalukdar/expense-tracker.git
   cd expense-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)

   ```bash
   cd apps/mobile/ios && pod install && cd ../../../
   ```

4. **Start the Metro bundler**

   ```bash
   npm run mobile:start
   ```

5. **Run the application**

   For iOS:

   ```bash
   npm run mobile:ios
   ```

   For Android:

   ```bash
   npm run mobile:android
   ```

### Quick Commands

| Command                  | Description         |
| ------------------------ | ------------------- |
| `npm run mobile:start`   | Start Metro bundler |
| `npm run mobile:ios`     | Run iOS app         |
| `npm run mobile:android` | Run Android app     |
| `npm run mobile:test`    | Run tests           |
| `npm run mobile:lint`    | Lint code           |
| `npm run lint`           | Lint all workspaces |
| `npm run test`           | Test all workspaces |

## Development

### Workspace Structure

This project uses npm workspaces for monorepo management. Each package is independently versioned and can be developed in isolation while sharing dependencies.

### Adding New Features

1. **Shared Logic**: Add to `packages/shared/src/`
2. **Database Operations**: Add to `packages/database/src/`
3. **UI Components**: Add to `apps/mobile/src/components/`
4. **New Screens**: Add to `apps/mobile/src/screens/`

### Code Style

- **TypeScript**: All code must be typed
- **ESLint**: Follow the configured linting rules
- **Prettier**: Code is auto-formatted on save
- **Naming**: Use PascalCase for components, camelCase for functions

### Testing

```bash
# Run all tests
npm run test

# Run mobile app tests
npm run mobile:test

# Run tests in watch mode
npm run mobile:test -- --watch
```

### Building

```bash
# Build all packages
npm run build

# Build shared packages
npm run build --workspace=packages/shared
npm run build --workspace=packages/database
```

## Project Management

### Documentation

| Document                                                           | Description                 |
| ------------------------------------------------------------------ | --------------------------- |
| [Installation Guide](./documentation/product/installation.md)      | Detailed setup instructions |
| [Usage Guide](./documentation/product/usage.md)                    | User manual and features    |
| [Development Guide](./documentation/development/development.md)    | Development workflow        |
| [Architecture](./documentation/development/design-architecture.md) | Technical architecture      |
| [Testing](./documentation/development/testing.md)                  | Testing strategies          |

### Roadmap

- **Phase 1**: ✅ Core expense tracking (Complete)
- **Phase 2**: 🔄 Budget management and goals
- **Phase 3**: 🔄 Desktop application (Electron/Tauri)
- **Phase 4**: 🔄 Web application
- **Phase 5**: 🔄 Cloud sync and backup
- **Phase 6**: 🔄 Advanced analytics and insights

## Contributing

We welcome contributions! Please see our [Contributing Guide](./.github/CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Built with ❤️ using React Native and modern mobile development practices.**
