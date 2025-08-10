import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

// Components
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";

// Pipes
import { CurrencyFormatPipe } from "./pipes/currency-format.pipe";
import { PercentageFormatPipe } from "./pipes/percentage-format.pipe";

// Directives
import { ClickOutsideDirective } from "./directives/click-outside.directive";

@NgModule({
  declarations: [
    // Components
    HeaderComponent,
    FooterComponent,

    // Pipes
    CurrencyFormatPipe,
    PercentageFormatPipe,

    // Directives
    ClickOutsideDirective,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  exports: [
    // Angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // Components
    HeaderComponent,
    FooterComponent,

    // Pipes
    CurrencyFormatPipe,
    PercentageFormatPipe,

    // Directives
    ClickOutsideDirective,
  ],
})
export class SharedModule {}
