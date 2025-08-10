import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Layout components
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationToastComponent } from './components/notification-toast/notification-toast.component';

// Shared Directives
import { ClickOutsideDirective } from './directives/click-outside.directive';

// Shared Pipes
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { PercentageFormatPipe } from './pipes/percentage-format.pipe';

@NgModule({
  declarations: [
    // Layout Components
    HeaderComponent,
    FooterComponent,
    NotificationToastComponent,
    
    // Directives
    ClickOutsideDirective,
    
    // Pipes
    CurrencyFormatPipe,
    PercentageFormatPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  exports: [
    // Angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
    // Layout Components
    HeaderComponent,
    FooterComponent,
    NotificationToastComponent,
    
    // Directives
    ClickOutsideDirective,
    
    // Pipes
    CurrencyFormatPipe,
    PercentageFormatPipe,
  ]
})
export class SharedModule { }
