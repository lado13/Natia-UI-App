import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import { TVChannel } from '../model/tvchannel';
import { Satellite } from '../model/satellite';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  private temperatureSource = new BehaviorSubject<any>(null);
  temperature$ = this.temperatureSource.asObservable();

  private channelStatusSource = new BehaviorSubject<any[]>([]);
  channelStatus$ = this.channelStatusSource.asObservable();

  private chanellInfoSource = new BehaviorSubject<TVChannel[]>([]);
  chanellInfo$ = this.chanellInfoSource.asObservable();

  private satelliteSource = new BehaviorSubject<Satellite[]>([]);
  satellite$ = this.satelliteSource.asObservable();

  public async startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.signalRHubUrl)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.onreconnecting((error) => {
      console.warn('🔄 SignalR reconnecting:', error);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('%c🔄 SignalR reconnected, connectionId:', 'color: green;', connectionId);
    });

    this.hubConnection.onclose((error) => {
      console.error('❌ SignalR connection closed:', error);
    });

    try {
      await this.hubConnection.start();
      console.log('%c✅ SignalR connected to', 'color: green;', environment.signalRHubUrl);
      this.registerListeners();
    } catch (error) {
      console.error('❌ SignalR connection error:', error);
      throw error;
    }
  }

  private registerListeners(): void {
    this.hubConnection.on('temperatureUpdate', (data) => {
      console.log('%c🌡️ temperatureUpdate:', 'color: green;', JSON.stringify(data, null, 2));
      this.temperatureSource.next(data);
    });

    this.hubConnection.on('channelStatusUpdate', (data) => {
      console.log('%c📡 channelStatusUpdate:', 'color: green;', JSON.stringify(data, null, 2));
      if (data && data.names && typeof data.names === 'object') {
        const statusArray = Object.entries(data.names).map(([id, name]) => ({
          id: parseInt(id),
          status: name
        }));
        console.log('%c📡 Converted channelStatusUpdate:', 'color: green;', JSON.stringify(statusArray, null, 2));
        this.channelStatusSource.next(statusArray);
      } else {
        console.warn('⚠️ Invalid channelStatusUpdate data, skipping:', data);
      }
    });

    this.hubConnection.on('chanellInfoUpdate', (data: any[]) => {
      console.log('%c📡 chanellInfoUpdate:', 'color: cyan;', JSON.stringify(data, null, 2));
      if (Array.isArray(data) && data.length > 0) {
        const mappedData: TVChannel[] = data.map(item => ({
          Order: item.order,
          ChanellName: item.chanellName,
          HaveError: item.haveError,
          IsDIsable: item.isDisable,
          status: item.status
        }));
        console.log('%c📡 Mapped chanellInfoUpdate:', 'color: cyan;', JSON.stringify(mappedData, null, 2));
        this.chanellInfoSource.next(mappedData);
      } else {
        console.warn('⚠️ Invalid or empty chanellInfoUpdate data, skipping:', data);
      }
    });
    this.hubConnection.on('satelliteMonitoringUpdate', (data: any[]) => {
      console.log('%c🛰️ satelliteMonitoringUpdate:', 'color: blue;', JSON.stringify(data, null, 2));
      if (Array.isArray(data) && data.length > 0) {
        const mappedData: Satellite[] = data.map(item => ({
          Degree: item.degree || item.Degree,
          details: (item.details || []).map((detail: any) => ({
            Frequency: detail.frequency || detail.Frequency,
            SymbolRate: detail.symbolRate || detail.SymbolRate,
            Polarisation: detail.polarisation || detail.Polarisation,
            PortIn250: detail.portIn250 || detail.PortIn250 || 0,
            mer: detail.mer || detail.Mer || null,
            HaveError: detail.haveError !== undefined ? detail.haveError : detail.HaveError || false
          }))
        }));
        console.log('%c🛰️ Mapped satelliteMonitoringUpdate:', 'color: blue;', JSON.stringify(mappedData, null, 2));
        this.satelliteSource.next(mappedData);
      } else {
        console.warn('⚠️ Invalid or empty satelliteMonitoringUpdate data, skipping:', data);
      }
    });
  }
}