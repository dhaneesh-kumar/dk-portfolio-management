# Project: dk-portfolio-management                                                                                              │
 │     2                                                                                                                                 │
 │     3 ## Project Overview                                                                                                             │
 │     4                                                                                                                                 │
 │     5 This is a portfolio management application built with Angular and Tailwind CSS. It uses Firebase for authentication (Google     │
 │       Sign-In and email/password) and provides features for managing investment portfolios, tracking stocks, and viewing market       │
 │       data. The project follows a clean, modular architecture with a clear separation of concerns between core, shared, and feature   │
 │       modules.                                                                                                                        │
 │     6                                                                                                                                 │
 │     7 **Key Technologies:**                                                                                                           │
 │     8                                                                                                                                 │
 │     9 *   **Frontend:** Angular, TypeScript, Tailwind CSS                                                                             │
 │    10 *   **Authentication:** Firebase Authentication                                                                                 │
 │    11 *   **State Management:** Angular Signals and RxJS                                                                              │
 │    12 *   **UI Components:** ngx-quill for rich text editing                                                                          │
 │    13                                                                                                                                 │
 │    14 ## Building and Running                                                                                                         │
 │    15                                                                                                                                 │
 │    16 *   **Install Dependencies:**                                                                                                   │
 │    17     ```bash                                                                                                                     │
 │    18     npm install                                                                                                                 │
 │    19     ```                                                                                                                         │
 │    20 *   **Run Development Server:**                                                                                                 │
 │    21     ```bash                                                                                                                     │
 │    22     npm start                                                                                                                   │
 │    23     ```                                                                                                                         │
 │    24     The application will be available at `http://localhost:4200/`.                                                              │
 │    25                                                                                                                                 │
 │    26 *   **Build for Production:**                                                                                                   │
 │    27     ```bash                                                                                                                     │
 │    28     npm run build                                                                                                               │
 │    29     ```                                                                                                                         │
 │    30     The production-ready artifacts will be stored in the `dist/` directory.                                                     │
 │    31                                                                                                                                 │
 │    32 *   **Run Unit Tests:**                                                                                                         │
 │    33     ```bash                                                                                                                     │
 │    34     npm run test                                                                                                                │
 │    35     ```                                                                                                                         │
 │    36                                                                                                                                 │
 │    37 ## Development Conventions                                                                                                      │
 │    38                                                                                                                                 │
 │    39 The project follows the architecture and conventions outlined in `ARCHITECTURE.md`. Key points include:                         │
 │    40                                                                                                                                 │
 │    41 *   **Modular Architecture:** The code is organized into `core`, `shared`, and `features` modules.                              │
 │    42     *   `core`: Singleton services, guards, and interceptors.                                                                   │
 │    43     *   `shared`: Reusable components, pipes, and directives.                                                                   │
 │    44     *   `features`: Self-contained business features (e.g., portfolio, auth).                                                   │
 │    45 *   **State Management:** A combination of Angular Signals and RxJS is used for reactive state management.                      │
 │    46 *   **Styling:** Tailwind CSS is used for styling. Configuration is in `tailwind.config.js`.                                    │
 │    47 *   **Coding Style:** The project uses Prettier for code formatting and follows standard Angular naming conventions.            │
 │    48 *   **Testing:** Unit tests are written with Jasmine and Karma.         