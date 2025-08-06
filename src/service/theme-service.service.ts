import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeServiceService {

  constructor() { }

  applyAutoTheme(): void {
    const hour = new Date().getHours();

    // Dark mode: 10 PM (22) to 10 AM (10)
    const isDarkMode = hour >= 22 || hour < 10;

    if (isDarkMode) {
      this.setDarkMode();
    } else {
      this.setLightMode();
    }
  }

  setDarkMode(): void {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  }

  setLightMode(): void {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }

}
