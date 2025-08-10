# Migration Guide: From Current Structure to Clean Architecture

This guide helps you migrate your existing Angular portfolio management app to the new clean architecture.

## 📋 Migration Checklist

### Phase 1: Core Module Setup ✅

- [x] Create `core/` module structure
- [x] Move `AuthService` to `core/services/`
- [x] Create `LoggerService`, `NotificationService`, `LoadingService`
- [x] Create HTTP interceptors for error handling and loading
- [x] Move guards to `core/guards/`
- [x] Create application constants
- [x] Update guard implementations with proper error handling

### Phase 2: Shared Module Setup ✅

- [x] Create `shared/` module structure
- [x] Create reusable components (LoadingSpinner, NotificationToast, Header)
- [x] Create custom pipes (CurrencyFormat, PercentageFormat)
- [x] Create custom directives (ClickOutside)
- [x] Create base models and interfaces
- [x] Move `User` model to shared models

### Phase 3: Feature Module Migration (Portfolio)

- [x] Create `features/portfolio/` structure
- [x] Create portfolio feature module and routing
- [x] Create comprehensive portfolio models
- [x] Create portfolio service with clean architecture principles
- [ ] **NEXT**: Migrate existing portfolio components
- [ ] **NEXT**: Create portfolio data service
- [ ] **NEXT**: Create portfolio calculation service

### Phase 4: Remaining Feature Modules

- [ ] Create `features/stock/` module
- [ ] Create `features/auth/` module
- [ ] Create `features/profile/` module
- [ ] Migrate existing components to respective features

### Phase 5: App Module Updates

- [x] Create main `app-routing.module.ts`
- [x] Create new `app.module.ts` with clean structure
- [ ] **NEXT**: Update `main.ts` to use new app module
- [ ] **NEXT**: Test routing and lazy loading

## 🔄 Component Migration Steps

### Current Structure → New Structure

#### 1. Move Existing Components

**From:**

```
src/app/
├── components/
│   ├── firebase-setup.component.ts
│   ├── header.component.ts
│   ├── login.component.ts
│   ├── portfolio-chart.component.ts
│   ├── share-portfolio.component.ts
���   └── stock-search.component.ts
├── pages/
│   ├── portfolio-detail.component.ts
│   ├── portfolio-list.component.ts
│   └── stock-detail.component.ts
```

**To:**

```
src/app/
├── shared/components/
│   ├── header/header.component.ts                    # ✅ Done
│   └── firebase-setup/firebase-setup.component.ts   # Move from components/
├── features/
│   ├── auth/components/
│   │   └── login/login.component.ts                  # Move from components/
│   ├── portfolio/components/
│   │   ├── portfolio-list/portfolio-list.component.ts    # Move from pages/
│   │   ├── portfolio-detail/portfolio-detail.component.ts # Move from pages/
│   │   ├── portfolio-chart/portfolio-chart.component.ts   # Move from components/
│   │   └── share-portfolio/share-portfolio.component.ts   # Move from components/
│   └── stock/components/
│       ├── stock-detail/stock-detail.component.ts         # Move from pages/
│       └── stock-search/stock-search.component.ts         # Move from components/
```

#### 2. Update Component Imports

**Old Import Pattern:**

```typescript
import { AuthService } from "../services/auth.service";
import { PortfolioService } from "../services/portfolio.service";
```

**New Import Pattern:**

```typescript
import { AuthService } from "../../../core/services/auth.service";
import { PortfolioService } from "../services/portfolio.service";
import { NotificationService } from "../../../core/services/notification.service";
```

#### 3. Update Service Patterns

**Old Service:**

```typescript
@Injectable({
  providedIn: "root",
})
export class PortfolioService {
  portfolios = signal<Portfolio[]>([]);

  async createPortfolio(data: any) {
    // Direct implementation
  }
}
```

**New Service Pattern:**

```typescript
@Injectable()
export class PortfolioService {
  // Reactive state
  private readonly _portfoliosState = signal<AsyncState<Portfolio[]>>({
    isLoading: false,
    hasError: false,
    data: [],
  });

  // Dependencies
  private readonly dataService = inject(PortfolioDataService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);

  // Public interface
  readonly portfolios = computed(() => this._portfoliosState().data || []);
  readonly isLoading = computed(() => this._portfoliosState().isLoading);

  async createPortfolio(data: CreatePortfolioDto): Promise<Portfolio | null> {
    try {
      this.updateState({ isLoading: true });
      const result = await this.dataService.createPortfolio(data);

      if (result) {
        this.notificationService.success("Success", "Portfolio created");
        this.logger.info("Portfolio created", { id: result.id });
      }

      return result;
    } catch (error) {
      this.handleError("Failed to create portfolio", error as Error);
      return null;
    }
  }
}
```

## 📦 Service Migration

### 1. Move Services to Appropriate Modules

**Core Services (Singleton):**

- `auth.service.ts` → `core/services/` ✅
- `firebase-portfolio.service.ts` → Split into feature services
- `market-data.service.ts` → `features/stock/services/`
- `stock-api.service.ts` → `features/stock/services/`

**Feature Services:**

- `portfolio.service.ts` → `features/portfolio/services/` ✅

### 2. Update Service Imports

Update all components that use services:

```typescript
// Update in all components
import { AuthService } from "../../../core/services/auth.service";
import { PortfolioService } from "../services/portfolio.service";
```

## 🗂️ Model Migration

### 1. Move Models to Appropriate Locations

**From:**

```
src/app/models/portfolio.model.ts
```

**To:**

```
src/app/shared/models/
├── base.model.ts        # ✅ Done
��── user.model.ts        # ✅ Done

src/app/features/portfolio/models/
└── portfolio.model.ts   # ✅ Done

src/app/features/stock/models/
└── stock.model.ts       # Create from portfolio.model.ts
```

### 2. Update Model Imports

```typescript
// Old
import { User, Portfolio, Stock } from "../models/portfolio.model";

// New
import { User } from "../../../shared/models/user.model";
import { Portfolio, Stock } from "../models/portfolio.model";
```

## 🛣️ Routing Migration

### 1. Update Route Guards

**Old:**

```typescript
import { authGuard } from "./guards/auth.guard";
```

**New:**

```typescript
import { AuthGuard } from "./core/guards/auth.guard";
```

### 2. Update Route Configuration

**Old routes.ts:**

```typescript
const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  {
    path: "dashboard",
    component: PortfolioListComponent,
    canActivate: [authGuard],
  },
];
```

**New app-routing.module.ts:**

```typescript
const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/components/login/login.component"),
    canActivate: [GuestGuard],
  },
  {
    path: "dashboard",
    loadChildren: () => import("./features/portfolio/portfolio.module"),
    canActivate: [AuthGuard],
  },
];
```

## 🔧 Configuration Updates

### 1. Update Angular JSON

Make sure `budgets` are set correctly for the new modular structure:

```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "1MB",
      "maximumError": "2MB"
    }
  ]
}
```

### 2. Update Environment Files

Ensure environment files are properly configured:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  logLevel: "debug",
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  logLevel: "warn",
};
```

## 🧪 Testing Updates

### 1. Update Test Imports

```typescript
// Update all spec files
import { AuthService } from "../../../core/services/auth.service";
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
```

### 2. Mock Services for Testing

```typescript
const mockAuthService = {
  user: signal(null),
  authStatus$: () => of(false),
  signIn: jasmine.createSpy("signIn").and.returnValue(Promise.resolve(true)),
};
```

## ⚠️ Breaking Changes

### 1. Import Path Changes

All import paths will change. Use global find/replace:

- `../services/auth.service` → `../../../core/services/auth.service`
- `../models/portfolio.model` → `../models/portfolio.model` or `../../../shared/models/`

### 2. Service Registration Changes

Services now registered in feature modules instead of root:

```typescript
// Old
@Injectable({ providedIn: 'root' })

// New
@Injectable() // Provided in feature module
```

### 3. Component Module Dependencies

Components now depend on SharedModule:

```typescript
// Old
imports: [CommonModule, FormsModule, RouterModule];

// New
imports: [SharedModule]; // Includes CommonModule, FormsModule, RouterModule
```

## 📝 Step-by-Step Migration Process

### Step 1: Setup New Structure (✅ Complete)

1. Create core, shared, and features directories
2. Move and refactor auth service
3. Create new guards and interceptors
4. Create shared components and utilities

### Step 2: Migrate Portfolio Feature (🔄 In Progress)

1. ✅ Create portfolio feature module structure
2. ✅ Create portfolio models and DTOs
3. ✅ Create portfolio service with clean architecture
4. 🔄 **Next**: Migrate portfolio components
5. ⏳ Create portfolio data service
6. ⏳ Update portfolio component imports
7. ⏳ Test portfolio feature functionality

### Step 3: Migrate Stock Feature (⏳ Pending)

1. Create stock feature module
2. Move stock-related components
3. Move stock services
4. Update imports and dependencies

### Step 4: Migrate Auth Feature (⏳ Pending)

1. Create auth feature module
2. Move login component
3. Create auth routing
4. Update auth-related dependencies

### Step 5: Final Integration (⏳ Pending)

1. Update main app module
2. Update main.ts
3. Test all routes and lazy loading
4. Update build configuration
5. Run comprehensive tests

## 🚀 Benefits After Migration

1. **Better Code Organization**: Clear separation of concerns
2. **Improved Performance**: Lazy loading reduces initial bundle size
3. **Enhanced Maintainability**: Features can be developed independently
4. **Better Testing**: Services and components can be tested in isolation
5. **Type Safety**: Comprehensive TypeScript interfaces
6. **Error Handling**: Global error handling and user notifications
7. **Developer Experience**: Consistent patterns and clear structure

## 🔍 Validation Steps

After each migration phase:

1. **Build Check**: `npm run build` should succeed
2. **Lint Check**: `npm run lint` should pass
3. **Test Check**: `npm run test` should pass
4. **Functionality Check**: Test key user flows
5. **Bundle Analysis**: Check bundle sizes haven't increased significantly

## 📞 Support

If you encounter issues during migration:

1. Check the ARCHITECTURE.md for detailed explanations
2. Review the new service patterns and component structures
3. Ensure all imports are updated correctly
4. Verify that services are registered in the correct modules
5. Check that route guards are properly configured

The migration improves code quality, maintainability, and scalability while following Angular and clean code best practices.
