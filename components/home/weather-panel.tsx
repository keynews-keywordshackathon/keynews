"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CloudSun, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchWeather } from "@/actions/composio";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_LOCATION = "Chicago";

export interface WeatherForecast {
  day: string;
  temp: string;
  note: string;
}

export interface WeatherPanelData {
  title: string;
  location: string;
  summary: string;
  forecast: WeatherForecast[];
  relevance?: string;
  actionReason?: string;
  action?: {
    label: string;
    cta: string;
    href: string;
  };
}

interface WeatherPanelProps {
  /** Initial/fallback data to display while loading */
  initialData?: WeatherPanelData;
  /** Override location (if not provided, fetched from user profile, defaults to Chicago) */
  location?: string;
}

// Default fallback data
const defaultWeatherData: WeatherPanelData = {
  title: "Weather",
  location: DEFAULT_LOCATION,
  summary: "Loading weather data...",
  forecast: [
    { day: "Today", temp: "—", note: "Loading..." },
    { day: "Tomorrow", temp: "—", note: "Loading..." },
    { day: "Later", temp: "—", note: "Loading..." },
  ],
  relevance: "Weather conditions for your location.",
  actionReason: "Plan your day based on current conditions.",
  action: {
    label: "View detailed forecast",
    cta: "See more",
    href: "https://openweathermap.org/",
  },
};

/**
 * Parse OpenWeatherMap One Call API 3.0 response into our WeatherPanelData format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseWeatherResponse(data: any, location: string): WeatherPanelData {
  console.log('[Weather] Parsing response:', JSON.stringify(data, null, 2));

  if (!data) {
    return { ...defaultWeatherData, location };
  }

  // Get location name from our combined response format
  const locationName = data.location?.name || location;
  const locationState = data.location?.state ? `, ${data.location.state}` : '';
  const fullLocationName = `${locationName}${locationState}`;

  // Handle One Call API 3.0 format (current + daily array)
  if (data.current && data.daily) {
    const current = data.current;
    const currentTemp = Math.round(current.temp || 0);
    const currentFeelsLike = Math.round(current.feels_like || 0);
    const currentDesc = current.weather?.[0]?.description || "Clear";
    const humidity = current.humidity || 0;

    // Get daily forecasts (up to 3 days)
    const dailyForecasts: WeatherForecast[] = data.daily.slice(0, 3).map((day: {
      dt: number;
      temp: { day: number };
      weather: Array<{ description: string }>;
    }) => {
      const date = new Date(day.dt * 1000);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const temp = Math.round(day.temp?.day || 0);
      const desc = day.weather?.[0]?.description || "";

      return {
        day: dayName,
        temp: `${temp}°F`,
        note: desc.charAt(0).toUpperCase() + desc.slice(1),
      };
    });

    return {
      title: "Weather",
      location: fullLocationName,
      summary: `Currently ${currentTemp}°F, feels like ${currentFeelsLike}°F. ${currentDesc.charAt(0).toUpperCase() + currentDesc.slice(1)} with ${humidity}% humidity.`,
      forecast: dailyForecasts.length > 0 ? dailyForecasts : [
        { day: "Now", temp: `${currentTemp}°F`, note: currentDesc },
      ],
      relevance: "Weather forecast for your location.",
      actionReason: "Plan your week based on upcoming conditions.",
      action: {
        label: "View detailed forecast",
        cta: "See more",
        href: "https://openweathermap.org/",
      },
    };
  }

  // Fallback: handle 5-day forecast format (list of 3-hour intervals)
  const forecastData = data.forecast || data;
  const forecastList = forecastData?.list || forecastData?.data?.list;

  if (forecastList && Array.isArray(forecastList) && forecastList.length > 0) {
    const current = forecastList[0];
    const currentTemp = Math.round(current.main?.temp || 0);
    const currentFeelsLike = Math.round(current.main?.feels_like || 0);
    const currentDesc = current.weather?.[0]?.description || "Clear";
    const humidity = current.main?.humidity || 0;

    const dailyForecasts: WeatherForecast[] = [];
    const seenDays = new Set<string>();

    for (const item of forecastList) {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString("en-US", { weekday: "short" });

      if (!seenDays.has(dayKey)) {
        const temp = Math.round(item.main?.temp || 0);
        const desc = item.weather?.[0]?.description || "";
        dailyForecasts.push({
          day: dayKey,
          temp: `${temp}°F`,
          note: desc.charAt(0).toUpperCase() + desc.slice(1),
        });
        seenDays.add(dayKey);
      }

      if (dailyForecasts.length >= 3) break;
    }

    return {
      title: "Weather",
      location: fullLocationName,
      summary: `Currently ${currentTemp}°F, feels like ${currentFeelsLike}°F. ${currentDesc.charAt(0).toUpperCase() + currentDesc.slice(1)} with ${humidity}% humidity.`,
      forecast: dailyForecasts,
      relevance: "Weather forecast for your location.",
      actionReason: "Plan your week based on upcoming conditions.",
      action: {
        label: "View detailed forecast",
        cta: "See more",
        href: "https://openweathermap.org/",
      },
    };
  }

  // If we can't parse the response, return a friendly message
  console.warn('[Weather] Could not parse response format:', data);
  return {
    ...defaultWeatherData,
    location: fullLocationName,
    summary: "Weather data format not recognized. Click refresh to try again.",
  };
}

export function WeatherPanel({
  initialData,
  location: locationOverride,
}: WeatherPanelProps) {
  const [weatherData, setWeatherData] = useState<WeatherPanelData>(
    initialData || defaultWeatherData
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<string>(locationOverride || DEFAULT_LOCATION);
  const [locationLoaded, setLocationLoaded] = useState<boolean>(false);

  // Fetch user's location from Supabase on mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        const location = locationOverride || DEFAULT_LOCATION;
        setUserLocation(location);
        // Update displayed location immediately
        setWeatherData(prev => ({ ...prev, location }));
        setLocationLoaded(true);
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("location")
        .eq("user_id", userData.user.id)
        .single();

      const location = profile?.location || locationOverride || DEFAULT_LOCATION;
      setUserLocation(location);
      // Update displayed location immediately
      setWeatherData(prev => ({ ...prev, location }));
      setLocationLoaded(true);
    };

    if (!locationOverride) {
      fetchUserLocation();
    } else {
      // If locationOverride is provided, update displayed location
      setWeatherData(prev => ({ ...prev, location: locationOverride }));
      setLocationLoaded(true);
    }
  }, [locationOverride]);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchWeather(userLocation);

      if (result.success && result.data) {
        const parsed = parseWeatherResponse(result.data, userLocation);
        setWeatherData(parsed);
      } else {
        setError(result.error || "Failed to fetch weather");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch weather when location is loaded
  useEffect(() => {
    if (locationLoaded && userLocation) {
      fetchWeatherData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationLoaded, userLocation]);

  return (
    <section id="weather" className="newspaper-border p-4">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
              <CloudSun className="size-4 text-muted-foreground" />
              {weatherData.title}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchWeatherData}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              {isLoading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <RefreshCw className="size-3" />
              )}
            </Button>
          </div>
          <h3 className="headline-secondary mt-2 text-2xl text-foreground">
            {weatherData.location}
          </h3>
          {error ? (
            <p className="article-body mt-2 text-red-600">{error}</p>
          ) : (
            <p className="article-body mt-2">{weatherData.summary}</p>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-0">
            {weatherData.forecast.map((item, index) => (
              <div
                key={`${item.day}-${index}`}
                className="flex items-center justify-between border-b border-border py-3 text-sm last:border-0"
              >
                <div>
                  <p className="font-semibold">{item.day}</p>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
                <p className="font-semibold text-foreground">{item.temp}</p>
              </div>
            ))}
          </div>
        )}

        {weatherData.action && (
          <div className="relative group/action inline-block">
            <Link
              href={weatherData.action.href}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              <Sparkles className="size-4" />
              {weatherData.action.label}
            </Link>

            {/* Hover Card */}
            {weatherData.relevance && weatherData.actionReason && (
              <div className="absolute left-0 top-full mt-2 w-72 opacity-0 invisible group-hover/action:opacity-100 group-hover/action:visible transition-all duration-200 z-50">
                <div className="rounded-xl border border-border bg-white p-4 shadow-lg">
                  {/* Arrow pointer */}
                  <div className="absolute left-4 top-0 -translate-y-full">
                    <div className="border-8 border-transparent border-b-white" />
                  </div>
                  <div className="absolute left-4 top-0 -translate-y-full">
                    <div
                      className="border-8 border-transparent border-b-border"
                      style={{ marginTop: "-1px" }}
                    />
                  </div>
                  <div className="space-y-3 text-sm text-zinc-700">
                    <div>
                      <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500">
                        Why it matters
                      </p>
                      <p className="mt-1">{weatherData.relevance}</p>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500">
                        Why act now
                      </p>
                      <p className="mt-1">{weatherData.actionReason}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
