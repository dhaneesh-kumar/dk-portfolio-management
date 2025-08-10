import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header></app-header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  standalone: false,
})
export class AppComponent {
  title = "Portfolio Management";
}
