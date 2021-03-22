import React, { Fragment, useState } from "react";
import "./App.css";
import axios, { AxiosResponse } from "axios";
import { WorldClock } from "./WorldClock";
interface City {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  tz: TimeZone;
}

interface TimeZone {
  Country: string;
  TimeZoneId: string;
  GMT_offset: number;
}
function App(props: any) {
  const [cityPrefix, setCityPrefix] = useState<string>("");
  const [allCities, setAllCities] = useState<City[]>([]);
  // const [cityIndex, setCityIndex] = useState<number>(-1);

  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  function doAPICall(
    url: string,
    host: string,
    params: object
  ): Promise<unknown> {
    return axios
      .get(url, {
        headers: {
          "x-rapidapi-key": process.env.REACT_APP_API_KEY,
          useQueryString: true,
          "x-rapidapi-host": host,
        },
        params,
      })
      .then((r: AxiosResponse) => r.data);
  }

  function resolveCity(pref: string) {
    doAPICall(
      "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
      "wft-geo-db.p.rapidapi.com",
      {
        namePrefix: pref,
      }
    )
      .then((z: any) => z.data as City[])
      .then((cities: City[]) => {
        console.log(cities);
        setAllCities(cities);
      });
  }

  function onCitySelected(e: any) {
    const sel = Number(e.target.value);
    console.log("City selected", sel, allCities[sel].city);
    const loc = allCities[sel];

    doAPICall(
      "https://geocodeapi.p.rapidapi.com/GetTimezone",
      "geocodeapi.p.rapidapi.com",
      {
        latitude: loc.latitude,
        longitude: loc.longitude,
      }
    )
      .then((x: unknown) => x as TimeZone)
      .then((tz: TimeZone) => {
        console.log("City details", tz);
        setSelectedCities([...selectedCities, { ...loc, tz }]);
      });
  }

  return (
    <div className="App">
      {process.env.REACT_APP_API_KEY ? "" : <span>Missing API Key</span>}
      <header className="App-header">
        <p>
          Enter city name (or first few letters)
          <input
            type="text"
            value={cityPrefix}
            onChange={(e: any) => setCityPrefix(e?.target?.value)}
            onBlur={() => {
              resolveCity(cityPrefix);
            }}
          />
        </p>
        {allCities.length > 0 ? (
          <Fragment>
            <p>
              There are {allCities.length} cities start with '{cityPrefix}'
            </p>
            <select onChange={(e) => onCitySelected(e)}>
              <option value="-1" disabled selected>
                Select a city
              </option>
              {allCities.map((c: City, pos: number) => (
                <option value={pos} key={pos}>
                  {c.city}, {c.country}
                </option>
              ))}
            </select>
            <ol>
              {selectedCities.map((c: City, pos: number) => (
                <WorldClock
                  key={pos}
                  label={c.city}
                  timeZone={c.tz.TimeZoneId}
                  gmtOffset={c.tz.GMT_offset}></WorldClock>
              ))}
            </ol>
          </Fragment>
        ) : (
          <p>You typed {cityPrefix}</p>
        )}
      </header>
    </div>
  );
}

export default App;
