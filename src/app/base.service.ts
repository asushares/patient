// Author: Preston Lee

import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  constructor(
    protected backendService: BackendService,
    protected http: HttpClient,
  ) {}

  formatErrors(errors: { [field: string]: Array<string> }): string[] {
    const formatted: string[] = [];
    for (const [key, msgs] of Object.entries(errors)) {
      msgs.forEach(msg => {
        formatted.push(key + ' ' + msg);
      });
    }
    return formatted;
  }

  formatErrorsHtml(errors: { [field: string]: Array<string> }): string {
    let html = '<ul>';
    for (const e of this.formatErrors(errors)) {
      html += '<li>' + e + '</li>';
    }
    html += '</ul>';
    return html;
  }

  formatErrorsText(errors: { [field: string]: Array<string> }): string {
    const text = this.formatErrors(errors).join(', ');
    return text;
  }

  toLowercaseLabel(text: string) {
    const matches = text.toLowerCase().match(/[a-z0-9-]/g);
    if (matches) {
      return matches.join('');
    } else {
      return '';
    }
  }
}
