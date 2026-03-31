import React, { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

const LiveMapWidget = ({ userLocation }) => {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      if (!userLocation || !mapRef.current) return;
      
      const mapsApi = await loadGoogleMaps();
      const pos = { lat: userLocation.lat, lng: userLocation.lng };

      if (!mapObj.current) {
        mapObj.current = new mapsApi.Map(mapRef.current, {
          center: pos,
          zoom: 15,
          disableDefaultUI: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#212121' }] },
            { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
            { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
          ]
        });

        markerRef.current = new mapsApi.Marker({
          position: pos,
          map: mapObj.current,
          icon: {
            path: mapsApi.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#ff3b30',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          }
        });

        circleRef.current = new mapsApi.Circle({
          map: mapObj.current,
          center: pos,
          radius: 100,
          fillColor: '#ff3b30',
          fillOpacity: 0.1,
          strokeColor: '#ff3b30',
          strokeOpacity: 0.2,
          strokeWeight: 1,
        });
      } else {
        mapObj.current.panTo(pos);
        markerRef.current.setPosition(pos);
        circleRef.current.setCenter(pos);
      }
    };

    init();
  }, [userLocation]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        background: '#1c1c1e',
        borderRadius: 'inherit'
      }} 
    />
  );
};

export default LiveMapWidget;
