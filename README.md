# World Clock Example

A sample World Clock written in three platforms:

- [VueJS](./world-clock-vue)
- [React](./world-clock-react)
- [Angular](./world-clock-ng)

## Configuration

To run the sample app on your local server, you must first sign up to [Rapid API](https://rapidapi.com) and obtain an API Key to use their web services.

The world clock app depends on the following services:

1. `https://wft-geo-db.p.rapidapi.com/v1/geo/cities` for resolving city names
2. `https://geocodeapi.p.rapidapi.com/GetTimezone` for resolving the time zone of the selected city

The API key must be saved into the `.env` file created at the root of your project folder:

For the VueJS implementation, use the following line:

```bash
VUE_APP_API_KEY="your-rapid-api-com-api-key"
```

For the React implementation, use the following line:

```bash
REACT_APP_API_KEY="your-rapid-api-com-api-key"
```

For the Angular implementation, use the following line:

```bash
API_KEY="your-rapid-api-com-api-key"
```
