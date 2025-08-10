import { Component, Input } from "@angular/core";

@Component({
  selector: "app-loading-spinner",
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <div
        class="animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
        [class]="spinnerClass"
        [attr.aria-label]="loadingText"
        role="status"
      >
        <span class="sr-only">{{ loadingText }}</span>
      </div>

      @if (showText && loadingText) {
        <span class="ml-3 text-sm font-medium" [class]="textClass">
          {{ loadingText }}
        </span>
      }
    </div>
  `,
  standalone: true,
})
export class LoadingSpinnerComponent {
  @Input() size: "xs" | "sm" | "md" | "lg" | "xl" = "md";
  @Input() color:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "white" = "primary";
  @Input() loadingText = "Loading...";
  @Input() showText = false;
  @Input() fullScreen = false;

  get containerClass(): string {
    const baseClass = this.fullScreen
      ? "fixed inset-0 bg-white bg-opacity-80 z-50"
      : "p-4";

    return baseClass;
  }

  get spinnerClass(): string {
    const sizeClasses = {
      xs: "h-4 w-4",
      sm: "h-6 w-6",
      md: "h-8 w-8",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    };

    const colorClasses = {
      primary: "text-blue-600",
      secondary: "text-slate-600",
      success: "text-green-600",
      warning: "text-yellow-600",
      error: "text-red-600",
      white: "text-white",
    };

    return `${sizeClasses[this.size]} ${colorClasses[this.color]}`;
  }

  get textClass(): string {
    const colorClasses = {
      primary: "text-blue-600",
      secondary: "text-slate-600",
      success: "text-green-600",
      warning: "text-yellow-600",
      error: "text-red-600",
      white: "text-white",
    };

    return colorClasses[this.color];
  }
}
