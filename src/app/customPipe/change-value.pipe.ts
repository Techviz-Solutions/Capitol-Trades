import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'changeValue'
})
export class ChangeValPipe implements PipeTransform {

    transform(value: string): string {
        if (!value) {
            return '';
        }
        if (value === 'Sale') {
            return 'SELL';
        }
        if (value === 'Sale (Partial)') {
            return 'SELL';
        }
        if (value === 'Sale (Full)') {
            return 'SELL';
        }
        if (value === 'Purchase') {
            return 'Buy';
        }
        if (value === 'Exchange') {
            return 'Exch';
        }
        if (value === 'Received') {
            return 'Rec';
        }
    }
}
