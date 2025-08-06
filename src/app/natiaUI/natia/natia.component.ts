import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelServiceService } from '../../../service/channel-service.service';
import { SignalRService } from '../../../service/signal-rservice.service';
import { Satellite } from '../../../model/satellite';
import { TemperatureInfo } from '../../../model/temperature-info';
import { TVChannel } from '../../../model/tvchannel';
import { firstValueFrom } from 'rxjs';
import { ThemeServiceService } from '../../../service/theme-service.service';

@Component({
  selector: 'app-natia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './natia.component.html',
  styleUrls: ['./natia.component.scss']
})
export class NatiaComponent implements OnInit {
  channels: TVChannel[] = [];
  satellites: Satellite[] = [];
  temperatureInfo!: TemperatureInfo;
  robotSpeech: string | null = null; // ✅ added

  constructor(
    private channelService: ChannelServiceService,
    private signalRService: SignalRService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private themeService: ThemeServiceService
  ) { }

  async ngOnInit(): Promise<void> {
    console.log('🚀 NatiaComponent ngOnInit started');
    await this.loadDataWithRetry();
    await this.initSignalR();
    console.log('🚀 NatiaComponent ngOnInit completed');

    this.themeService.applyAutoTheme();

    // Recheck every hour (or you can reduce this to every minute if needed)
    setInterval(() => {
      this.themeService.applyAutoTheme();
    }, 60 * 60 * 1000); // every hour
  }


  async loadDataWithRetry(retries = 3, delay = 2000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const data = await firstValueFrom(this.channelService.getData());
        console.log('📊 Raw API response:', JSON.stringify(data, null, 2));

        let rawChannels = data.ChanellInfo || [];
        if (!Array.isArray(rawChannels)) {
          console.warn('⚠️ API channels data is not an array:', rawChannels);
          rawChannels = [];
        }
        this.channels = rawChannels.map((item: any) => ({
          Order: item.order || item.Order,
          ChanellName: item.chanellName || item.ChanellName,
          HaveError: item.haveError !== undefined ? item.haveError : item.HaveError || false,
          IsDIsable: item.isDIsable !== undefined ? item.isDIsable : item.IsDIsable || false,
          status: item.status || item.Status
        }));

        let rawSatellites = data.SatelliteView || [];
        if (!Array.isArray(rawSatellites)) {
          console.warn('⚠️ API satellites data is not an array:', rawSatellites);
          rawSatellites = [];
        }
        this.satellites = rawSatellites.map((item: any) => ({
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

        this.temperatureInfo = data.TemperatureInfo || {};
        console.log('📺 Channels after mapping:', JSON.stringify(this.channels, null, 2));
        console.log('🛰️ Satellites after mapping:', JSON.stringify(this.satellites, null, 2));
        console.log('🌡️ Temperature after mapping:', JSON.stringify(this.temperatureInfo, null, 2));
        this.cdr.detectChanges();
        return;
      } catch (error) {
        console.error(`❌ Data load error (attempt ${attempt}/${retries}):`, error);
        if (attempt < retries) {
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    console.error('❌ Failed to load data after all retries');
    this.channels = [];
    this.satellites = [];
    this.cdr.detectChanges();
  }

  async initSignalR(): Promise<void> {
    try {
      await this.signalRService.startConnection();
      console.log('📡 SignalR subscriptions initializing');

      this.ngZone.run(() => {
        this.signalRService.temperature$.subscribe(data => {
          if (data) {
            console.log('🌡️ Temperature update received:', JSON.stringify(data, null, 2));
            this.temperatureInfo = { ...data };
            this.cdr.detectChanges();
            console.log('🔁 UI updated with temperature');
          }
        });

        this.signalRService.chanellInfo$.subscribe(data => {
          if (data && Array.isArray(data) && data.length > 0) {
            console.log('%c📡 Channel info update received:', 'color: cyan;', JSON.stringify(data, null, 2));
            this.updateChannelsWithError(data);
            this.cdr.detectChanges();
            console.log('🔁 UI updated with channel info, channels:', JSON.stringify(this.channels, null, 2));
          } else {
            console.warn('⚠️ Invalid or empty chanellInfo data, skipping:', data);
          }
        });

        this.signalRService.satellite$.subscribe(data => {
          if (data && Array.isArray(data) && data.length > 0) {
            console.log('%c🛰️ Satellite update received:', 'color: blue;', JSON.stringify(data, null, 2));
            this.satellites = [...data];
            this.cdr.detectChanges();
            console.log('🔁 UI updated with satellites, satellites:', JSON.stringify(this.satellites, null, 2));
          } else {
            console.warn('⚠️ Invalid or empty satellite data, skipping:', data);
          }
        });




        let robotTimeout: any;

        // ✅ 🤖 robotsay update
        this.signalRService.robotAudio$.subscribe(msg => {
          if (msg) {
            console.log('🤖 Robot says:', msg);
            this.robotSpeech = msg;
            this.cdr.detectChanges();
            clearTimeout(robotTimeout);
            robotTimeout = setTimeout(() => {
              console.log('🕛 robotSpeech cleared after 10 seconds of no new messages');
              this.robotSpeech = null;
              this.cdr.detectChanges();
            }, 10000);
          }
        });

      });
    } catch (error) {
      console.error('❌ SignalR initialization error:', error);
    }
  }

  updateChannelsWithError(updatedChannels: TVChannel[]): void {
    console.log('🔄 Updating channels with error, current channels:', JSON.stringify(this.channels, null, 2));
    if (updatedChannels.length > 0) {
      this.channels = [...updatedChannels];
    } else {
      console.warn('⚠️ chanellInfoUpdate is empty, preserving current channels');
    }
    console.log('🔄 Updated channels:', JSON.stringify(this.channels, null, 2));
  }

  updateChannelStatuses(statusData: any[]): void {
    console.log('🔄 Updating channel statuses, current channels:', JSON.stringify(this.channels, null, 2));
    const newChannels = this.channels.map(channel => {
      const status = statusData.find(s => s.id === channel.Order);
      if (status) {
        console.log(`🔄 Updating channel ${channel.Order} status to ${status.status}`);
        return { ...channel };
      }
      return channel;
    });
    this.channels = [...newChannels];
    console.log('🔄 Updated channels:', JSON.stringify(this.channels, null, 2));
  }

  get isHot(): boolean {
    const temp = parseFloat(this.temperatureInfo?.temperature || '0');
    console.log('🌡️ Checking isHot, temp:', temp);
    return temp >= 23;
  }

  trackByOrder(index: number, channel: TVChannel): number {
    return channel.Order;
  }

  trackByDegree(index: number, satellite: Satellite): string {
    return satellite.Degree;
  }
}
