import { Component } from "@angular/core";
import { APP_CONSTANTS } from "../../../core/constants/app.constants";

@Component({
  selector: "app-footer",
  template: `
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-600">
              © 2024 {{ appName }}. All rights reserved.
            </p>
          </div>
          <div class="flex space-x-6">
            <a href="#" class="text-sm text-gray-600 hover:text-gray-900"
              >Privacy Policy</a
            >
            <a href="#" class="text-sm text-gray-600 hover:text-gray-900"
              >Terms of Service</a
            >
            <a href="#" class="text-sm text-gray-600 hover:text-gray-900"
              >Contact</a
            >
          </div>
        </div>
      </div>
    </footer>
  `,
  standalone: false,
})
export class FooterComponent {
  readonly appName = APP_CONSTANTS.APP_NAME;
}
