import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commentsConvert'
})
export class CommentsConvertPipe implements PipeTransform {

  transform(value: string): string {
    if (value === '--' || value === null || value === undefined) { return ''; } else {
      return value;
    }
}
}
