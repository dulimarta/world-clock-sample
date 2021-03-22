import { DateTimeFormatter, ZonedDateTime, ZoneId } from "@js-joda/core";
import React, { Component, createRef, RefObject } from "react";
import "./WorldClock.css";
import { Locale } from "@js-joda/locale_en";
import "@js-joda/timezone";
type ClockProp = {
  timeZone: string;
  label: string;
  gmtOffset: number;
};
const CLOCK_DIAMETER = 176;

const formatter = DateTimeFormatter.ofPattern("EE HH:mm:ss").withLocale(
  Locale.US
);
interface TickListener {
  tick(): void;
}
interface ClockState {
  currentTime: ZonedDateTime | null;
}

const tickObservers: WorldClock[] = [];
export class WorldClock extends Component<ClockProp> implements TickListener {
  private gmtOffset: number;
  private label: string;
  private zoneId: ZoneId;
  private clockFace: RefObject<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private timer!: NodeJS.Timeout;

  public state: ClockState = {
    currentTime: null,
  };

  constructor(props: ClockProp) {
    super(props);
    console.log("Input props is", props.label, props.timeZone);
    this.gmtOffset = props.gmtOffset;
    this.label = props.label;
    this.clockFace = createRef();
    this.zoneId = ZoneId.of(props.timeZone);
    this.setState({ currentTime: ZonedDateTime.now(this.zoneId) });
  }

  componentDidMount() {
    tickObservers.push(this);
    this.ctx = this.clockFace.current?.getContext("2d") ?? null;
    if (tickObservers.length === 1) {
      this.timer = setInterval(() => {
        tickObservers.forEach((t: TickListener) => {
          t.tick();
        });
      }, 1000);
    }
  }

  timeOffset(): string {
    return this.gmtOffset < 0
      ? this.gmtOffset.toString()
      : `+${this.gmtOffset}`;
  }

  prettyTime(): string {
    if (this.state.currentTime) return formatter.format(this.state.currentTime);
    else return "N/A";
  }

  drawClockFace() {
    this.ctx?.clearRect(0, 0, CLOCK_DIAMETER, CLOCK_DIAMETER);
    this.ctx?.save();
    this.ctx?.translate(CLOCK_DIAMETER / 2, CLOCK_DIAMETER / 2);
    this.ctx?.beginPath();
    this.ctx?.arc(0, 0, CLOCK_DIAMETER / 2, 0, 2 * Math.PI);
    this.ctx?.stroke();
    this.ctx?.restore();

    for (let k = 0; k < 12; k++) {
      this.ctx?.save();
      this.ctx?.translate(CLOCK_DIAMETER / 2, CLOCK_DIAMETER / 2);
      this.ctx?.rotate((k * Math.PI) / 6);
      this.ctx?.translate(CLOCK_DIAMETER / 2 - 10, 0);

      this.ctx?.fillRect(0, -1, 8, 3);
      this.ctx?.restore();
    }
  }

  drawHand(length: number, angle: number) {
    this.ctx?.save();
    this.ctx?.translate(CLOCK_DIAMETER / 2, CLOCK_DIAMETER / 2);
    this.ctx?.rotate(angle - Math.PI / 2);
    this.ctx?.fillRect(0, -1, length, 3);
    this.ctx?.restore();
  }

  drawTime(hour: number, minute: number) {
    if (hour > 12) hour -= 12;
    // Calculate the long hand angle at the exact hour
    let shortHandAngle = (hour * Math.PI) / 6;
    const longHandAngle = (minute / 60) * 2 * Math.PI;
    // Add a fraction of the hour within the 30-deg gap
    // between the two tick marks
    shortHandAngle += (minute * Math.PI) / 360;
    this.drawHand((CLOCK_DIAMETER / 2) * 0.6, shortHandAngle);
    this.drawHand((CLOCK_DIAMETER / 2) * 0.8, longHandAngle);
  }

  tick() {
    this.setState({ currentTime: ZonedDateTime.now(this.zoneId) });
    this.drawClockFace();
    this.drawTime(
      this.state.currentTime?.hour() ?? 0,
      this.state.currentTime?.minute() ?? 0
    );
  }

  render() {
    return (
      <span id="clock">
        <canvas
          ref={this.clockFace}
          width={CLOCK_DIAMETER}
          height={CLOCK_DIAMETER}></canvas>
        <h2>{this.prettyTime()}</h2>
        <h4>
          {this.label} GMT{this.timeOffset()}
        </h4>
      </span>
    );
  }
}
