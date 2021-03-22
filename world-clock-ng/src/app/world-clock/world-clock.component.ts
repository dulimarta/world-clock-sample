import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DateTimeFormatter, ZonedDateTime, ZoneId } from '@js-joda/core';
import '@js-joda/timezone';
import { Locale } from '@js-joda/locale_en';

const formatter = DateTimeFormatter.ofPattern('EE HH:mm:ss').withLocale(
  Locale.US
);

interface TickListener {
  tick(): void;
}
const timerRecipients: WorldClockComponent[] = [];

@Component({
  selector: 'app-world-clock',
  templateUrl: './world-clock.component.html',
  styleUrls: ['./world-clock.component.css'],
})
export class WorldClockComponent implements OnInit, AfterViewInit {
  readonly CLOCK_DIAMETER = 128;

  @Input()
  label!: string;

  @Input()
  gmtOffset: number | undefined;

  @Input()
  timeZone: string | undefined;

  @ViewChild('clock') clock!: ElementRef<HTMLCanvasElement>;

  private zoneId!: ZoneId;
  private currentTime!: ZonedDateTime;
  private ctx: CanvasRenderingContext2D | null = null;
  private timer: any;
  constructor() {}

  get prettyTime(): string {
    if (this.currentTime) {
      return formatter.format(this.currentTime);
    } else {
      return 'N/A';
    }
  }

  get offset(): string {
    return (this.gmtOffset ?? 0 < 0 ? '' : '+') + this.gmtOffset;
  }

  ngOnInit(): void {
    this.zoneId = this.timeZone
      ? ZoneId.of(this.timeZone)
      : ZoneId.systemDefault();
    this.currentTime = ZonedDateTime.now(this.zoneId);
  }

  ngAfterViewInit(): void {
    this.ctx = this.clock.nativeElement.getContext('2d');
    timerRecipients.push(this);
    this.tick();
    if (timerRecipients.length === 1) {
      this.timer = setInterval(() => {
        timerRecipients.forEach((t: TickListener) => t.tick());
      }, 1000);
    }
  }

  drawClockFace(): void {
    this.ctx?.clearRect(0, 0, this.CLOCK_DIAMETER, this.CLOCK_DIAMETER);
    this.ctx?.save();
    this.ctx?.translate(this.CLOCK_DIAMETER / 2, this.CLOCK_DIAMETER / 2);
    this.ctx?.beginPath();
    this.ctx?.arc(0, 0, this.CLOCK_DIAMETER / 2, 0, 2 * Math.PI);
    this.ctx?.stroke();
    this.ctx?.restore();

    for (let k = 0; k < 12; k++) {
      this.ctx?.save();
      this.ctx?.translate(this.CLOCK_DIAMETER / 2, this.CLOCK_DIAMETER / 2);
      this.ctx?.rotate((k * Math.PI) / 6);
      this.ctx?.translate(this.CLOCK_DIAMETER / 2 - 10, 0);

      this.ctx?.fillRect(0, -1, 8, 3);
      this.ctx?.restore();
    }
  }

  drawHand(length: number, angle: number): void {
    this.ctx?.save();
    this.ctx?.translate(this.CLOCK_DIAMETER / 2, this.CLOCK_DIAMETER / 2);
    this.ctx?.rotate(angle - Math.PI / 2);
    this.ctx?.fillRect(0, -1, length, 3);
    this.ctx?.restore();
  }

  drawTime(hour: number, minute: number): void {
    if (hour > 12) {
      hour -= 12;
    }
    // Calculate the long hand angle at the exact hour
    let shortHandAngle = (hour * Math.PI) / 6;
    const longHandAngle = (minute / 60) * 2 * Math.PI;
    // Add a fraction of the hour within the 30-deg gap
    // between the two tick marks
    shortHandAngle += (minute * Math.PI) / 360;
    this.drawHand((this.CLOCK_DIAMETER / 2) * 0.6, shortHandAngle);
    this.drawHand((this.CLOCK_DIAMETER / 2) * 0.8, longHandAngle);
  }

  tick(): void {
    this.currentTime = ZonedDateTime.now(this.zoneId);
    this.drawClockFace();
    this.drawTime(this.currentTime.hour(), this.currentTime.minute());
  }
}
