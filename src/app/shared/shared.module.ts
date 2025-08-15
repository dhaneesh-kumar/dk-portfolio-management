import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

// Components
import { FooterComponent } from "./components/footer/footer.component";

@NgModule({
  declarations: [
    // Components
    FooterComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  exports: [
    // Angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // Components
    FooterComponent,
  ],
})
export class SharedModule {}
