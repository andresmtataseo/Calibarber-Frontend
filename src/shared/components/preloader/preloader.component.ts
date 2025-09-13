import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PreloaderComponent implements OnChanges {
  @Input() show: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'xl';
  @Input() color: string = 'primary';
  
  isVisible: boolean = false;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show']) {
      if (this.show) {
        this.isVisible = true;
      } else {
        // Delay hiding to allow fade-out animation
        setTimeout(() => {
          this.isVisible = false;
        }, 200);
      }
    }
  }

  get sizeClass(): string {
    const sizeMap = {
      'sm': 'loading-sm',
      'md': 'loading-md',
      'lg': 'loading-lg',
      'xl': 'loading-xl'
    };
    return sizeMap[this.size];
  }
}
