import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GalleryPhoto {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  category?: string;
}

@Component({
  selector: 'app-gallery-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-card.component.html'
})
export class GalleryCardComponent {
  @Input() photo!: GalleryPhoto;

  constructor() { }
}