import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Shared Directives
import { ClickOutsideDirective } from './directives/click-outside.directive';

// Shared Pipes
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { PercentageFormatPipe } from './pipes/percentage-format.pipe';

const SHARED_COMPONENTS: any[] = [
  // Components will be added as they are created
];

const SHARED_DIRECTIVES = [
  ClickOutsideDirective,
];

const SHARED_PIPES = [
  CurrencyFormatPipe,
  PercentageFormatPipe,
];

const ANGULAR_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
];

@NgModule({
  declarations: [
    ...SHARED_COMPONENTS,
    ...SHARED_DIRECTIVES,
    ...SHARED_PIPES,
  ],
  imports: [
    ...ANGULAR_MODULES,
  ],
  exports: [
    // Angular modules
    ...ANGULAR_MODULES,
    
    // Shared components, directives, and pipes
    ...SHARED_COMPONENTS,
    ...SHARED_DIRECTIVES,
    ...SHARED_PIPES,
  ]
})
export class SharedModule { }
