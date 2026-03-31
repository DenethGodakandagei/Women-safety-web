const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let loadPromise = null;

export const loadGoogleMaps = () => {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // If it's already on the window, check if it's fully initialized
    if (window.google?.maps?.Map) {
      resolve(window.google.maps);
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);

    // Global callback for Google Maps
    window.initGoogleMaps = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps loaded but google.maps is undefined'));
      }
      delete window.initGoogleMaps;
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=geometry,places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.onerror = (err) => {
        loadPromise = null;
        reject(new Error('Failed to load Google Maps script'));
      };
      document.head.appendChild(script);
    } else {
      // If script exists but Map is not yet ready, we wait for the callback or poll
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.Map) {
          clearInterval(checkInterval);
          resolve(window.google.maps);
        }
      }, 100);
      
      // Safety timeout
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.google?.maps?.Map) {
          reject(new Error('Google Maps load timeout'));
        }
      }, 10000);
    }
  });

  return loadPromise;
};
