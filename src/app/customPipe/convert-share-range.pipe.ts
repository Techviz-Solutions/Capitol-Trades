import {Pipe, PipeTransform} from '@angular/core';
import compileStreaming = WebAssembly.compileStreaming;

@Pipe({
    name: 'convertShareRange'
})
export class ConvertShareRangePipe implements PipeTransform {

    transform(value: string): string {
        if (!value && value === '--') {
            return '';
        }
        if (value) {
            let shareRange;
            const val = value.split('-');
            if (val.length > 1) {
                const firstPart = val[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                const secondPart = val[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                shareRange = `${firstPart.trim()} - ${secondPart.trim()}`;
                return shareRange;
            } else {
                shareRange = val[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return shareRange;
            }
        }
    }

}
