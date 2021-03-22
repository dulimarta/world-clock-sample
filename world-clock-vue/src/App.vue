<template>
  <div id="app">
    <div id="api-key-error" v-if="!API_KEY">
      <code>VUE_APP_API_KEY</code> is undefined.
      Create <code>.env</code> at the top of your project and insert.
      <pre>
      VUE_APP_API_KEY="your-rapid-api-key-goes-here"  
      </pre>
    </div>
    <p>Enter city name (or its first few letters) <input type="text"
        v-model.lazy="cityPrefix"></p>
    <template v-if="availableCities.length > 0">
      <label for="city-select">Choose a city</label>
      <select id="city-select" v-model.number="selectedCityIndex"
        @change="onCitySelected">
        <option value="-1" disabled selected>Select a city</option>
        <option v-for="(c,pos) in availableCities" :key="pos" :value="pos">
          {{c.city}}, {{c.country}} </option>

      </select>
    </template>
    <div id="time-wall">
      <WorldClock v-for="(c,pos) in selectedCities" :key="pos"
        @clock-removed="removeMe" :time-zone="c.tz.TimeZoneId"
        :gmt-offset="c.tz.GMT_offset" :label="c.city" />
    </div>
  </div>
</template>

<script lang="ts">
interface City {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  tz?: TimeZone;
}
interface TimeZone {
  Country: string;
  CountryId: string;
  GMT_offset: number;
  LocalTime_Now: string;
  TimeZoneId: string;
  TimeZoneName: string;
}
import { Component, Vue, Watch } from "vue-property-decorator";
import WorldClock from "./components/WorldClock.vue";
import axios, { AxiosResponse } from "axios";
@Component({
  components: {
    WorldClock,
  },
})
export default class App extends Vue {
  private cityPrefix = "";
  private availableCities: City[] = [];
  private selectedCityIndex = -1;
  private selectedCities: City[] = [];
  readonly API_KEY = process.env.VUE_APP_API_KEY;

  doAPICall(url: string, host: string, params: object): Promise<unknown> {
    return axios
      .get(url, {
        headers: {
          "x-rapidapi-key": process.env.VUE_APP_API_KEY,
          useQueryString: true,
          "x-rapidapi-host": host,
        },
        params,
      })
      .then((r: AxiosResponse) => r.data);
  }

  @Watch("cityPrefix")
  cityChanged() {
    // console.log("City has changed to", this.cityPrefix);
    this.doAPICall(
      "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
      "wft-geo-db.p.rapidapi.com",
      {
        namePrefix: this.cityPrefix,
        limit: 10,
      }
    )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((z: any) => z.data as City[])
      .then((cities: City[]) => {
        this.availableCities.splice(0);
        this.availableCities.push(...cities);
        this.selectedCityIndex = -1;
      });
  }

  onCitySelected() {
    const loc = this.availableCities[this.selectedCityIndex];
    this.doAPICall(
      "https://geocodeapi.p.rapidapi.com/GetTimezone",
      "geocodeapi.p.rapidapi.com",
      {
        latitude: loc.latitude,
        longitude: loc.longitude,
      }
    )
      .then((x: unknown) => x as TimeZone)
      .then((tz: TimeZone) => {
        // console.log("Geo details", tz);
        this.selectedCities.push({ ...loc, tz });
      });
  }

  removeMe(clockLabel: string) {
    console.log("Remove ", clockLabel);
    const idx = this.selectedCities.findIndex(
      (c: City) => c.city == clockLabel
    );
    if (idx >= 0) this.selectedCities.splice(idx, 1);
  }
}
</script>

<style>
#api-key-error {
  display: inline-block;
  padding: 1em;
  border: 2px solid red;
  border-radius: 1em;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  margin-top: 60px;
}

#time-wall {
  margin-top: 16px;
}
</style>
