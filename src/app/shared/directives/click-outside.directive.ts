import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from "@angular/core";

@Directive({
  selector: "[appClickOutside]",
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<Event>();

  constructor(private elementRef: ElementRef) {}

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(target);

    if (!clickedInside) {
      this.clickOutside.emit(event);
    }
  }

  @HostListener("document:touchstart", ["$event"])
  onDocumentTouchStart(event: Event): void {
    // Handle touch events for mobile devices
    this.onDocumentClick(event);
  }
}
