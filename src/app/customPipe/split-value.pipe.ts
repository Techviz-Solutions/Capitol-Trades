import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'split'
})
export class SplitPipe implements PipeTransform {

    transform(value: string): string {
        if (!value) { return ''; }
        return value.split(' ')[0] + ' ' + value.split(' ')[1].charAt(0);
    }
}
