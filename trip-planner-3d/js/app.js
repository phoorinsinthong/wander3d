/**
 * Wander3D - Main Application Controller
 * Handles reactivity, tabs, modals, budget computations, timeline events, and trip sharing.
 */

class WanderApp {
  constructor() {
    this.trip = TripDataStore.getTrip();
    this.activeTab = "itinerary"; // 'itinerary' | 'transport' | 'stays' | 'budget'
    this.activeDay = null;        // null = All Days, or 1, 2, 3...
    this.currentCurrency = "THB";
    this.budgetChart = null;
    this.editingActivity = null;
  }

  init() {
    this.bindEvents();
    this.renderAll();

    // Initialize map after DOM ready
    setTimeout(() => {
      window.tripMapInstance.init();
      window.tripMapInstance.renderTripRoutesAndMarkers(this.trip, this.activeDay);
    }, 150);
  }

  bindEvents() {
    // Tab switching
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Currency Switcher
    const currencySelect = document.getElementById("currencySelector");
    if (currencySelect) {
      currencySelect.addEventListener("change", (e) => {
        this.currentCurrency = e.target.value;
        this.renderAll();
        this.showToast(`เปลี่ยนสกุลเงินเป็น ${this.currentCurrency} เรียบร้อย 💱`);
      });
    }

    // Modal Close buttons
    document.querySelectorAll(".modal-close-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.closeAllModals();
      });
    });

    // Close modal on background click
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.closeAllModals();
        }
      });
    });

    // Activity Form Submit
    const actForm = document.getElementById("activityForm");
    if (actForm) {
      actForm.addEventListener("submit", (e) => this.handleSaveActivity(e));
    }

    // Flight Form Submit
    const flForm = document.getElementById("flightForm");
    if (flForm) {
      flForm.addEventListener("submit", (e) => this.handleSaveFlight(e));
    }

    // Hotel Form Submit
    const htForm = document.getElementById("hotelForm");
    if (htForm) {
      htForm.addEventListener("submit", (e) => this.handleSaveHotel(e));
    }

    // Share Modal Copy Button
    const copyShareBtn = document.getElementById("copyShareLinkBtn");
    if (copyShareBtn) {
      copyShareBtn.addEventListener("click", () => this.handleCopyShareLink());
    }

    // Reset Trip to default sample
    const resetBtn = document.getElementById("resetTripBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("ต้องการรีเซ็ตข้อมูลทริปกลับเป็นทริปตัวอย่าง (Tokyo & Fuji) ใช่หรือไม่?")) {
          this.trip = TripDataStore.resetToDefault();
          this.renderAll();
          window.tripMapInstance.renderTripRoutesAndMarkers(this.trip, this.activeDay);
          this.showToast("รีเซ็ตข้อมูลทริปเรียบร้อย ✨");
        }
      });
    }
  }

  formatMoney(amountInTHB) {
    const val = Number(amountInTHB) || 0;
    const curr = this.trip.currencies[this.currentCurrency] || { symbol: "฿", rate: 1 };
    const converted = val * curr.rate;

    if (this.currentCurrency === "JPY") {
      return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
  }

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      if (btn.dataset.tab === tab) {
        btn.classList.add("btn-3d-primary");
        btn.classList.remove("btn-3d-clay");
      } else {
        btn.classList.remove("btn-3d-primary");
        btn.classList.add("btn-3d-clay");
      }
    });

    // Show/hide sections
    document.querySelectorAll(".tab-content-panel").forEach(panel => {
      panel.classList.toggle("hidden", panel.id !== `tab-${tab}`);
    });

    if (tab === "budget") {
      this.renderBudgetChart();
    }

    window.tripMapInstance.resize();
  }

  renderAll() {
    this.renderHeader();
    this.renderItinerary();
    this.renderFlightsAndTransports();
    this.renderAccommodations();
    this.renderBudget();
  }

  // ==========================================
  // Header & Hero Rendering
  // ==========================================
  renderHeader() {
    document.getElementById("tripTitleDisplay").textContent = this.trip.title;
    document.getElementById("tripSubtitleDisplay").textContent = this.trip.subtitle;
    document.getElementById("tripDatesDisplay").textContent = `${this.trip.startDate} - ${this.trip.endDate} (5 วัน 4 คืน)`;
    document.getElementById("tripDestinationTag").textContent = `📍 ${this.trip.destination}`;

    // Tags
    const tagsContainer = document.getElementById("tripTagsContainer");
    if (tagsContainer) {
      tagsContainer.innerHTML = this.trip.tags.map(t => `
        <span class="badge-sticker-3d bg-amber-100 text-amber-800 text-xs">${t}</span>
      `).join("");
    }

    // Travelers stack
    const travelersStack = document.getElementById("travelersStack");
    if (travelersStack) {
      travelersStack.innerHTML = this.trip.participants.map(p => `
        <img src="${p.avatar}" alt="${p.name}" title="${p.name} (${p.role})" 
             class="w-10 h-10 rounded-full border-2 border-white shadow-sm inline-block -ml-2 first:ml-0 bg-white" />
      `).join("") + `
        <button onclick="app.openShareModal()" class="w-10 h-10 rounded-full bg-sky-100 border-2 border-dashed border-sky-400 text-sky-600 font-bold text-lg inline-flex items-center justify-center -ml-2 hover:bg-sky-200 transition" title="ชวนเพื่อนเพิ่ม">
          +
        </button>
      `;
    }

    // Quick stats
    const totalCost = this.calculateTotalCost();
    const costPerPerson = Math.round(totalCost / (this.trip.participants.length || 1));
    
    document.getElementById("headerTotalBudget").textContent = this.formatMoney(this.trip.totalBudget);
    document.getElementById("headerTotalCost").textContent = this.formatMoney(totalCost);
    document.getElementById("headerCostPerPerson").textContent = this.formatMoney(costPerPerson);
  }

  // ==========================================
  // Itinerary (Timeline) Rendering
  // ==========================================
  renderItinerary() {
    const dayPillsContainer = document.getElementById("dayFilterPills");
    if (dayPillsContainer) {
      let pillsHtml = `
        <button onclick="app.filterDay(null)" 
                class="btn-3d ${this.activeDay === null ? 'btn-3d-primary' : 'btn-3d-clay'} text-xs md:text-sm py-2 px-4">
          🌟 ทริปทั้งหมด (5 วัน)
        </button>
      `;

      this.trip.days.forEach(d => {
        const isSelected = this.activeDay === d.dayNumber;
        pillsHtml += `
          <button onclick="app.filterDay(${d.dayNumber})" 
                  class="btn-3d ${isSelected ? 'btn-3d-primary' : 'btn-3d-clay'} text-xs md:text-sm py-2 px-4 whitespace-nowrap">
            วันที่ ${d.dayNumber} <span class="opacity-80 text-xs">(${d.date.split(" ")[0]} ต.ค.)</span>
          </button>
        `;
      });

      pillsHtml += `
        <button onclick="app.addNewDay()" class="btn-3d btn-3d-clay text-xs md:text-sm py-2 px-3 text-sky-600 font-bold" title="เพิ่มวันใหม่">
          + เพิ่มวัน
        </button>
      `;

      dayPillsContainer.innerHTML = pillsHtml;
    }

    // Render Timeline List
    const timelineListContainer = document.getElementById("itineraryTimelineList");
    if (!timelineListContainer) return;

    const daysToDisplay = this.activeDay 
      ? this.trip.days.filter(d => d.dayNumber === this.activeDay)
      : this.trip.days;

    let html = "";

    daysToDisplay.forEach(day => {
      html += `
        <div class="mb-10 day-group-block">
          <!-- Day Header -->
          <div class="flex items-center justify-between bg-gradient-to-r from-sky-50 via-indigo-50 to-pink-50 p-4 md:p-5 rounded-2xl border-2 border-sky-100 shadow-sm mb-6">
            <div>
              <div class="flex items-center gap-2">
                <span class="bg-sky-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Day ${day.dayNumber}
                </span>
                <span class="text-xs font-semibold text-slate-500">📅 ${day.date}</span>
                <span class="badge-sticker-3d bg-white text-slate-700 text-xs py-0.5">${day.weather}</span>
              </div>
              <h3 class="text-lg md:text-xl font-extrabold text-slate-800 mt-1">${day.title}</h3>
              <p class="text-xs md:text-sm text-slate-600 font-medium">✨ ไฮไลต์: ${day.highlight || "เที่ยวสนุก พักผ่อนเต็มที่"}</p>
            </div>
            <button onclick="app.openAddActivityModal(${day.dayNumber})" class="btn-3d btn-3d-mint text-xs py-2 px-3">
              + กิจกรรม
            </button>
          </div>

          <!-- Activity Items -->
          <div class="relative pl-2 md:pl-4">
      `;

      if (day.activities.length === 0) {
        html += `
          <div class="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <span class="text-4xl">🏖️</span>
            <p class="text-sm font-semibold text-slate-500 mt-2">ยังไม่มีกิจกรรมในวันนี้</p>
            <button onclick="app.openAddActivityModal(${day.dayNumber})" class="btn-3d btn-3d-primary text-xs mt-3">
              + เพิ่มกิจกรรมแรกของวัน
            </button>
          </div>
        `;
      } else {
        day.activities.forEach((act, idx) => {
          const catConfig = window.tripMapInstance.categoryIcons[act.category] || { emoji: "📍", bg: "#3B82F6" };
          const isDone = act.completed;

          html += `
            <div class="relative flex items-start gap-3 md:gap-4 mb-5 group">
              <!-- Step Badge -->
              <div class="timeline-step-badge bg-white ${isDone ? 'opacity-50' : ''}" style="border-color: ${catConfig.bg}; color: ${catConfig.bg};">
                <span class="text-lg">${catConfig.emoji}</span>
                <span class="text-[11px] font-bold">${act.time}</span>
              </div>

              <!-- Activity Card -->
              <div class="card-3d flex-1 p-4 md:p-5 ${isDone ? 'bg-slate-50 opacity-75' : 'bg-white'}">
                <div class="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-bold px-2 py-0.5 rounded-md" style="background-color: ${catConfig.bg}15; color: ${catConfig.bg};">
                        ${this.getCategoryLabel(act.category)}
                      </span>
                      <span class="text-xs font-semibold text-slate-400">
                        ⏰ ${act.time} - ${act.endTime}
                      </span>
                      ${act.cost > 0 ? `
                        <span class="badge-sticker-3d bg-emerald-50 text-emerald-700 text-xs py-0.5">
                          💰 ${this.formatMoney(act.cost)}
                        </span>
                      ` : `
                        <span class="badge-sticker-3d bg-slate-100 text-slate-600 text-xs py-0.5">
                          ฟรี
                        </span>
                      `}
                    </div>
                    <h4 class="text-base md:text-lg font-bold text-slate-800 mt-1.5 ${isDone ? 'line-through text-slate-400' : ''}">
                      ${act.title}
                    </h4>
                  </div>

                  <!-- Quick Actions -->
                  <div class="flex items-center gap-1.5">
                    ${act.lat && act.lng ? `
                      <button onclick="window.tripMapInstance.focusSpot(${act.lat}, ${act.lng}, 15, '${act.id}')" 
                              class="btn-3d btn-3d-clay btn-3d-icon w-8 h-8 text-sky-600" title="ดูพิกัดบนแผนที่ 3D">
                        📍
                      </button>
                    ` : ""}
                    <button onclick="app.toggleActivityDone('${day.dayNumber}', '${act.id}')" 
                            class="btn-3d ${isDone ? 'btn-3d-mint' : 'btn-3d-clay'} btn-3d-icon w-8 h-8" title="ทำเครื่องหมายว่าไปแล้ว">
                      ✓
                    </button>
                    <button onclick="app.deleteActivity('${day.dayNumber}', '${act.id}')" 
                            class="btn-3d btn-3d-clay btn-3d-icon w-8 h-8 text-rose-500 hover:text-rose-700" title="ลบกิจกรรม">
                      🗑️
                    </button>
                  </div>
                </div>

                <p class="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                  ${act.desc}
                </p>

                <!-- Location & Notes -->
                <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                  <span class="flex items-center gap-1 font-medium text-slate-700">
                    🏢 ${act.locationName || "ไม่ระบุสถานที่"}
                  </span>
                  ${act.notes ? `
                    <span class="bg-amber-50 text-amber-800 px-2 py-1 rounded-md text-[11px] font-medium">
                      💡 ${act.notes}
                    </span>
                  ` : ""}
                </div>
              </div>
            </div>

            <!-- Transit to next activity chip -->
            ${act.transportToNext ? `
              <div class="transit-chip">
                <span>➡️</span>
                <span>${act.transportToNext}</span>
              </div>
            ` : ""}
          `;
        });
      }

      html += `
          </div>
        </div>
      `;
    });

    timelineListContainer.innerHTML = html;
  }

  getCategoryLabel(category) {
    const labels = {
      transport: "การเดินทาง / ตั๋ว",
      stay: "เช็คอิน / ที่พัก",
      food: "ร้านอาหาร / คาเฟ่",
      attraction: "สถานที่ท่องเที่ยว",
      shopping: "ช้อปปิ้ง",
      relaxation: "ผ่อนคลาย / ออนเซ็น"
    };
    return labels[category] || "กิจกรรม";
  }

  filterDay(dayNumber) {
    this.activeDay = dayNumber;
    this.renderItinerary();
    window.tripMapInstance.renderTripRoutesAndMarkers(this.trip, this.activeDay);
  }

  addNewDay() {
    const nextDayNum = this.trip.days.length + 1;
    const newDay = {
      dayNumber: nextDayNum,
      date: `วันที่ ${nextDayNum} ของทริป`,
      title: `วันที่ ${nextDayNum}: กิจกรรมเพิ่มเติม 🎉`,
      weather: "☀️ 20°C",
      highlight: "ตามรอยที่เที่ยวใหม่",
      activities: []
    };
    this.trip.days.push(newDay);
    this.save();
    this.filterDay(nextDayNum);
    this.showToast(`เพิ่มวันที่ ${nextDayNum} เรียบร้อย 🗓️`);
  }

  toggleActivityDone(dayNum, actId) {
    const day = this.trip.days.find(d => d.dayNumber === Number(dayNum));
    if (!day) return;
    const act = day.activities.find(a => a.id === actId);
    if (!act) return;

    act.completed = !act.completed;
    this.save();
    this.renderItinerary();
    if (act.completed) {
      this.triggerConfetti();
      this.showToast(`เย้! เช็คอิน "${act.title}" สำเร็จ 🎉`);
    }
  }

  deleteActivity(dayNum, actId) {
    if (!confirm("คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?")) return;
    const day = this.trip.days.find(d => d.dayNumber === Number(dayNum));
    if (!day) return;

    day.activities = day.activities.filter(a => a.id !== actId);
    this.save();
    this.renderAll();
    window.tripMapInstance.renderTripRoutesAndMarkers(this.trip, this.activeDay);
    this.showToast("ลบกิจกรรมเรียบร้อย 🗑️");
  }

  // ==========================================
  // Flights & Transports Rendering
  // ==========================================
  renderFlightsAndTransports() {
    const container = document.getElementById("flightsListContainer");
    if (!container) return;

    let html = "";

    // Outbound & Return Boarding Passes
    this.trip.flights.forEach((fl, idx) => {
      const isOutbound = fl.type === "outbound";

      html += `
        <div class="boarding-pass-card mb-8">
          <div class="boarding-pass-header ${isOutbound ? 'bg-gradient-to-r from-sky-500 to-indigo-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${fl.airlineLogo || '✈️'}</span>
              <div>
                <h4 class="font-extrabold text-white text-base md:text-lg">${fl.airline}</h4>
                <p class="text-xs text-sky-100 font-semibold">${isOutbound ? 'ขาไป (Outbound Flight)' : 'ขากลับ (Return Flight)'} • ${fl.airlineCode}</p>
              </div>
            </div>
            <div class="text-right">
              <span class="badge-sticker-3d bg-emerald-400 text-emerald-950 text-xs">
                ${fl.confirmed ? '✅ ยืนยันแล้ว' : 'รอคอนเฟิร์ม'}
              </span>
              <p class="text-[11px] text-white/80 mt-1 font-mono">Ref: ${fl.bookingRef}</p>
            </div>
          </div>

          <div class="p-6 relative">
            <div class="boarding-pass-notch-left"></div>
            <div class="boarding-pass-notch-right"></div>

            <!-- Route display -->
            <div class="flex items-center justify-between gap-4 py-2">
              <div class="text-left">
                <span class="text-3xl md:text-4xl font-black text-slate-800 font-heading tracking-wide">${fl.departureAirport}</span>
                <p class="text-xs md:text-sm font-semibold text-slate-600">${fl.departureCity}</p>
                <div class="mt-2">
                  <span class="text-lg md:text-xl font-extrabold text-sky-600">${fl.departureTime}</span>
                  <p class="text-[11px] text-slate-400">${fl.departureDate}</p>
                </div>
              </div>

              <!-- Flight middle arrow graphic -->
              <div class="flex-1 flex flex-col items-center px-4">
                <span class="text-xs font-bold text-slate-400 mb-1">⏱️ ${fl.duration}</span>
                <div class="w-full flex items-center">
                  <div class="h-[2px] bg-slate-200 flex-1 border-dashed border-t-2 border-slate-300"></div>
                  <span class="text-xl mx-2 transform rotate-90 md:rotate-0">✈️</span>
                  <div class="h-[2px] bg-slate-200 flex-1 border-dashed border-t-2 border-slate-300"></div>
                </div>
                <span class="text-[11px] text-emerald-600 font-bold mt-1">Direct Flight</span>
              </div>

              <div class="text-right">
                <span class="text-3xl md:text-4xl font-black text-slate-800 font-heading tracking-wide">${fl.arrivalAirport}</span>
                <p class="text-xs md:text-sm font-semibold text-slate-600">${fl.arrivalCity}</p>
                <div class="mt-2">
                  <span class="text-lg md:text-xl font-extrabold text-sky-600">${fl.arrivalTime}</span>
                  <p class="text-[11px] text-slate-400">${fl.arrivalDate}</p>
                </div>
              </div>
            </div>

            <!-- Boarding pass details grid -->
            <div class="boarding-pass-perforated"></div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span class="text-slate-400 block font-semibold text-[10px] uppercase">Terminal / Gate</span>
                <span class="font-extrabold text-slate-700 text-sm">${fl.terminal} / ${fl.gate}</span>
              </div>
              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span class="text-slate-400 block font-semibold text-[10px] uppercase">ที่นั่ง (Seats)</span>
                <span class="font-extrabold text-slate-700 text-sm">${fl.seat}</span>
              </div>
              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span class="text-slate-400 block font-semibold text-[10px] uppercase">สัมภาระ (Baggage)</span>
                <span class="font-extrabold text-slate-700 text-sm">${fl.baggage}</span>
              </div>
              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span class="text-slate-400 block font-semibold text-[10px] uppercase">ราคารวม 4 ท่าน</span>
                <span class="font-extrabold text-emerald-600 text-sm">฿${fl.cost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    // Transport Passes section
    const passContainer = document.getElementById("passesListContainer");
    if (passContainer && this.trip.transports) {
      passContainer.innerHTML = this.trip.transports.map(tr => `
        <div class="card-3d p-5 flex items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-sm">
              ${tr.icon}
            </div>
            <div>
              <h4 class="font-extrabold text-slate-800 text-base">${tr.name}</h4>
              <p class="text-xs text-slate-500 mt-0.5">${tr.details}</p>
              <span class="inline-block mt-1 text-[11px] font-semibold text-slate-400">📅 ${tr.validity}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-sm font-extrabold text-slate-800">${this.formatMoney(tr.cost)}</span>
            <span class="block text-[11px] text-emerald-600 font-bold">${tr.status}</span>
          </div>
        </div>
      `).join("");
    }

    container.innerHTML = html;
  }

  // ==========================================
  // Accommodations (Hotels) Rendering
  // ==========================================
  renderAccommodations() {
    const container = document.getElementById("accommodationsListContainer");
    if (!container) return;

    let html = "";
    this.trip.accommodations.forEach(acc => {
      html += `
        <div class="card-3d overflow-hidden mb-8 grid grid-cols-1 md:grid-cols-12 gap-0">
          <!-- Hotel Image & Badge -->
          <div class="md:col-span-4 relative min-h-[220px]">
            <img src="${acc.image}" alt="${acc.name}" class="w-full h-full object-cover" />
            <div class="absolute top-4 left-4">
              <span class="badge-sticker-3d bg-white/95 text-purple-900 text-xs shadow-md">
                🏨 ${acc.nights} คืน
              </span>
            </div>
          </div>

          <!-- Hotel Details -->
          <div class="md:col-span-8 p-5 md:p-6 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="text-lg md:text-xl font-extrabold text-slate-800">${acc.name}</h3>
                  <p class="text-xs text-slate-400 font-medium">${acc.nameJp} • Ref: ${acc.bookingRef}</p>
                </div>
                <div class="text-right">
                  <span class="text-lg font-black text-purple-600">${this.formatMoney(acc.priceTotal)}</span>
                  <span class="block text-[11px] text-slate-400">เฉลี่ย ${this.formatMoney(acc.pricePerNight)} / คืน</span>
                </div>
              </div>

              <!-- Check-in & Check-out -->
              <div class="grid grid-cols-2 gap-3 my-4 bg-purple-50/60 p-3 rounded-2xl border border-purple-100">
                <div>
                  <span class="text-[10px] font-bold uppercase text-purple-700">Check-in</span>
                  <p class="text-xs font-bold text-slate-800">📅 ${acc.checkInDate}</p>
                  <p class="text-[11px] text-slate-500">เวลา ${acc.checkInTime}</p>
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase text-purple-700">Check-out</span>
                  <p class="text-xs font-bold text-slate-800">📅 ${acc.checkOutDate}</p>
                  <p class="text-[11px] text-slate-500">เวลา ${acc.checkOutTime}</p>
                </div>
              </div>

              <!-- Room type & Address -->
              <div class="text-xs text-slate-600 mb-3 space-y-1">
                <p><strong>🛏️ รูปแบบห้อง:</strong> ${acc.roomType}</p>
                <p><strong>📍 ที่อยู่:</strong> ${acc.address}</p>
                ${acc.notes ? `<p class="bg-amber-50 text-amber-900 p-2 rounded-lg text-[11px]"><strong>💡 บันทึก:</strong> ${acc.notes}</p>` : ""}
              </div>

              <!-- Amenities Pills -->
              <div class="flex flex-wrap gap-1.5 mt-3">
                ${acc.amenities.map(am => `
                  <span class="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
                    ${am}
                  </span>
                `).join("")}
              </div>
            </div>

            <!-- Actions footer -->
            <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-xs text-slate-400">📞 ${acc.phone}</span>
              <button onclick="window.tripMapInstance.focusSpot(${acc.lat}, ${acc.lng}, 16)" 
                      class="btn-3d btn-3d-clay text-xs py-1.5 px-3.5 text-purple-700">
                📍 ปักหมุดบนแผนที่ 3D
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ==========================================
  // Budget & Financial Breakdown Rendering
  // ==========================================
  calculateCategoryTotals() {
    const totals = {
      flight: 0,
      stay: 0,
      transport: 0,
      food: 0,
      attraction: 0,
      shopping: 0,
      other: 0
    };

    // Flights
    this.trip.flights.forEach(f => totals.flight += Number(f.cost || 0));

    // Transports passes
    if (this.trip.transports) {
      this.trip.transports.forEach(t => totals.transport += Number(t.cost || 0));
    }

    // Hotels
    this.trip.accommodations.forEach(h => totals.stay += Number(h.priceTotal || 0));

    // Activities
    this.trip.days.forEach(d => {
      d.activities.forEach(a => {
        const cost = Number(a.cost || 0);
        if (a.category === "food") totals.food += cost;
        else if (a.category === "attraction") totals.attraction += cost;
        else if (a.category === "shopping") totals.shopping += cost;
        else if (a.category === "transport") totals.transport += cost;
        else totals.other += cost;
      });
    });

    return totals;
  }

  calculateTotalCost() {
    const totals = this.calculateCategoryTotals();
    return Object.values(totals).reduce((sum, val) => sum + val, 0);
  }

  renderBudget() {
    const totals = this.calculateCategoryTotals();
    const grandTotal = this.calculateTotalCost();
    const totalBudget = this.trip.totalBudget;
    const remaining = totalBudget - grandTotal;
    const numTravelers = this.trip.participants.length || 1;
    const perPerson = Math.round(grandTotal / numTravelers);

    // Summary Widgets
    document.getElementById("budgetTotalAmount").textContent = this.formatMoney(totalBudget);
    document.getElementById("budgetGrandTotal").textContent = this.formatMoney(grandTotal);
    document.getElementById("budgetRemaining").textContent = this.formatMoney(remaining);
    document.getElementById("budgetPerPerson").textContent = this.formatMoney(perPerson);

    // Budget progress percentage
    const progressPercent = Math.min(100, Math.round((grandTotal / totalBudget) * 100));
    const progressBar = document.getElementById("budgetProgressBar");
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
      progressBar.className = progressPercent > 90 ? "h-full bg-rose-500 rounded-full" : "h-full bg-emerald-500 rounded-full";
    }

    // Category breakdown list
    const breakdownList = document.getElementById("categoryBreakdownList");
    if (breakdownList) {
      const items = [
        { label: "✈️ เที่ยวบิน (Flights)", value: totals.flight, color: "#38BDF8" },
        { label: "🏨 ที่พัก & โรงแรม (Stays)", value: totals.stay, color: "#A78BFA" },
        { label: "🚆 ค่าเดินทาง & พาส (Transit)", value: totals.transport, color: "#34D399" },
        { label: "🍜 อาหาร & คาเฟ่ (Food & Drinks)", value: totals.food, color: "#FB923C" },
        { label: "🎟️ ค่าเข้าชม & กิจกรรม (Tickets)", value: totals.attraction, color: "#FB7185" },
        { label: "🛍️ ช้อปปิ้ง & อื่นๆ (Shopping)", value: totals.shopping + totals.other, color: "#FBBF24" }
      ];

      breakdownList.innerHTML = items.map(item => {
        const pct = grandTotal > 0 ? Math.round((item.value / grandTotal) * 100) : 0;
        return `
          <div class="mb-4">
            <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>${item.label}</span>
              <span>${this.formatMoney(item.value)} (${pct}%)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div class="h-full rounded-full transition-all duration-500" style="width: ${pct}%; background-color: ${item.color};"></div>
            </div>
          </div>
        `;
      }).join("");
    }

    // Split Bill with Friends
    const splitList = document.getElementById("splitFriendsList");
    if (splitList) {
      splitList.innerHTML = this.trip.participants.map(p => {
        const fairShare = perPerson;
        const diff = p.paid - fairShare;
        const diffText = diff >= 0 
          ? `<span class="text-emerald-600 font-bold">+ ได้รับคืน ${this.formatMoney(diff)}</span>`
          : `<span class="text-rose-600 font-bold">- ต้องจ่ายเพิ่ม ${this.formatMoney(Math.abs(diff))}</span>`;

        return `
          <div class="card-3d p-4 flex items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <img src="${p.avatar}" alt="${p.name}" class="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-white" />
              <div>
                <h4 class="font-extrabold text-slate-800 text-sm">${p.name}</h4>
                <p class="text-xs text-slate-500">${p.role}</p>
                <p class="text-[11px] text-slate-400">จ่ายไปแล้ว: ${this.formatMoney(p.paid)}</p>
              </div>
            </div>
            <div class="text-right text-xs">
              <span class="block text-slate-400">ส่วนแบ่ง: ${this.formatMoney(fairShare)}</span>
              ${diffText}
            </div>
          </div>
        `;
      }).join("");
    }
  }

  renderBudgetChart() {
    const canvas = document.getElementById("expenseChartCanvas");
    if (!canvas) return;

    const totals = this.calculateCategoryTotals();
    const dataValues = [
      totals.flight,
      totals.stay,
      totals.transport,
      totals.food,
      totals.attraction,
      totals.shopping + totals.other
    ];

    if (this.budgetChart) {
      this.budgetChart.destroy();
    }

    this.budgetChart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["เที่ยวบิน", "ที่พัก", "เดินทาง", "อาหาร", "เข้าชม", "ช้อปปิ้ง"],
        datasets: [{
          data: dataValues,
          backgroundColor: ["#38BDF8", "#A78BFA", "#34D399", "#FB923C", "#FB7185", "#FBBF24"],
          borderWidth: 4,
          borderColor: "#FFFFFF",
          hoverOffset: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { family: "Prompt", size: 12, weight: "bold" },
              padding: 16
            }
          }
        },
        cutout: "65%"
      }
    });
  }

  // ==========================================
  // Share Modal & Friend Collaboration System
  // ==========================================
  openShareModal() {
    const modal = document.getElementById("shareTripModal");
    if (!modal) return;

    const shareUrl = TripDataStore.generateShareableLink(this.trip, "view");
    document.getElementById("shareLinkInput").value = shareUrl;

    // Generate QR Code
    const qrContainer = document.getElementById("shareQrContainer");
    if (qrContainer) {
      qrContainer.innerHTML = "";
      new QRCode(qrContainer, {
        text: shareUrl,
        width: 160,
        height: 160,
        colorDark: "#0F172A",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    modal.classList.add("active");
  }

  handleCopyShareLink() {
    const input = document.getElementById("shareLinkInput");
    if (!input) return;

    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
      this.triggerConfetti();
      this.showToast("คัดลอกลิงก์แชร์เรียบร้อย! ส่งให้เพื่อนใน Line/Facebook ได้เลย 🚀");
    }).catch(err => {
      // Fallback
      document.execCommand("copy");
      this.showToast("คัดลอกลิงก์แชร์แล้ว! 📋");
    });
  }

  // ==========================================
  // Add / Edit Activity Modal
  // ==========================================
  openAddActivityModal(dayNumber = 1) {
    const modal = document.getElementById("activityModal");
    if (!modal) return;

    document.getElementById("modalDayNumber").value = dayNumber;
    document.getElementById("activityForm").reset();
    document.getElementById("modalDayNumberDisplay").textContent = `วันที่ ${dayNumber}`;

    modal.classList.add("active");
  }

  handleSaveActivity(e) {
    e.preventDefault();
    const dayNum = Number(document.getElementById("modalDayNumber").value);
    const title = document.getElementById("actTitleInput").value;
    const time = document.getElementById("actTimeInput").value;
    const endTime = document.getElementById("actEndTimeInput").value || time;
    const category = document.getElementById("actCategoryInput").value;
    const locationName = document.getElementById("actLocationInput").value;
    const cost = Number(document.getElementById("actCostInput").value) || 0;
    const desc = document.getElementById("actDescInput").value;
    const transportToNext = document.getElementById("actTransitInput").value;

    // Presets coordinates mapping
    const locationCoords = {
      "Tokyo Tower": [35.6586, 139.7454],
      "Shibuya": [35.6595, 139.7005],
      "Shinjuku": [35.6938, 139.7034],
      "Asakusa": [35.7148, 139.7967],
      "Akihabara": [35.6983, 139.7731],
      "Ginza": [35.6719, 139.7640],
      "Harajuku": [35.6702, 139.7027],
      "Fuji": [35.3606, 138.7274],
      "Kawaguchiko": [35.5036, 138.7618],
      "Chureito": [35.5013, 138.8014]
    };

    let lat = 35.6895;
    let lng = 139.6917;

    for (let key in locationCoords) {
      if (locationName.toLowerCase().includes(key.toLowerCase())) {
        lat = locationCoords[key][0];
        lng = locationCoords[key][1];
        break;
      }
    }

    const newActivity = {
      id: "act_" + Date.now(),
      time,
      endTime,
      title,
      category,
      desc,
      cost,
      locationName,
      lat,
      lng,
      completed: false,
      notes: "",
      transportToNext
    };

    const targetDay = this.trip.days.find(d => d.dayNumber === dayNum);
    if (targetDay) {
      targetDay.activities.push(newActivity);
      // Sort activities chronologically by time
      targetDay.activities.sort((a, b) => a.time.localeCompare(b.time));
    }

    this.save();
    this.closeAllModals();
    this.renderAll();
    window.tripMapInstance.renderTripRoutesAndMarkers(this.trip, this.activeDay);
    this.triggerConfetti();
    this.showToast(`บันทึกกิจกรรม "${title}" สำเร็จ! 🎉`);
  }

  // ==========================================
  // Add Flight & Hotel Modals
  // ==========================================
  openAddFlightModal() {
    const modal = document.getElementById("flightModal");
    if (modal) modal.classList.add("active");
  }

  handleSaveFlight(e) {
    e.preventDefault();
    const flight = {
      id: "fl_" + Date.now(),
      type: document.getElementById("flTypeInput").value,
      airline: document.getElementById("flAirlineInput").value,
      airlineCode: document.getElementById("flCodeInput").value,
      airlineLogo: "✈️",
      departureAirport: document.getElementById("flDepAirportInput").value,
      departureCity: document.getElementById("flDepCityInput").value,
      departureTime: document.getElementById("flDepTimeInput").value,
      departureDate: document.getElementById("flDepDateInput").value,
      arrivalAirport: document.getElementById("flArrAirportInput").value,
      arrivalCity: document.getElementById("flArrCityInput").value,
      arrivalTime: document.getElementById("flArrTimeInput").value,
      arrivalDate: document.getElementById("flArrDateInput").value,
      duration: document.getElementById("flDurationInput").value,
      seat: document.getElementById("flSeatInput").value,
      terminal: document.getElementById("flTerminalInput").value,
      gate: document.getElementById("flGateInput").value,
      baggage: document.getElementById("flBaggageInput").value,
      bookingRef: document.getElementById("flRefInput").value,
      cost: Number(document.getElementById("flCostInput").value) || 0,
      confirmed: true
    };

    this.trip.flights.push(flight);
    this.save();
    this.closeAllModals();
    this.renderAll();
    this.showToast("บันทึกตั๋วเครื่องบินเรียบร้อย ✈️");
  }

  openAddHotelModal() {
    const modal = document.getElementById("hotelModal");
    if (modal) modal.classList.add("active");
  }

  handleSaveHotel(e) {
    e.preventDefault();
    const hotel = {
      id: "acc_" + Date.now(),
      name: document.getElementById("htNameInput").value,
      nameJp: document.getElementById("htNameJpInput").value || "",
      nights: Number(document.getElementById("htNightsInput").value) || 1,
      checkInDate: document.getElementById("htCheckInDateInput").value,
      checkInTime: document.getElementById("htCheckInTimeInput").value,
      checkOutDate: document.getElementById("htCheckOutDateInput").value,
      checkOutTime: document.getElementById("htCheckOutTimeInput").value,
      roomType: document.getElementById("htRoomTypeInput").value,
      address: document.getElementById("htAddressInput").value,
      lat: Number(document.getElementById("htLatInput").value) || 35.6895,
      lng: Number(document.getElementById("htLngInput").value) || 139.6917,
      priceTotal: Number(document.getElementById("htPriceTotalInput").value) || 0,
      pricePerNight: Math.round(Number(document.getElementById("htPriceTotalInput").value) / (Number(document.getElementById("htNightsInput").value) || 1)),
      amenities: ["📶 Wifi ฟรี", "☕ กาแฟ & ชา", "🏙️ ใจกลางเมือง"],
      bookingRef: document.getElementById("htRefInput").value || "HTL-" + Date.now().toString().slice(-4),
      phone: "+81 3-0000-0000",
      notes: document.getElementById("htNotesInput").value || "",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
    };

    this.trip.accommodations.push(hotel);
    this.save();
    this.closeAllModals();
    this.renderAll();
    window.tripMapInstance.renderTripRoutesAndMarkers(this.trip, this.activeDay);
    this.showToast("บันทึกข้อมูลที่พักสำเร็จ 🏨");
  }

  closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
  }

  save() {
    TripDataStore.saveTrip(this.trip);
  }

  showToast(message) {
    const toast = document.getElementById("appToast");
    const toastMsg = document.getElementById("toastMessage");
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }

  triggerConfetti() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }
}

// Instantiate App
window.addEventListener("DOMContentLoaded", () => {
  window.app = new WanderApp();
  window.app.init();
});
