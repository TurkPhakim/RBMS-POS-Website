import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ApiConfiguration } from '@app/core/api/api-configuration';

@Component({
  selector: 'app-slip-preview-dialog',
  standalone: false,
  templateUrl: './slip-preview-dialog.component.html',
})
export class SlipPreviewDialogComponent implements OnInit {
  imageUrl = '';

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private apiConfig: ApiConfiguration,
  ) {}

  ngOnInit(): void {
    const fileId = this.config.data?.fileId as number;
    this.imageUrl = `${this.apiConfig.rootUrl}/api/admin/file/${fileId}`;
  }

  onDownload(): void {
    const link = document.createElement('a');
    link.href = this.imageUrl;
    link.download = 'slip.jpg';
    link.target = '_blank';
    link.click();
  }
}
