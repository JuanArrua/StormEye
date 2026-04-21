import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Weather.css';

import searchIcon from '../assets/search.png';
import clearIcon from '../assets/clear.png';
import cloudIcon from '../assets/cloud.png';
import drizzleIcon from '../assets/drizzle.png';
import rainIcon from '../assets/rain.png';
import snowIcon from '../assets/snow.png';
import windIcon from '../assets/wind.png';
import humidityIcon from '../assets/humidity.png';
import clearNightIcon from '../assets/clear-n.png';
import cloudNightIcon from '../assets/cloud-n.png';
import drizzleNightIcon from '../assets/drizzle-n.png';

const WEATHER_MAP = {
  clear: {
    day: clearIcon,
    night: clearNightIcon,
    label: 'Cielo despejado',
  },
  cloudy: {
    day: cloudIcon,
    night: cloudNightIcon,
    label: 'Cielo nublado',
  },
  drizzle: {
    day: drizzleIcon,
    night: drizzleNightIcon,
    label: 'Llovizna',
  },
  rain: {
    day: rainIcon,
    night: rainIcon,
    label: 'Lluvia',
  },
  snow: {
    day: snowIcon,
    night: snowIcon,
    label: 'Nieve',
  },
};

const WEATHER_CODE_GROUPS = {
  clear: [0],
  cloudy: [1, 2, 3, 45, 48],
  drizzle: [51, 53, 55, 56, 57],
  rain: [61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99],
  snow: [71, 73, 75, 77, 85, 86],
};

function getWeatherGroup(code) {
  return Object.entries(WEATHER_CODE_GROUPS).find(([, codes]) => codes.includes(code))?.[0] ?? 'cloudy';
}

function formatCityLabel(name, countryCode) {
  return [name, countryCode].filter(Boolean).join(', ');
}

const Weather = () => {
  const inputRef = useRef(null);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async (rawCity) => {
    const city = rawCity?.trim();

    if (!city) {
      setError('Ingresa una ciudad para consultar el clima.');
      setWeatherData(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const geocodeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`
      );
      const geocodeData = await geocodeResponse.json();

      if (!geocodeResponse.ok || !geocodeData.results?.length) {
        setError('No encontre esa ciudad. Prueba con otro nombre.');
        setWeatherData(null);
        return;
      }

      const location = geocodeData.results[0];
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day&timezone=auto`
      );
      const weatherPayload = await weatherResponse.json();

      if (!weatherResponse.ok || !weatherPayload.current) {
        setError('No se pudo obtener el clima en este momento.');
        setWeatherData(null);
        return;
      }

      const current = weatherPayload.current;
      const group = getWeatherGroup(current.weather_code);
      const isDay = current.is_day === 1;
      const presentation = WEATHER_MAP[group];

      setWeatherData({
        location: formatCityLabel(location.name, location.country_code),
        temperature: Math.round(current.temperature_2m),
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        description: presentation.label,
        icon: isDay ? presentation.day : presentation.night,
        dayPeriod: isDay ? 'Dia' : 'Noche',
      });
    } catch (fetchError) {
      console.error(fetchError);
      setError('No se pudo conectar con el servicio meteorologico.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search('Ciudad de Mexico');
  }, []);

  const summary = useMemo(() => {
    if (!weatherData) {
      return 'Consulta el clima actual de cualquier ciudad sin exponer claves privadas.';
    }

    return `${weatherData.description} durante el ${weatherData.dayPeriod.toLowerCase()} en ${weatherData.location}.`;
  }, [weatherData]);

  return (
    <section className="weather-shell">
      <div className="weather-card">
        <div className="weather-hero">
          <div>
            <span className="weather-badge">Seguro para web</span>
            <h1>Weather Pulse</h1>
            <p>{summary}</p>
          </div>
          <div className="weather-search">
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar ciudad"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  search(inputRef.current?.value);
                }
              }}
            />
            <button
              type="button"
              aria-label="Buscar clima"
              onClick={() => search(inputRef.current?.value)}
            >
              <img src={searchIcon} alt="" />
            </button>
          </div>
        </div>

        {error ? <div className="weather-alert">{error}</div> : null}

        <div className="weather-main">
          <div className="weather-overview">
            {loading ? (
              <div className="weather-loading">Actualizando condiciones...</div>
            ) : weatherData ? (
              <>
                <img src={weatherData.icon} alt={weatherData.description} className="weather-icon" />
                <p className="weather-temp">{weatherData.temperature}°C</p>
                <p className="weather-location">{weatherData.location}</p>
                <p className="weather-description">{weatherData.description}</p>
              </>
            ) : (
              <div className="weather-loading">Sin datos climaticos para mostrar.</div>
            )}
          </div>

          <div className="weather-metrics">
            <article className="metric-card">
              <div className="metric-icon-wrap">
                <img src={humidityIcon} alt="Humedad" className="metric-icon" />
              </div>
              <div>
                <span>Humedad</span>
                <strong>{weatherData ? `${weatherData.humidity}%` : '--'}</strong>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon-wrap">
                <img src={windIcon} alt="Viento" className="metric-icon" />
              </div>
              <div>
                <span>Viento</span>
                <strong>{weatherData ? `${weatherData.windSpeed} km/h` : '--'}</strong>
              </div>
            </article>

            <article className="metric-card metric-note">
              <span className="metric-note-label">Publicacion segura</span>
              <strong>Sin API keys expuestas</strong>
              <p>La app consume servicios meteorologicos publicos, por lo que queda apta para GitHub y deploy web sin secretos.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Weather;
