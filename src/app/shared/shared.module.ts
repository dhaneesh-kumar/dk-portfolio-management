import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Layout components
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationToastComponent } from './components/notification-toast/notification-toast.component';

@NgModule({
  declarations: [
    // Layout Components
    HeaderComponent,
    FooterComponent,
    NotificationToastComponent,
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
  ]
})
export class SharedModule { }
