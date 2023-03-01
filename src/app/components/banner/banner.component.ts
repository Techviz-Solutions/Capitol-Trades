import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  toggleTopBanner() {
    const banner = document.getElementById('top-banner');
    banner.classList.toggle('hidden');
    document.body.classList.toggle('banner-active');
  }
}
