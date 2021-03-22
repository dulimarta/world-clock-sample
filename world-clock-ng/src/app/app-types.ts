export interface City {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  tz?: TimeZone;
}

export interface TimeZone {
  Country: string;
  CountryId: string;
  GMT_offset: number;
  LocalTime_Now: string;
  TimeZoneId: string;
  TimeZoneName: string;
}
