// 1. Angular core
import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';

// 2. Models
import { CurrentUser } from '@app/shared/component-interfaces';

@Component({
  selector: 'app-welcome',
  standalone: false,
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent implements OnInit, OnDestroy {
  currentUser: CurrentUser | null = null;
  currentTime = signal(new Date());
  private timeInterval: ReturnType<typeof setInterval> | null = null;

  greeting = computed(() => {
    const hour = this.currentTime().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  });

  ngOnInit(): void {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch {
        // ignore parse error
      }
    }

    this.timeInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
}
