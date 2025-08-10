import { Component, Input } from "@angular/core";
import { Stock } from "../../models/portfolio.model";

@Component({
  selector: "app-portfolio-chart",
  template: `
    <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">{{ title }}</h3>
      <div class="h-64 flex items-center justify-center text-slate-500">
        Chart visualization will be implemented here
        <br />
        Type: {{ type }} | Stocks: {{ stocks.length }}
      </div>
    </div>
  `,
  standalone: false,
})
export class PortfolioChartComponent {
  @Input() stocks: Stock[] = [];
  @Input() title: string = "Portfolio Chart";
  @Input() type: "pie" | "bar" = "pie";
}
