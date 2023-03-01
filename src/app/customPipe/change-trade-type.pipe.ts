import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'changeTradeType'
})
export class ChangeTradeTypePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) { return ''; }
    if (value === 'Sale') { return 'Sell'; }
    if (value === 'Sale (Partial)') {return 'Sell (P)'; }
    if (value === 'Sale (Full)') { return 'Sell (F)'; }
    if (value === 'Purchase') {return 'Buy'; } else {
      return value;
    }
  }
}
