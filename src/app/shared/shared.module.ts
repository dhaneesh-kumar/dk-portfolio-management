import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

// Shared Components
import { LoadingSpinnerComponent } from "./components/loading-spinner/loading-spinner.component";
import { ConfirmDialogComponent } from "./components/confirm-dialog/confirm-dialog.component";
import { NotificationToastComponent } from "./components/notification-toast/notification-toast.component";
import { ErrorMessageComponent } from "./components/error-message/error-message.component";
import { EmptyStateComponent } from "./components/empty-state/empty-state.component";

// Shared Directives
import { ClickOutsideDirective } from "./directives/click-outside.directive";
import { HighlightDirective } from "./directives/highlight.directive";

// Shared Pipes
import { CurrencyFormatPipe } from "./pipes/currency-format.pipe";
import { PercentageFormatPipe } from "./pipes/percentage-format.pipe";
import { TimeAgoPipe } from "./pipes/time-ago.pipe";
import { TruncatePipe } from "./pipes/truncate.pipe";

const SHARED_COMPONENTS = [
  LoadingSpinnerComponent,
  ConfirmDialogComponent,
  NotificationToastComponent,
  ErrorMessageComponent,
  EmptyStateComponent,
];

const SHARED_DIRECTIVES = [ClickOutsideDirective, HighlightDirective];

const SHARED_PIPES = [
  CurrencyFormatPipe,
  PercentageFormatPipe,
  TimeAgoPipe,
  TruncatePipe,
];

const ANGULAR_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
];

@NgModule({
  declarations: [...SHARED_COMPONENTS, ...SHARED_DIRECTIVES, ...SHARED_PIPES],
  imports: [...ANGULAR_MODULES],
  exports: [
    // Angular modules
    ...ANGULAR_MODULES,

    // Shared components, directives, and pipes
    ...SHARED_COMPONENTS,
    ...SHARED_DIRECTIVES,
    ...SHARED_PIPES,
  ],
})
export class SharedModule {}
