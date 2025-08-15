import {
  Component,
  Input,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Stock } from "../../models/portfolio.model";

@Component({
  selector: "app-portfolio-chart",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">{{ title }}</h3>

      <!-- SVG Pie Chart -->
      @if (type === "pie") {
        <div class="flex items-center justify-center">
          <svg
            #svgElement
            width="300"
            height="300"
            class="drop-shadow-sm"
          ></svg>
        </div>

        <!-- Legend -->
        <div class="mt-6 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          @for (segment of chartData; track segment.label) {
            <div class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded-full flex-shrink-0"
                [style.background-color]="segment.color"
              ></div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-slate-900 truncate">
                  {{ segment.label }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ segment.percentage }}% (₹{{
                    segment.value | number: "1.0-0"
                  }})
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Bar Chart -->
      @if (type === "bar") {
        <div class="space-y-3">
          @for (item of chartData; track item.label; let i = $index) {
            <div class="flex items-center gap-3">
              <div class="w-20 text-sm font-medium text-slate-700 truncate">
                {{ item.label }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-slate-200 rounded-full h-3">
                    <div
                      class="h-3 rounded-full transition-all duration-1000 ease-out"
                      [style.width.%]="item.percentage"
                      [style.background-color]="item.color"
                    ></div>
                  </div>
                  <div
                    class="text-sm font-medium text-slate-900 w-12 text-right"
                  >
                    {{ item.percentage }}%
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class PortfolioChartComponent implements OnInit, AfterViewInit {
  @Input() stocks: Stock[] = [];
  @Input() title: string = "Portfolio Allocation";
  @Input() type: "pie" | "bar" = "pie";
  @ViewChild("svgElement") svgElement!: ElementRef<SVGElement>;

  chartData: Array<{
    label: string;
    value: number;
    percentage: number;
    color: string;
  }> = [];

  private colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#6366F1",
    "#84CC16",
    "#06B6D4",
    "#F43F5E",
    "#8B5A2B",
    "#6B7280",
    "#DC2626",
  ];

  ngOnInit() {
    this.prepareChartData();
  }

  ngAfterViewInit() {
    if (this.type === "pie") {
      setTimeout(() => this.drawPieChart(), 100);
    }
  }

  private prepareChartData() {
    if (this.stocks.length === 0) return;

    const totalValue = this.stocks.reduce(
      (sum, stock) => sum + stock.totalValue,
      0,
    );

    this.chartData = this.stocks
      .map((stock, index) => ({
        label: stock.ticker,
        value: stock.totalValue,
        percentage: Math.round((stock.totalValue / totalValue) * 100 * 10) / 10,
        color: this.colors[index % this.colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }

  private drawPieChart() {
    if (!this.svgElement || this.chartData.length === 0) return;

    const svg = this.svgElement.nativeElement;
    svg.innerHTML = ""; // Clear existing content

    const radius = 120;
    const centerX = 150;
    const centerY = 150;

    let currentAngle = -90; // Start from top

    this.chartData.forEach((segment, index) => {
      const angle = (segment.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      // Convert to radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // Calculate arc path
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      // Create path element
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", pathData);
      path.setAttribute("fill", segment.color);
      path.setAttribute("stroke", "white");
      path.setAttribute("stroke-width", "2");
      path.setAttribute(
        "class",
        "transition-all duration-300 hover:opacity-80",
      );

      // Add title for tooltip
      const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title",
      );
      title.textContent = `${segment.label}: ${segment.percentage}%`;
      path.appendChild(title);

      svg.appendChild(path);

      currentAngle += angle;
    });
  }
}
