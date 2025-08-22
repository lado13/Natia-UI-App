
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import { TVChannel } from '../model/tvchannel';
import { Satellite } from '../model/satellite';
import { OpticChannelProblem } from '../model/optic-channel-problem';
import { CardInfoToActivate } from '../model/card-info-to-activate';
import { RegionRelay } from '../model/region-relay';
import { DiscoMessage } from '../model/disco-message';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;


  // Use a BehaviorSubject to create a stream
  private temperatureSource = new BehaviorSubject<any>(null);
  temperature$ = this.temperatureSource.asObservable();

  private robotAudioSource = new BehaviorSubject<string | null>(null);
  robotAudio$ = this.robotAudioSource.asObservable();

  private channelStatusSource = new BehaviorSubject<any[]>([]);
  channelStatus$ = this.channelStatusSource.asObservable();

  private chanellInfoSource = new BehaviorSubject<TVChannel[]>([]);
  chanellInfo$ = this.chanellInfoSource.asObservable();

  private satelliteSource = new BehaviorSubject<Satellite[]>([]);
  satellite$ = this.satelliteSource.asObservable();

  private opticChannelProblemSource = new BehaviorSubject<OpticChannelProblem[]>([]);
  opticChannelProblem$ = this.opticChannelProblemSource.asObservable();

  private cardInfoSource = new BehaviorSubject<CardInfoToActivate[]>([]);
  cardInfo$ = this.cardInfoSource.asObservable();

  private regionRelaySource = new BehaviorSubject<RegionRelay[]>([]);
  regionRelay$ = this.regionRelaySource.asObservable();

  private discoAnimationSource = new BehaviorSubject<DiscoMessage | null>(null);
  discoAnimation$ = this.discoAnimationSource.asObservable();


  //signaler connection start
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

    // 🌡️ Temperature
    this.hubConnection.on('temperatureUpdate', (data) => {
      // console.log('%c🌡️ temperatureUpdate:', 'color: green;', JSON.stringify(data, null, 2));
      this.temperatureSource.next(data);
    });


    //disco animate 
    this.hubConnection.on('StartAnimate', (data: any) => {

      console.log(data,"service>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      
      if (data && data.sender && data.message) {
        const message: DiscoMessage = {
          // sender: data.sender,
          message: data.message
        };

        this.discoAnimationSource.next(message);

      } else {
        console.warn('⚠️ Invalid disco animation data:', data);
      }
    });

    // 🤖 robotsay
    this.hubConnection.on('robotsay', (data) => {
      // console.log('%c🤖 robotsay:', 'color: green;', data);

      if (typeof data === 'string') {
        this.robotAudioSource.next(data);
      } else if (data && data.robotSay) {
        this.robotAudioSource.next(data.robotSay);
      } else {
        console.warn('⚠️ robotsay received but unknown format:', data);
      }
    });



    // 📡 Channel Status
    this.hubConnection.on('channelStatusUpdate', (data) => {
      // console.log('%c📡 channelStatusUpdate:', 'color: green;', JSON.stringify(data, null, 2));
      if (data && data.names && typeof data.names === 'object') {
        const statusArray = Object.entries(data.names).map(([id, name]) => ({
          id: parseInt(id),
          status: name
        }));
        // console.log('%c📡 Converted channelStatusUpdate:', 'color: green;', JSON.stringify(statusArray, null, 2));
        this.channelStatusSource.next(statusArray);
      } else {
        console.warn('⚠️ Invalid channelStatusUpdate data, skipping:', data);
      }
    });

    // 📺 Channel Info
    this.hubConnection.on('chanellInfoUpdate', (data: any[]) => {
      // console.log('%c📡 chanellInfoUpdate:', 'color: cyan;', JSON.stringify(data, null, 2));
      if (Array.isArray(data) && data.length > 0) {
        const mappedData: TVChannel[] = data.map(item => ({
          Order: item.order,
          ChanellName: item.chanellName,
          HaveError: item.haveError,
          IsDIsable: item.isDIsable,
          status: item.status
        }));
        // console.log('%c📡 Mapped chanellInfoUpdate:', 'color: cyan;', JSON.stringify(mappedData, null, 2));
        this.chanellInfoSource.next(mappedData);
      } else {
        console.warn('⚠️ Invalid or empty chanellInfoUpdate data, skipping:', data);
      }
    });


    //satellite
    this.hubConnection.on('satelliteMonitoringUpdate', (data: any[]) => {
      // console.log('🛰️ satelliteMonitoringUpdate:', data);
      if (Array.isArray(data) && data.length > 0) {
        const mappedData: Satellite[] = data.map(item => ({
          Degree: item.degree ?? item.Degree,
          details: (item.details || []).map((detail: any) => ({
            Frequency: detail.frequency ?? detail.Frequency,
            SymbolRate: detail.symbolRate ?? detail.SymbolRate,
            Polarisation: detail.polarisation ?? detail.Polarisation,
            PortIn250: detail.portIn250 ?? detail.PortIn250 ?? 0,
            mer: detail.mer ?? detail.Mer ?? null,
            HaveError: !!(detail.haveError ?? detail.HaveError),
            HaveWarn: !!(detail.haveWarn ?? detail.HaveWarn)
          }))
        }));
        this.satelliteSource.next(mappedData);
      } else {
        console.warn('⚠️ Invalid or empty satelliteMonitoringUpdate data:', data);
      }
    });



    //channel how have problem
    this.hubConnection.on('OpticChannelHealthUpdate', (data: any) => {
      const updates: OpticChannelProblem[] = data.opticChanellsWhichHaveProblem || [];

      if (!Array.isArray(updates) || updates.length === 0) {
        this.opticChannelProblemSource.next([]);
        return;
      }

      this.opticChannelProblemSource.next(updates.map(u => ({ ...u })));
    });



    //card witch need activate
    this.hubConnection.on('CardsWhichNeedToBeActivate', (data: any) => {
      const updates: CardInfoToActivate[] = data.cardsInfoThathNeedToBeActivated || [];

      if (!Array.isArray(updates)) return;

      if (updates.length === 0) {
        this.cardInfoSource.next([]);
        return;
      }

      const current = this.cardInfoSource.value;
      const newArray = [...current];

      updates.forEach(update => {
        const index = newArray.findIndex(c =>
          c.card === update.card &&
          c.port === update.port &&
          c.emr === update.emr
        );

        if (index >= 0) {
          newArray[index] = { ...newArray[index], ...update };
        } else {
          newArray.push(update);
        }
      });


      this.cardInfoSource.next([...newArray]);
    });



    //region relay bitrate 
    this.hubConnection.on('regionbitrateupdate', (data: any) => {
      // console.log('[SignalR] GetRegionMergGrouped received:', data);

      const updates: RegionRelay[] = Array.isArray(data) ? data : [];

      if (updates.length === 0) {
        console.log('[SignalR] No region relays found, clearing BehaviorSubject.');
        this.regionRelaySource.next([]);
        return;
      }

      console.log('[SignalR] Updating BehaviorSubject with new region relays.');
      this.regionRelaySource.next(updates.map(u => ({ ...u })));
    });




  }
}


























