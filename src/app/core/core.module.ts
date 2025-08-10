import { NgModule, Optional, SkipSelf } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";

// Services
import { AuthService } from "./services/auth.service";
import { NotificationService } from "./services/notification.service";
import { LoggerService } from "./services/logger.service";

// Interceptors
import { ErrorInterceptor } from "./interceptors/error.interceptor";
import { LoadingInterceptor } from "./interceptors/loading.interceptor";

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
  providers: [
    // Core Services
    AuthService,
    NotificationService,
    LoggerService,

    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        "CoreModule is already loaded. Import it in AppModule only.",
      );
    }
  }
}
