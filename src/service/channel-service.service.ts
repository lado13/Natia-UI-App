import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ChannelApiResponse } from '../model/channel-api-response';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getData(): Observable<ChannelApiResponse> {
    return this.http.get<ChannelApiResponse>(this.apiUrl + 'GetDataForUI');
  }

  async getDataAsync(): Promise<ChannelApiResponse> {
    try {
      return await firstValueFrom(
        this.http.get<ChannelApiResponse>(this.apiUrl + 'GetDataForUI')
      );
    } catch (error) {
      console.error('GetDataForUI:', error);
      throw error;
    }
  }
}
