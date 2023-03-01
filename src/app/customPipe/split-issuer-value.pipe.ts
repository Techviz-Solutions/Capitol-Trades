import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'splitForIssuer'
})
export class SplitPipeForIssuer implements PipeTransform {

    transform(value: string): string {
        if (!value) { return ''; }
        return value.split(' ')[0];
    }
}
