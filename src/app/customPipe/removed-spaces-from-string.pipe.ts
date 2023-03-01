import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removedSpacesFromString'
})
export class RemovedSpacesFromStringPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) { return ''; } else {
      return value.replace('&amp;', '').trim();
    }
  }
}
