import { Directive, ElementRef, Input, Renderer2, inject } from '@angular/core';
import { Value } from '../models/value';

@Directive({
  selector: '[appColorPrice]',
  standalone: true
})
export class ColorPriceDirective {

  private element: ElementRef<HTMLTableColElement> = inject(ElementRef);
  colorMap: Map<number, string> = new Map();

  @Input() position = '';

  constructor(private renderer: Renderer2) { 
    console.log('ColorPriceDirective: '+renderer.parentNode.toString());
    
  }

  fillColorMap() {
    this.colorMap.set(1, '00FF06');
    this.colorMap.set(2, '30EB00');
    this.colorMap.set(3, '6EFF01');
    this.colorMap.set(4, '9CEB00');
    this.colorMap.set(5, 'E4FF00');
    this.colorMap.set(6, 'EBE200');
    this.colorMap.set(7, 'FFE500');
    this.colorMap.set(8, 'EBC400');
    this.colorMap.set(9, 'FFC500');
    this.colorMap.set(10, 'EBAA00');
    this.colorMap.set(11, 'FFAE00');
    this.colorMap.set(12, 'EB9700');
    this.colorMap.set(13, 'FF9900');
    this.colorMap.set(14, 'EB8200');
    this.colorMap.set(15, 'FF8000');
    this.colorMap.set(16, 'EB6900');
    this.colorMap.set(17, 'FF6400');
    this.colorMap.set(18, 'EB4F00');
    this.colorMap.set(19, 'FF4701');
    this.colorMap.set(20, 'EB3600');
    this.colorMap.set(21, 'FF2D00');
    this.colorMap.set(22, 'EB1D00');
    this.colorMap.set(23, 'FF1100');
    this.colorMap.set(24, 'EB0200');
  }

  getClassColor(): string {
    // let currentHour = new Date().getHours();
    // let elementHour = new Date(element.datetime).getHours();
    // let isNow = currentHour == elementHour;
    // let bold = isNow ? " bold" : "";
    // return 'color-' + element.position + bold;
    return 'color-' + this.position;
  }
  
}
