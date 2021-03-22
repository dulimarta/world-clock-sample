import { Component } from '@angular/core';
import { City, TimeZone } from './app-types';
import axios, { AxiosResponse } from 'axios';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  cityPrefix = '';
  availableCities: City[] = [];
  selectedCityIndex = -1;
  selectedCities: City[] = [];

  doAPICall(url: string, host: string, params: object): Promise<unknown> {
    return axios
      .get(url, {
        headers: {
          'x-rapidapi-key': environment.apiKey,
          useQueryString: true,
          'x-rapidapi-host': host,
        },
        params,
      })
      .then((r: AxiosResponse) => r.data);
  }
  showCities(): void {
    this.doAPICall(
      'https://wft-geo-db.p.rapidapi.com/v1/geo/cities',
      'wft-geo-db.p.rapidapi.com',
      {
        namePrefix: this.cityPrefix,
      }
    )
      .then((z: any) => z.data as City[])
      .then((cities: City[]) => {
        // console.log(cities);
        this.availableCities.splice(0);
        this.availableCities.push(...cities);
        this.selectedCityIndex = -1;
      });
  }
  onCitySelected(): void {
    const loc = this.availableCities[this.selectedCityIndex];
    this.doAPICall(
      'https://geocodeapi.p.rapidapi.com/GetTimezone',
      'geocodeapi.p.rapidapi.com',
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

  apiKeyMissing(): boolean {
    return environment.apiKey === undefined || environment.apiKey === null;
  }
}
