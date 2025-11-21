import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SystemStreamInfo } from '../model/systemStreamInfo';

@Injectable({
  providedIn: 'root'
})
export class SystemStreamInfoService {
  private apiUrl = `${environment.systemStreamInfoApi}`;

  constructor(private http: HttpClient) { }

  getSystemStreamInfo(): Observable<SystemStreamInfo[]> {
    return this.http.get<SystemStreamInfo[]>(this.apiUrl);
  }
}