import { useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdb';

export default function WatchProviders({ mediaId, mediaType = 'movie' }) {
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');

  useEffect(() => {
    fetchProviders();
  }, [mediaId, mediaType]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = mediaType === 'movie' 
        ? await tmdbService.getMovieWatchProviders(mediaId)
        : await tmdbService.getTVShowWatchProviders(mediaId);
      
      setProviders(data.results);
    } catch (err) {
      console.error('Error fetching watch providers:', err);
      setError(true);
      setProviders(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl p-5 border border-stone-700 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12z"/>
          </svg>
          Where to Watch
        </h3>
        <div className="animate-pulse">
          <div className="h-3 bg-stone-700 rounded w-20 mb-3"></div>
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-stone-700 rounded-lg"></div>
            <div className="w-12 h-12 bg-stone-700 rounded-lg"></div>
            <div className="w-12 h-12 bg-stone-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!providers || Object.keys(providers).length === 0) {
    return null;
  }

  // Get available countries
  const availableCountries = Object.keys(providers).sort();
  
  // If US is not available, default to first available country
  const defaultCountry = availableCountries.includes('US') ? 'US' : availableCountries[0];
  const currentCountry = availableCountries.includes(selectedCountry) ? selectedCountry : defaultCountry;
  const countryData = providers[currentCountry];

  if (!countryData) {
    return null;
  }

  const { flatrate, buy, rent, link } = countryData;

  // Filter out duplicate providers (e.g., "Netflix" and "Netflix Standard With Ads")
  const getUniqueProviders = (providers) => {
    if (!providers) return [];
    const seen = new Set();
    return providers.filter(provider => {
      const baseName = provider.provider_name.split(' ')[0]; // Get first word (e.g., "Netflix")
      if (seen.has(baseName)) {
        return false;
      }
      seen.add(baseName);
      return true;
    });
  };

  const uniqueFlatrate = getUniqueProviders(flatrate);
  const uniqueBuy = getUniqueProviders(buy);
  const uniqueRent = getUniqueProviders(rent);

  // Get provider website URL based on provider name
  const getProviderUrl = (providerName) => {
    const name = providerName.toLowerCase();
    const urlMap = {
      'netflix': 'https://www.netflix.com',
      'amazon': 'https://www.amazon.com/gp/video',
      'prime video': 'https://www.amazon.com/gp/video',
      'disney plus': 'https://www.disneyplus.com',
      'disney+': 'https://www.disneyplus.com',
      'hulu': 'https://www.hulu.com',
      'hbo max': 'https://www.max.com',
      'max': 'https://www.max.com',
      'apple tv': 'https://tv.apple.com',
      'apple tv plus': 'https://tv.apple.com',
      'peacock': 'https://www.peacocktv.com',
      'paramount+': 'https://www.paramountplus.com',
      'paramount plus': 'https://www.paramountplus.com',
      'showtime': 'https://www.showtime.com',
      'starz': 'https://www.starz.com',
      'espn': 'https://www.espn.com',
      'crunchyroll': 'https://www.crunchyroll.com',
      'funimation': 'https://www.funimation.com',
      'youtube': 'https://www.youtube.com',
      'google play': 'https://play.google.com/store/movies',
      'vudu': 'https://www.vudu.com',
      'fandango': 'https://www.fandangonow.com',
      'microsoft': 'https://www.microsoft.com/en-us/store/movies-and-tv',
      'amc': 'https://www.amcplus.com',
      'criterion': 'https://www.criterionchannel.com',
      'mubi': 'https://mubi.com',
      'tubi': 'https://tubitv.com',
      'pluto': 'https://pluto.tv',
      'discovery+': 'https://www.discoveryplus.com',
      'discovery plus': 'https://www.discoveryplus.com',
    };
    
    // Check if provider name contains any of the mapped keys
    for (const [key, url] of Object.entries(urlMap)) {
      if (name.includes(key)) {
        return url;
      }
    }
    
    // If no match, return the JustWatch link as fallback
    return link || '#';
  };

  const countryNames = {
    'US': '🇺🇸 United States',
    'GB': '🇬🇧 United Kingdom',
    'CA': '🇨🇦 Canada',
    'AU': '🇦🇺 Australia',
    'DE': '🇩🇪 Germany',
    'FR': '🇫🇷 France',
    'ES': '🇪🇸 Spain',
    'IT': '🇮🇹 Italy',
    'JP': '🇯🇵 Japan',
    'KR': '🇰🇷 South Korea',
    'BR': '🇧🇷 Brazil',
    'MX': '🇲🇽 Mexico',
    'IN': '🇮🇳 India',
  };

  return (
    <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl p-5 border border-stone-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12z"/>
          </svg>
          Where to Watch
        </h3>
        
        {/* Country Selector */}
        {availableCountries.length > 1 && (
          <select
            value={currentCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-stone-700 text-white text-xs px-2 py-1 rounded border border-stone-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {availableCountries.map(country => (
              <option key={country} value={country}>
                {countryNames[country] || country}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-4">
        {/* Stream */}
        {uniqueFlatrate && uniqueFlatrate.length > 0 && (
          <div>
            <h4 className="text-yellow-400 font-semibold text-sm mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Stream
            </h4>
            <div className="flex flex-wrap gap-2">
              {uniqueFlatrate.map((provider) => (
                <a
                  key={provider.provider_id}
                  href={getProviderUrl(provider.provider_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative cursor-pointer"
                  title={provider.provider_name}
                >
                  <img
                    src={tmdbService.getImageUrl(provider.logo_path, 'w92')}
                    alt={provider.provider_name}
                    className="w-12 h-12 rounded-lg shadow-md hover:scale-110 transition-transform duration-200 border-2 border-transparent hover:border-yellow-400"
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {provider.provider_name}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Buy */}
        {uniqueBuy && uniqueBuy.length > 0 && (
          <div>
            <h4 className="text-green-400 font-semibold text-sm mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              Buy
            </h4>
            <div className="flex flex-wrap gap-2">
              {uniqueBuy.map((provider) => (
                <a
                  key={provider.provider_id}
                  href={getProviderUrl(provider.provider_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative cursor-pointer"
                  title={provider.provider_name}
                >
                  <img
                    src={tmdbService.getImageUrl(provider.logo_path, 'w92')}
                    alt={provider.provider_name}
                    className="w-12 h-12 rounded-lg shadow-md hover:scale-110 transition-transform duration-200 border-2 border-transparent hover:border-green-400"
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {provider.provider_name}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Rent */}
        {uniqueRent && uniqueRent.length > 0 && (
          <div>
            <h4 className="text-blue-400 font-semibold text-sm mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
              </svg>
              Rent
            </h4>
            <div className="flex flex-wrap gap-2">
              {uniqueRent.map((provider) => (
                <a
                  key={provider.provider_id}
                  href={getProviderUrl(provider.provider_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative cursor-pointer"
                  title={provider.provider_name}
                >
                  <img
                    src={tmdbService.getImageUrl(provider.logo_path, 'w92')}
                    alt={provider.provider_name}
                    className="w-12 h-12 rounded-lg shadow-md hover:scale-110 transition-transform duration-200 border-2 border-transparent hover:border-blue-400"
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {provider.provider_name}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* JustWatch Link */}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-gray-400 hover:text-yellow-400 text-xs mt-4 transition-colors"
        >
          <span>View all options on JustWatch</span>
          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}

      {/* Powered by JustWatch */}
      <div className="mt-3 pt-3 border-t border-stone-700">
        <p className="text-gray-500 text-xs flex items-center">
          <span>Data provided by</span>
          <span className="ml-1 font-semibold">JustWatch</span>
        </p>
      </div>
    </div>
  );
}
