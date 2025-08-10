import { Pipe, PipeTransform } from "@angular/core";
import { APP_CONSTANTS } from "../../core/constants/app.constants";

@Pipe({
  name: "currencyFormat",
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    currency: string = APP_CONSTANTS.MARKET.CURRENCIES.PRIMARY,
    showSymbol: boolean = true,
    minimumFractionDigits: number = 2,
    maximumFractionDigits: number = 2,
  ): string {
    if (value === null || value === undefined || value === "") {
      return showSymbol
        ? `${APP_CONSTANTS.MARKET.CURRENCIES.SYMBOL}0.00`
        : "0.00";
    }

    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return showSymbol
        ? `${APP_CONSTANTS.MARKET.CURRENCIES.SYMBOL}0.00`
        : "0.00";
    }

    // Format the number with proper decimal places
    const formattedNumber = numericValue.toLocaleString("en-IN", {
      minimumFractionDigits,
      maximumFractionDigits,
    });

    // Add currency symbol if requested
    if (showSymbol && currency === "INR") {
      return `${APP_CONSTANTS.MARKET.CURRENCIES.SYMBOL}${formattedNumber}`;
    }

    if (showSymbol) {
      return `${currency} ${formattedNumber}`;
    }

    return formattedNumber;
  }
}
