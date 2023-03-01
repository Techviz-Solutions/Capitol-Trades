import {Directive, ElementRef, OnInit} from '@angular/core';
import {Tooltip} from 'primeng';

@Directive({
    selector: '[appShowIfEllipsis]'
})
export class ShowIfEllipsisDirective implements OnInit {

    constructor(private tooltip: Tooltip,
                private elementRef: ElementRef<HTMLElement>) {
    }

    ngOnInit(): void {
        // Wait for DOM update
        setTimeout(() => {
            const element = this.elementRef.nativeElement;
            this.tooltip.disabled = element.scrollWidth <= element.clientWidth;
        });
  }
}
