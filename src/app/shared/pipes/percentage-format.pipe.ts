import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "percentageFormat",
})
export class PercentageFormatPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    minimumFractionDigits: number = 2,
    maximumFractionDigits: number = 2,
    showSign: boolean = false,
    showSymbol: boolean = true,
  ): string {
    if (value === null || value === undefined || value === "") {
      return showSymbol ? "0.00%" : "0.00";
    }

    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return showSymbol ? "0.00%" : "0.00";
    }

    // Format the number with proper decimal places
    const formattedNumber = Math.abs(numericValue).toLocaleString("en-IN", {
      minimumFractionDigits,
      maximumFractionDigits,
    });

    let result = formattedNumber;

    // Add sign if requested or if the number is negative
    if (showSign || numericValue < 0) {
      const sign = numericValue >= 0 ? "+" : "-";
      result = `${sign}${result}`;
    }

    // Add percentage symbol if requested
    if (showSymbol) {
      result += "%";
    }

    return result;
  }
}
