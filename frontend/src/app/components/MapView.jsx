'use client'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import L from 'leaflet'

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
})

const LocationMarker = ({ markerPosition, setMarkerPosition, setLatLng }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setMarkerPosition({ lat, lng })
      setLatLng(lat, lng)
    },
  })

  return markerPosition ? <Marker position={[markerPosition.lat, markerPosition.lng]} /> : null
}

const MapView = ({ center, markerPosition, setMarkerPosition, setLatLng }) => {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom
      style={{ height: '250px', width: '100%' }}
      className="rounded-md border border-gray-300"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <LocationMarker
        markerPosition={markerPosition}
        setMarkerPosition={setMarkerPosition}
        setLatLng={setLatLng}
      />
    </MapContainer>
  )
}

export default MapView