'use server'

// ============================================================================
// Weather Data (Hardcoded for Urbana, IL)
// TODO: Replace with real API calls once OpenWeatherMap API is set up
// ============================================================================

/**
 * Fetch weather - currently returns hardcoded Urbana, IL data
 * @param location The location string (ignored, always returns Urbana data)
 * @returns Weather data for Urbana, IL
 */
export async function fetchWeather(location: string) {
    console.log('[Weather] Fetching weather for location:', location)
    console.log('[Weather] NOTE: Returning hardcoded Urbana, IL weather data')

    // Hardcoded weather data for Urbana, IL
    const now = Math.floor(Date.now() / 1000)
    
    return {
        success: true,
        data: {
            location: {
                name: "Urbana",
                state: "Illinois",
                country: "US",
                lat: 40.1106,
                lon: -88.2073
            },
            current: {
                temp: 32,
                feels_like: 26,
                humidity: 71,
                weather: [{ description: "light snow" }]
            },
            daily: [
                { dt: now, temp: { day: 32 }, weather: [{ description: "light snow" }] },
                { dt: now + 86400, temp: { day: 28 }, weather: [{ description: "snow" }] },
                { dt: now + 172800, temp: { day: 35 }, weather: [{ description: "partly cloudy" }] }
            ]
        },
        location: "Urbana"
    }
}
