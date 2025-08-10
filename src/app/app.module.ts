import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Core Module (singleton services, guards, interceptors)
import { CoreModule } from './core/core.module';

// Shared Module (reusable components, pipes, directives)
import { SharedModule } from './shared/shared.module';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Main App Component
import { AppComponent } from './app.component';

// Layout Components
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    NotificationToastComponent,
  ],
  imports: [
    // Angular Core Modules
    BrowserModule,
    
    // App Core Module (must be imported only once)
    CoreModule,
    
    // Shared Module (reusable components and utilities)
    SharedModule,
    
    // App Routing (must be last)
    AppRoutingModule,
  ],
  providers: [
    // All providers are handled in CoreModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
