import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

// Core Module (singleton services, guards, interceptors)
import { CoreModule } from "./core/core.module";

// Shared Module
import { SharedModule } from './shared/shared.module';

// Routing
import { AppRoutingModule } from "./app-routing.module";

// Main App Component
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [
    // Angular Core Modules
    BrowserModule,

    // App Core Module (must be imported only once)
    CoreModule,

    // Shared Module (temporarily disabled for debugging)
    // SharedModule,

    // App Routing (must be last)
    AppRoutingModule,
  ],
  providers: [
    // All providers are handled in CoreModule
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
