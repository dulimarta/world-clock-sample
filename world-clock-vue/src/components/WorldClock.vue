<template>
  <span ref="clock" id="clock" @mouseenter="mouseIn"
    @mouseleave="mouseOut">
    <button ref="delete" @click="deleteClock">X</button>
    <canvas ref="clockFace" :width="CLOCK_DIAMETER"
      :height="CLOCK_DIAMETER"></canvas>
    <h2>{{prettyTime}}</h2>
    <h4>{{label}} / {{offset}}</h4>
  </span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import "@js-joda/timezone";
import { Locale } from "@js-joda/locale_en";
import { DateTimeFormatter, ZonedDateTime, ZoneId } from "@js-joda/core";

interface TickListener {
  tick(): void;
}
const tickObservers: WorldClock[] = [];
// let timerHandler: number;
let timer: number;

@Component
export default class WorldClock extends Vue implements TickListener {
  readonly CLOCK_DIAMETER = 128;

  @Prop()
  readonly timeZone!: string;

  @Prop() readonly gmtOffset!: number;

  @Prop()
  readonly label!: string;

  private formatter: DateTimeFormatter;
  private currentTime: ZonedDateTime;
  private zoneId: ZoneId;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    super();
    this.formatter = DateTimeFormatter.ofPattern("EE HH:mm:ss").withLocale(
      Locale.US
    );
    this.zoneId = ZoneId.of(this.timeZone);
    this.currentTime = ZonedDateTime.now(this.zoneId);
  }

  mounted() {
    tickObservers.push(this);
    this.ctx = (this.$refs.clockFace as HTMLCanvasElement).getContext("2d");
    if (tickObservers.length == 1) {
      timer = setInterval(() => {
        tickObservers.forEach((t: TickListener) => {
          t.tick();
        });
      }, 1000);
    }
  }

  drawClockFace() {
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

  drawTime(hour: number, minute: number) {
    if (hour > 12) hour -= 12;
    // Calculate the long hand angle at the exact hour
    let shortHandAngle = (hour * Math.PI) / 6;
    const longHandAngle = (minute / 60) * 2 * Math.PI;
    // Add a fraction of the hour within the 30-deg gap
    // between the two tick marks
    shortHandAngle += (minute * Math.PI) / 360;
    this.drawHand((this.CLOCK_DIAMETER / 2) * 0.6, shortHandAngle);
    this.drawHand((this.CLOCK_DIAMETER / 2) * 0.8, longHandAngle);
  }

  drawHand(length: number, angle: number) {
    this.ctx?.save();
    this.ctx?.translate(this.CLOCK_DIAMETER / 2, this.CLOCK_DIAMETER / 2);
    this.ctx?.rotate(angle - Math.PI / 2);
    this.ctx?.fillRect(0, -1, length, 3);
    this.ctx?.restore();
  }
  // beforeDestroy() {}

  get prettyTime(): string {
    if (this.currentTime) return this.formatter.format(this.currentTime);
    else return "N/A";
  }

  get offset(): string {
    return "GMT" + (this.gmtOffset > 0 ? "+" : "") + this.gmtOffset;
  }
  tick(): void {
    // console.log("Got a tick");
    this.currentTime = ZonedDateTime.now(this.zoneId);
    this.drawClockFace();
    this.drawTime(this.currentTime.hour(), this.currentTime.minute());
  }

  mouseIn(): void {
    (this.$refs.delete as HTMLElement).style.visibility = "visible";
  }

  mouseOut(): void {
    (this.$refs.delete as HTMLElement).style.visibility = "hidden";
  }

  deleteClock() {
    const pos = tickObservers.findIndex(
      (t: WorldClock) => t.label == this.label
    );
    if (pos >= 0) {
      tickObservers.splice(pos, 1);
      if (tickObservers.length == 0) clearInterval(timer);
      this.$emit("clock-removed", this.label);
    }
  }
}
</script>

<style scoped>
span {
  display: inline-block;
  min-width: 10em;
  border-radius: 1em;
  border: 3px solid black;
  margin: 0.25em;
}

/* #clock:hover {
  border: 3px solid red;
} */

canvas {
  margin-top: 16px;
}
button {
  position: absolute;
  margin-left: 54px;
  /* visibility: hidden; */
}
</style>