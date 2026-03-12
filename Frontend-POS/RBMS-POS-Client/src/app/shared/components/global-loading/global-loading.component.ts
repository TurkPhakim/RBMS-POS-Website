import { Component } from '@angular/core';
import { LoadingService } from '@app/core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: false,
  templateUrl: './global-loading.component.html',
})
export class GlobalLoadingComponent {
  constructor(public loadingService: LoadingService) {}
}
