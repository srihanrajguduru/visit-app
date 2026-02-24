"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { Area } from "@/types/database";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const center = { lat: 17.385, lng: 78.4867 }; // Hyderabad
const defaultZoom = 11;

interface MobileMapProps {
    areas: Area[];
    selectedArea: Area | null;
    onMarkerClick: (area: Area) => void;
    onMapClick?: (lat: number, lng: number) => void;
    clickedCoord?: { lat: number, lng: number } | null;
    initialCenter?: { lat: number, lng: number };
    initialZoom?: number;
}

// Dark map style matching the desktop version
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#e2e8f0" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#475569" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
];

function getScoreColor(score: number) {
    if (score >= 90) return "#22c55e"; // Green
    if (score >= 70) return "#84cc16"; // Light Green
    if (score >= 50) return "#eab308"; // Yellow
    return "#ef4444"; // Red
}

export default function MobileMap({
    areas,
    selectedArea,
    onMarkerClick,
    onMapClick,
    clickedCoord,
    initialCenter,
    initialZoom
}: MobileMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
    });

    const mapRef = useRef<google.maps.Map | null>(null);

    // Provide strictly memoized initial state for controlled component. 
    // This stops React from aggressively re-syncing the `center` prop and flashing the map!
    const [mapCenter] = useState(initialCenter || center);
    const [mapZoom] = useState(initialZoom || defaultZoom);

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;

        // Register map wide tapping listener
        map.addListener("click", (event: any) => {
            if (event.latLng && onMapClick) {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                onMapClick(lat, lng);
            }
        });
    }, [onMapClick]);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    // Sync selected area via Imperative API natively, enabling smooth flight without breaking layout 
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        if (selectedArea) {
            map.panTo({ lat: selectedArea.latitude, lng: selectedArea.longitude });
            map.setZoom(15);
        } else if (clickedCoord) {
            map.panTo(clickedCoord);
            map.setZoom(15);
        } else if (!selectedArea && !clickedCoord) {
            map.panTo(center);
            map.setZoom(defaultZoom);
        }
    }, [selectedArea, clickedCoord]);

    if (!isLoaded) {
        return <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center">Loading Map...</div>;
    }

    return (
        <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter}
            zoom={mapZoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                styles: darkMapStyle,
                disableDefaultUI: true, // Native feel
                zoomControl: false, // Hide zoom arrows for mobile
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: false,
                gestureHandling: "greedy", // Smooth single finger panning
            }}
        >
            {areas.map((area) => {
                const isSelected = selectedArea?.id === area.id;
                const score = area.current_visit_score ?? 0;
                const color = getScoreColor(score);

                return (
                    <MarkerF
                        key={area.id}
                        position={{ lat: area.latitude, lng: area.longitude }}
                        onClick={() => onMarkerClick(area)}
                        icon={{
                            path: "M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z", // Maps pin
                            fillColor: color,
                            fillOpacity: isSelected ? 1 : 0.8,
                            strokeColor: isSelected ? "#ffffff" : "#0f172a",
                            strokeWeight: isSelected ? 2 : 1,
                            scale: isSelected ? 0.8 : 0.6,
                        }}
                    />
                );
            })}

            {/* Tap indicator marker for custom intelligence clicks */}
            {clickedCoord && (
                <MarkerF
                    position={clickedCoord}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: "#6366f1",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                        scale: 8
                    }}
                />
            )}
        </GoogleMap>
    );
}
