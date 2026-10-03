/**
 * Wander3D - Interactive 3D Cartoon Map Module (Leaflet.js)
 * Visualizes trip itinerary with 3D cartoon styled pins, travel routes, and interactive popups.
 */

class WanderMap {
  constructor(containerId = "tripMap") {
    this.containerId = containerId;
    this.map = null;
    this.markers = [];
    this.routePolylines = [];
    this.dayColors = [
      "#38BDF8", // Day 1 Sky Blue
      "#34D399", // Day 2 Emerald Mint
      "#A78BFA", // Day 3 Purple Lavender
      "#FB7185", // Day 4 Coral Rose
      "#FBBF24"  // Day 5 Sunflower Yellow
    ];
    this.categoryIcons = {
      transport: { emoji: "✈️", bg: "#0284C7", border: "#38BDF8" },
      stay: { emoji: "🏨", bg: "#7C3AED", border: "#C084FC" },
      food: { emoji: "🍜", bg: "#EA580C", border: "#FB923C" },
      attraction: { emoji: "🗼", bg: "#E11D48", border: "#FB7185" },
      shopping: { emoji: "🛍️", bg: "#059669", border: "#34D399" },
      relaxation: { emoji: "♨️", bg: "#D97706", border: "#FCD34D" }
    };
  }

  init(initialCoords = [35.65, 139.30], zoomLevel = 10) {
    if (this.map) {
      this.map.remove();
    }

    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Create Leaflet map instance
    this.map = L.map(this.containerId, {
      center: initialCoords,
      zoom: zoomLevel,
      zoomControl: false,
      attributionControl: false
    });

    // Add Zoom Control at bottom right with custom style
    L.control.zoom({ position: "bottomright" }).addTo(this.map);

    // CartoDB Voyager tiles (Crisp, colorful, cartoonish look)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd"
    }).addTo(this.map);

    // Attribution
    L.control.attribution({ position: "bottomleft", prefix: false })
      .addAttribution('&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>')
      .addTo(this.map);

    // Invalidate map size after animation/render
    setTimeout(() => {
      this.map.invalidateSize();
    }, 300);
  }

  create3DMarkerIcon(category, number, isHotel = false) {
    const config = this.categoryIcons[category] || { emoji: "📍", bg: "#3B82F6", border: "#93C5FD" };
    const emoji = isHotel ? "🏨" : config.emoji;
    const bg = isHotel ? "#7C3AED" : config.bg;
    const border = isHotel ? "#C084FC" : config.border;

    const html = `
      <div class="marker-3d-wrapper" style="--pin-bg: ${bg}; --pin-border: ${border};">
        <div class="marker-3d-pin">
          <span class="marker-3d-emoji">${emoji}</span>
          ${number ? `<span class="marker-3d-badge">${number}</span>` : ""}
        </div>
        <div class="marker-3d-shadow"></div>
      </div>
    `;

    return L.divIcon({
      html: html,
      className: "custom-leaflet-marker",
      iconSize: [44, 52],
      iconAnchor: [22, 50],
      popupAnchor: [0, -48]
    });
  }

  renderTripRoutesAndMarkers(tripData, activeDayNumber = null) {
    if (!this.map) return;

    this.clearMap();

    const allLatLngs = [];
    const daysToRender = activeDayNumber 
      ? tripData.days.filter(d => d.dayNumber === activeDayNumber)
      : tripData.days;

    // Render Hotel markers first
    if (tripData.accommodations) {
      tripData.accommodations.forEach(acc => {
        if (acc.lat && acc.lng) {
          const hotelIcon = this.create3DMarkerIcon("stay", "🏨", true);
          const marker = L.marker([acc.lat, acc.lng], { icon: hotelIcon }).addTo(this.map);
          
          marker.bindPopup(this.createPopupContent({
            title: acc.name,
            subTitle: acc.nameJp || "ที่พักสำหรับทริปนี้",
            category: "stay",
            time: `เช็คอิน: ${acc.checkInTime} / เช็คเอาท์: ${acc.checkOutTime}`,
            cost: acc.priceTotal,
            notes: acc.notes,
            address: acc.address,
            image: acc.image,
            lat: acc.lat,
            lng: acc.lng
          }));

          this.markers.push(marker);
          allLatLngs.push([acc.lat, acc.lng]);
        }
      });
    }

    // Render Itinerary Activities & Polylines per day
    daysToRender.forEach((day) => {
      const dayColor = this.dayColors[(day.dayNumber - 1) % this.dayColors.length];
      const dayCoords = [];

      day.activities.forEach((act, actIndex) => {
        // Skip Bangkok airport on Tokyo-centric view unless specifically Day 5
        if (act.lat && act.lng && act.lat > 20) { // filter out BKK (lat ~13) to keep map focused on Japan
          dayCoords.push([act.lat, act.lng]);
          allLatLngs.push([act.lat, act.lng]);

          const icon = this.create3DMarkerIcon(act.category, `${day.dayNumber}.${actIndex + 1}`);
          const marker = L.marker([act.lat, act.lng], { icon: icon }).addTo(this.map);

          marker.bindPopup(this.createPopupContent({
            title: act.title,
            subTitle: `วันที่ ${day.dayNumber}: ${day.title.split(":")[1] || day.title}`,
            category: act.category,
            time: `${act.time} - ${act.endTime}`,
            cost: act.cost,
            notes: act.desc,
            locationName: act.locationName,
            lat: act.lat,
            lng: act.lng
          }));

          marker.activityId = act.id;
          this.markers.push(marker);
        }
      });

      // Draw dashed route curve line for this day
      if (dayCoords.length >= 2) {
        // Outer glow path
        const polyGlow = L.polyline(dayCoords, {
          color: dayColor,
          weight: 7,
          opacity: 0.35,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(this.map);

        // Core dashed route path
        const polyline = L.polyline(dayCoords, {
          color: dayColor,
          weight: 4,
          opacity: 0.95,
          dashArray: "8, 8",
          lineCap: "round",
          lineJoin: "round"
        }).addTo(this.map);

        this.routePolylines.push(polyGlow, polyline);
      }
    });

    // Fit map bounds to encompass all visible markers
    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13, animate: true });
    }
  }

  createPopupContent(data) {
    const categoryLabels = {
      transport: "เดินทาง / ตั๋ว",
      stay: "ที่พัก / โรงแรม",
      food: "ร้านอาหาร / คาเฟ่",
      attraction: "สถานที่ท่องเที่ยว",
      shopping: "ช้อปปิ้ง / ของฝาก",
      relaxation: "พักผ่อน / ออนเซ็น"
    };

    return `
      <div class="popup-3d-card">
        <div class="popup-3d-header">
          <span class="popup-category-badge category-${data.category}">
            ${categoryLabels[data.category] || "กิจกรรม"}
          </span>
          <span class="popup-time">⏰ ${data.time || ""}</span>
        </div>
        ${data.image ? `<img src="${data.image}" alt="${data.title}" class="popup-image" />` : ""}
        <h4 class="popup-title">${data.title}</h4>
        ${data.subTitle ? `<p class="popup-subtitle">${data.subTitle}</p>` : ""}
        ${data.notes ? `<p class="popup-notes">${data.notes}</p>` : ""}
        <div class="popup-footer">
          <span class="popup-cost">💰 ฿${Number(data.cost || 0).toLocaleString()}</span>
          <a href="https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}" target="_blank" class="popup-gmap-link">
            <span>🗺️ นำทาง</span>
          </a>
        </div>
      </div>
    `;
  }

  focusSpot(lat, lng, zoom = 14, activityId = null) {
    if (!this.map || !lat || !lng) return;

    this.map.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.2
    });

    // Find and open popup
    if (activityId) {
      const targetMarker = this.markers.find(m => m.activityId === activityId);
      if (targetMarker) {
        setTimeout(() => {
          targetMarker.openPopup();
        }, 1000);
      }
    }
  }

  clearMap() {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    this.routePolylines.forEach(p => this.map.removeLayer(p));
    this.routePolylines = [];
  }

  resize() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 200);
    }
  }
}

// Global Map Instance
window.tripMapInstance = new WanderMap("tripMap");
