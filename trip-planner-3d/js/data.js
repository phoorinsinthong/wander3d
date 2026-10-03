/**
 * Wander3D - Trip Data & Persistence Management
 * Initial sample trip: Tokyo & Mount Fuji 5D4N Dream Trip
 */

const DEFAULT_SAMPLE_TRIP = {
  id: "trip_tokyo_fuji_2026",
  title: "ทริปตะลุยโตเกียว & ฟูจิซังสุดฟิน 🌸🗻",
  subtitle: "เที่ยว ชิม ช้อป สัมผัสหิมะและซากุระ 5 วัน 4 คืน",
  destination: "Tokyo & Mt. Fuji, Japan",
  startDate: "2026-10-15",
  endDate: "2026-10-19",
  currency: "THB",
  currencies: {
    THB: { symbol: "฿", rate: 1 },
    JPY: { symbol: "¥", rate: 4.25 }, // 1 THB = ~4.25 JPY (or ~0.235 THB/JPY)
    USD: { symbol: "$", rate: 0.028 }
  },
  totalBudget: 140000, // Budget for all 4 people (35,000 THB / person)
  coverImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
  tags: ["ชมธรรมชาติ 🗻", "ของกินอร่อย 🍜", "ช้อปปิ้ง 🛍️", "แอนิเมะ 🎌"],
  
  // Participants with 3D avatars
  participants: [
    {
      id: "u1",
      name: "คุณ (บอส)",
      role: "ผู้จัดทริป 👑",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=BossTraveler&backgroundColor=b6e3f4",
      paid: 45000,
      isOwner: true
    },
    {
      id: "u2",
      name: "น้องเมย์",
      role: "ช่างภาพประจำทริป 📸",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MaySweet&backgroundColor=ffdfbf",
      paid: 30000,
      isOwner: false
    },
    {
      id: "u3",
      name: "ต้าร์ สายกิน",
      role: "นักชิมมือหนึ่ง 🍜",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=TarFoodie&backgroundColor=c0aede",
      paid: 28000,
      isOwner: false
    },
    {
      id: "u4",
      name: "เจน สปีดรัน",
      role: "นักล่าพิกัดลับ 🗺️",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=JaneNavigator&backgroundColor=d1d4f9",
      paid: 25000,
      isOwner: false
    }
  ],

  // Flights & Travel Tickets
  flights: [
    {
      id: "fl_01",
      type: "outbound", // ขาไป
      airline: "Thai Airways (การบินไทย)",
      airlineCode: "TG682",
      airlineLogo: "✈️",
      departureAirport: "BKK",
      departureCity: "กรุงเทพฯ (สุวรรณภูมิ)",
      departureTime: "23:55",
      departureDate: "14 ต.ค. 2026",
      arrivalAirport: "HND",
      arrivalCity: "โตเกียว (ฮาเนดะ)",
      arrivalTime: "08:10 (+1)",
      arrivalDate: "15 ต.ค. 2026",
      duration: "6 ชม. 15 นาที",
      seat: "32A, 32B, 32C, 32D",
      terminal: "Terminal 1",
      gate: "D4",
      baggage: "โหลดกระเป๋า 30 กก. + ถือขึ้นเครื่อง 7 กก.",
      bookingRef: "TG-JP9921X",
      cost: 48000, // For 4 people
      confirmed: true
    },
    {
      id: "fl_02",
      type: "return", // ขากลับ
      airline: "Thai Airways (การบินไทย)",
      airlineCode: "TG683",
      airlineLogo: "✈️",
      departureAirport: "HND",
      departureCity: "โตเกียว (ฮาเนดะ)",
      departureTime: "10:35",
      departureDate: "19 ต.ค. 2026",
      arrivalAirport: "BKK",
      arrivalCity: "กรุงเทพฯ (สุวรรณภูมิ)",
      arrivalTime: "15:05",
      arrivalDate: "19 ต.ค. 2026",
      duration: "6 ชม. 30 นาที",
      seat: "28A, 28B, 28C, 28D",
      terminal: "Terminal 3",
      gate: "112",
      baggage: "โหลดกระเป๋า 30 กก. + ถือขึ้นเครื่อง 7 กก.",
      bookingRef: "TG-JP9921X",
      cost: 48000,
      confirmed: true
    }
  ],

  // Transport Passes
  transports: [
    {
      id: "tr_01",
      name: "ตั๋วรถไฟ JR Tokyo Wide Pass 3 วัน",
      type: "train",
      icon: "🚄",
      validity: "15 - 17 ต.ค. 2026",
      details: "ใช้เดินทางในโตเกียว และนั่งรถไฟด่วนไปฟูจิคาวากุจิโกะ",
      cost: 12000, // 3,000 x 4 people
      status: "จองแล้ว (รับตั๋วที่สนามบิน)"
    },
    {
      id: "tr_02",
      name: "บัตร Suica Card (เติมเงิน)",
      type: "metro",
      icon: "💳",
      validity: "ใช้ตลอดทั้งทริป",
      details: "สำหรับแตะขึ้นรถไฟใต้ดิน รถเมล์ และซื้อของใน FamilyMart",
      cost: 4000, // 1,000 x 4 people
      status: "พร้อมใช้งาน"
    }
  ],

  // Accommodations
  accommodations: [
    {
      id: "acc_01",
      name: "Shinjuku Granbell Hotel Tokyo",
      nameJp: "新宿グランベルホテル",
      nights: 2,
      checkInDate: "15 ต.ค. 2026",
      checkInTime: "15:00 น.",
      checkOutDate: "17 ต.ค. 2026",
      checkOutTime: "11:00 น.",
      roomType: "Superior Quadruple Room (2 เตียงใหญ่)",
      address: "2-14-5 Kabukicho, Shinjuku-ku, Tokyo",
      lat: 35.6961,
      lng: 139.7042,
      priceTotal: 22000,
      pricePerNight: 11000,
      amenities: ["📶 Wifi ฟรี", "☕ กาแฟ & ชา", "🛁 อ่างอาบน้ำ", "🏙️ วิวเมืองชินจูกุ", "🛍️ ใกล้แหล่งช้อป"],
      bookingRef: "BK-SHINJUKU-882",
      phone: "+81 3-5155-2666",
      notes: "ฝากกระเป๋าก่อนเวลาเช็คอินได้ที่ล็อบบี้ชั้น 1",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "acc_02",
      name: "Fuji Lake Hotel (ออนเซ็นวิวภูเขาไฟฟูจิ)",
      nameJp: "富士レークホテル",
      nights: 2,
      checkInDate: "17 ต.ค. 2026",
      checkInTime: "15:00 น.",
      checkOutDate: "19 ต.ค. 2026",
      checkOutTime: "10:00 น.",
      roomType: "Japanese-Western Tatami Room พร้อมออนเซ็นส่วนตัว",
      address: "1 Funatsu, Fujikawaguchiko, Minamitsuru District, Yamanashi",
      lat: 35.5036,
      lng: 138.7618,
      priceTotal: 26000,
      pricePerNight: 13000,
      amenities: ["♨️ บ่อออนเซ็นวิวฟูจิ", "🍱 บุฟเฟต์อาหารเช้า-เย็น", "🗻 วิวทะเลสาบ", "🚌 รถรับส่งสถานี"],
      bookingRef: "RYOKAN-FUJI-301",
      phone: "+81 555-72-2209",
      notes: "มีเสิร์ฟอาหารค่ำแบบไคเซกิรอบ 18:30 น. ต้องเช็คอินก่อนเวลา",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80"
    }
  ],

  // Day-by-Day Detailed Itinerary
  days: [
    {
      dayNumber: 1,
      date: "15 ต.ค. 2026",
      title: "วันแรก: แตะโตเกียว & ตะลุยชิบูย่าแลนด์มาร์ก 🗼",
      weather: "☀️ 19°C แดดสดใส",
      highlight: "ชมวิวชิบูย่าสกายยามเย็น",
      activities: [
        {
          id: "act_101",
          time: "08:15",
          endTime: "09:30",
          title: "ถึงสนามบินฮาเนดะ & รับตั๋วรถไฟ",
          category: "transport",
          desc: "ผ่าน ตม. รับกระเป๋า และไปที่เคาน์เตอร์ JR East Service Center เพื่อเปิดใช้ JR Tokyo Wide Pass",
          cost: 0,
          locationName: "Haneda Airport Terminal 3",
          lat: 35.5494,
          lng: 139.7798,
          completed: true,
          notes: "อย่าลืมแวะกดซิมการ์ด / รับ Pocket Wi-Fi ที่เคาน์เตอร์",
          transportToNext: "🚆 Tokyo Monorail & Yamanote Line (35 นาที)"
        },
        {
          id: "act_102",
          time: "10:15",
          endTime: "11:00",
          title: "ฝากกระเป๋าที่ Shinjuku Granbell Hotel",
          category: "stay",
          desc: "เดินทางถึงโรงแรมชินจูกุ ฝากสัมภาระและหยิบกระเป๋าใบเล็กเตรียมตะลุยเที่ยว",
          cost: 0,
          locationName: "Shinjuku Granbell Hotel",
          lat: 35.6961,
          lng: 139.7042,
          completed: false,
          notes: "ได้การ์ดฝากกระเป๋ามา เก็บในกระเป๋าเงินดีๆ",
          transportToNext: "🚶 เดิน 5 นาทีไปย่านอาหารคาบุกิโจ"
        },
        {
          id: "act_103",
          time: "11:30",
          endTime: "13:00",
          title: "มื้อเที่ยง: ราเมงข้อสอบ Ichiran Shinjuku 🍜",
          category: "food",
          desc: "เติมพลังชามแรกในญี่ปุ่นด้วยราเมงซุปกระดูกหมูเข้มข้น เลือกระดับความเผ็ดและเส้นได้ตามใจชอบ",
          cost: 2400, // 600 x 4
          locationName: "Ichiran Ramen Shinjuku Chuo-Higashiguchi",
          lat: 35.6908,
          lng: 139.7031,
          completed: false,
          notes: "แนะนำเพิ่มไข่ต้มยางมะตูมและหมูชาชูพิเศษ",
          transportToNext: "🚆 นั่ง JR Yamanote Line ไป Shibuya (7 นาที)"
        },
        {
          id: "act_104",
          time: "14:00",
          endTime: "16:30",
          title: "แวะทักทายน้องฮาจิโกะ & ช้อปปิ้ง Shibuya Crossing",
          category: "shopping",
          desc: "ถ่ายรูปกับรูปปั้นฮาจิโกะ ข้ามห้าแยกชิบูย่าสุดคึกคัก และแวะ Nintendo Tokyo / Pokemon Center ที่ห้าง Shibuya PARCO",
          cost: 5000,
          locationName: "Shibuya Scramble Crossing",
          lat: 35.6595,
          lng: 139.7005,
          completed: false,
          notes: "แฟนโปเกมอนเตรียมเสียตังค์ที่ PARCO ชั้น 6",
          transportToNext: "🚶 เดิน 3 นาทีไปตึก Shibuya Scramble Square"
        },
        {
          id: "act_105",
          time: "17:00",
          endTime: "19:00",
          title: "ชมวิวพระอาทิตย์ตกที่ Shibuya SKY 🌇",
          category: "attraction",
          desc: "จุดชมวิวชั้นดาดฟ้า 360 องศาที่ฮิตที่สุดในโตเกียว มองเห็นวิวเมืองและไฟยามค่ำคืนสุดอลังการ",
          cost: 3200, // 800 x 4
          locationName: "Shibuya Sky Observation Deck",
          lat: 35.6585,
          lng: 139.7022,
          completed: false,
          notes: "ต้องจองรอบเวลาล่วงหน้า ห้ามพกขาตั้งกล้องขึ้นดาดฟ้า",
          transportToNext: "🚆 นั่งรถไฟกลับที่พัก Shinjuku"
        },
        {
          id: "act_106",
          time: "19:45",
          endTime: "21:30",
          title: "มื้อดึก: ข้าวหน้าเนื้อ & ยากิโทริ ตรอก Omoide Yokocho",
          category: "food",
          desc: "สัมผัสบรรยากาศอิซากายะสไตล์เรโทรแบบญี่ปุ่นแท้ๆ ย่างหอมกรุ่น บรรยากาศอบอุ่น",
          cost: 3600,
          locationName: "Omoide Yokocho (Memory Lane)",
          lat: 35.6932,
          lng: 139.6997,
          completed: false,
          notes: "ลองไก่ย่างเนงิมะกับเบียร์สดเย็นๆ",
          transportToNext: "🚶 เดินกลับโรงแรมพักผ่อน"
        }
      ]
    },
    {
      dayNumber: 2,
      date: "16 ต.ค. 2026",
      title: "วันที่สอง: วัฒนธรรมอาซากุสะ & ตะลุยโลกเวทมนตร์ ⛩️🪄",
      weather: "⛅ 21°C อากาศเย็นสบาย",
      highlight: "สวมชุดกิโมโนเดินวัดเซนโซจิ & Warner Bros. Studio Tour",
      activities: [
        {
          id: "act_201",
          time: "08:30",
          endTime: "11:00",
          title: "ไหว้พระวัดเซนโซจิ (วัดโคมแดง) & ถนนนากามิเสะ",
          category: "attraction",
          desc: "ถ่ายรูปกับโคมแดงยักษ์คามินาริมง เสี่ยงเซียมซี และชิมซาลาเปาทอดกับขนมเซมเบ้ร้อนๆ",
          cost: 1500,
          locationName: "Senso-ji Temple, Asakusa",
          lat: 35.7148,
          lng: 139.7967,
          completed: false,
          notes: "มาเช้าๆ คนยังไม่แน่น ถ่ายรูปสวย",
          transportToNext: "🚶 เดิน 15 นาที หรือรถไฟ 1 สถานี"
        },
        {
          id: "act_202",
          time: "11:30",
          endTime: "13:00",
          title: "มื้อเที่ยง: ข้าวหน้าปลาไหล Unatoto Asakusa 🍱",
          category: "food",
          desc: "ปลาไหลย่างเตาถ่านซอสหวานหอมกรุ่น ราคาน่ารัก คิวยาวแต่คุ้มค่ามาก",
          cost: 3000,
          locationName: "Nadai Unatoto Asakusa",
          lat: 35.7118,
          lng: 139.7972,
          completed: false,
          notes: "สั่งไซส์ Double Unadon เพิ่มความฟิน",
          transportToNext: "🚆 นั่งรถไฟ Seibu Ikebukuro Line สู่ Toshimaen (40 นาที)"
        },
        {
          id: "act_203",
          time: "14:00",
          endTime: "18:00",
          title: "Warner Bros. Studio Tour Tokyo (The Making of Harry Potter) 🧙",
          category: "attraction",
          desc: "สัมผัสเบื้องหลังภาพยนตร์แฮร์รี่ พอตเตอร์ ห้องโถงใหญ่ ชานชาลา 9 3/4 และจิบบัตเตอร์เบียร์",
          cost: 7200, // 1,800 x 4
          locationName: "Warner Bros. Studio Tour Tokyo",
          lat: 35.7428,
          lng: 139.6465,
          completed: false,
          notes: "ต้องจองตั๋วตรงเวลารอบเข้าชม 14:00 น.",
          transportToNext: "🚆 รถไฟกลับ Ginza (35 นาที)"
        },
        {
          id: "act_204",
          time: "19:00",
          endTime: "21:30",
          title: "ช้อปปิ้งแบรนด์ดัง & ทานชาบู A5 ย่านกินซ่า",
          category: "food",
          desc: "เดินเล่นกินซ่า ซื้อขนมของฝากที่ Ginza Six และทานชาบูเนื้อวากิวระดับพรีเมียม",
          cost: 6500,
          locationName: "Ginza Six, Chuo City",
          lat: 35.6696,
          lng: 139.7640,
          completed: false,
          notes: "จองโต๊ะร้านชาบูไว้แล้วรอบ 19:30 น.",
          transportToNext: "🚆 นั่ง Marunouchi Line กลับ Shinjuku"
        }
      ]
    },
    {
      dayNumber: 3,
      date: "17 ต.ค. 2026",
      title: "วันที่สาม: เดินทางสู่ทะเลสาบคาวากุจิโกะ & วิวฟูจิซัง 🗻🚂",
      weather: "☀️ 16°C ฟ้าโปร่ง เห็นฟูจิชัดเจน",
      highlight: "นั่งรถไฟด่วน Fuji Excursion & เช็คอินเรียวกังออนเซ็น",
      activities: [
        {
          id: "act_301",
          time: "08:00",
          endTime: "10:00",
          title: "เช็คเอาท์ Shinjuku & ขึ้นรถไฟด่วน Fuji Excursion",
          category: "transport",
          desc: "นั่งรถไฟด่วนสายตรงจาก Shinjuku Station ยิงตรงสู่ Kawaguchiko Station (ใช้ Tokyo Wide Pass)",
          cost: 0,
          locationName: "Shinjuku Station (JR Platform 9/10)",
          lat: 35.6896,
          lng: 139.7006,
          completed: false,
          notes: "ตั๋วระบุที่นั่งเรียบร้อย เตรียมข้าวกล่อง Ekiben ขึ้นไปทานบนรถไฟ",
          transportToNext: "🚆 รถไฟด่วน 1 ชม. 55 นาที"
        },
        {
          id: "act_302",
          time: "10:15",
          endTime: "11:30",
          title: "ถึงสถานี Kawaguchiko & เช็คอิน Fuji Lake Hotel",
          category: "stay",
          desc: "เดิน 10 นาทีถึงโรงแรม ฝากสัมภาระและจองรอบรับประทานอาหารค่ำไคเซกิ",
          cost: 0,
          locationName: "Fuji Lake Hotel, Kawaguchiko",
          lat: 35.5036,
          lng: 138.7618,
          completed: false,
          notes: "โรงแรมอยู่ริมทะเลสาบ มองเห็นวิวภูเขาไฟฟูจิเต็มตา",
          transportToNext: "🚌 นั่ง Retro Bus สายสีแดงไปกระเช้าลอยฟ้า"
        },
        {
          id: "act_303",
          time: "12:00",
          endTime: "14:00",
          title: "มื้อเที่ยง: อุด้งเส้นโฮโต Houtou Fudou หม้อไฟร้อนๆ 🍲",
          category: "food",
          desc: "เมนูขึ้นชื่อประจำจังหวัดยามานาชิ อุด้งเส้นแบนหนานุ่มต้มในน้ำซุปมิโสะและฟักทองหวานฉ่ำ",
          cost: 2200,
          locationName: "Houtou Fudou Kawaguchiko Station",
          lat: 35.5015,
          lng: 138.7692,
          completed: false,
          notes: "หม้อไฟใหญ่มาก สั่งมาแชร์กันได้",
          transportToNext: "🚶 เดิน 10 นาทีไปกระเช้าลอยฟ้า"
        },
        {
          id: "act_304",
          time: "14:30",
          endTime: "17:00",
          title: "ขึ้นกระเช้าลอยฟ้า Mt. Fuji Panoramic Ropeway & ชิงช้าลอยฟ้า",
          category: "attraction",
          desc: "นั่งกระเช้าชมวิวทะเลสาบคาวากุจิโกะและยอดฟูจิซัง พร้อมถ่ายรูปบนชิงช้าลอยฟ้ายอดฮิต",
          cost: 2000,
          locationName: "Mt. Fuji Panoramic Ropeway",
          lat: 35.5048,
          lng: 138.7725,
          completed: false,
          notes: "มีดังโงะกระต่ายย่างซอสถั่วหวานอร่อยมาก",
          transportToNext: "🚶 เดินกลับมาโรงแรมริมทะเลสาบ"
        },
        {
          id: "act_305",
          time: "18:00",
          endTime: "21:00",
          title: "แช่ออนเซ็นกลางแจ้งวิวฟูจิ & ดินเนอร์ไคเซกิสุดหรู 🍱♨️",
          category: "relaxation",
          desc: "ผ่อนคลายกล้ามเนื้อในน้ำแร่ธรรมชาติ และเพลิดเพลินกับมื้อค่ำไคเซกิเซ็ทเนื้อวากิวและปลาท้องถิ่น",
          cost: 0, // Included in hotel package
          locationName: "Fuji Lake Hotel Onsen & Dining",
          lat: 35.5036,
          lng: 138.7618,
          completed: false,
          notes: "นัดรวมตัวห้องอาหารชั้น 2 เวลา 18:30 น.",
          transportToNext: "🛌 พักผ่อนสบายๆ"
        }
      ]
    },
    {
      dayNumber: 4,
      date: "18 ต.ค. 2026",
      title: "วันที่สี่: เจดีย์แดงชูเรโตะ & หมู่บ้านน้ำใสโอชิโนะฮักไก 📸🗻",
      weather: "☀️ 17°C อากาศแจ่มใส",
      highlight: "ภาพมุมมหาชนฟูจิกับเจดีย์แดง 5 ชั้น & กินสตอเบอร์รี่สด",
      activities: [
        {
          id: "act_401",
          time: "07:30",
          endTime: "10:30",
          title: "ปีนบันได 398 ขั้นสู่เจดีย์ชูเรโตะ (Chureito Pagoda)",
          category: "attraction",
          desc: "จุดชมวิวในฝันที่รวมแลนด์มาร์กเจดีย์แดงห้าชั้นกับภูเขาไฟฟูจิไว้ในเฟรมเดียว",
          cost: 0,
          locationName: "Chureito Pagoda, Arakurayama Sengen Park",
          lat: 35.5013,
          lng: 138.8014,
          completed: false,
          notes: "ใส่รองเท้าผ้าใบที่เดินสบาย พกน้ำดื่มไปด้วย",
          transportToNext: "🚆 นั่งรถไฟ Fujikyu Railway ไปสถานี Mt. Fuji แล้วต่อบัส"
        },
        {
          id: "act_402",
          time: "11:30",
          endTime: "14:00",
          title: "หมู่บ้านน้ำใส Oshino Hakkai & ชิมเต้าหู้น้ำแร่ธรรมชาติ 💦",
          category: "attraction",
          desc: "เดินชมบ่อน้ำผุดใสแจ๋ว 8 บ่อที่เกิดจากหิมะละลายจากภูเขาไฟฟูจิ ชิมขนมโมจิย่างและปลาเทราต์ย่างเกลือ",
          cost: 2600,
          locationName: "Oshino Hakkai Springs",
          lat: 35.4597,
          lng: 138.8329,
          completed: false,
          notes: "น้ำในบ่อเย็นมาก มีจุดให้กรอกน้ำแร่ดื่มฟรี",
          transportToNext: "🚌 บัสกลับสถานี Kawaguchiko"
        },
        {
          id: "act_403",
          time: "15:00",
          endTime: "17:30",
          title: "ปั่นจักรยานริมทะเลสาบคาวากุจิโกะ & ชิลคาเฟ่ชมวิว",
          category: "relaxation",
          desc: "เช่าจักรยานไฟฟ้าปั่นเลียบทะเลสาบ ลมพัดเย็นสบาย แวะถ่ายรูปมุมสวน Oishi Park",
          cost: 1600,
          locationName: "Oishi Park, Kawaguchiko",
          lat: 35.5229,
          lng: 138.7454,
          completed: false,
          notes: "ไอศกรีมลาเวนเดอร์และชีสเค้กฟูจิอร่อยเด็ด",
          transportToNext: "🚶 กลับโรงแรม"
        },
        {
          id: "act_404",
          time: "18:30",
          endTime: "21:00",
          title: "ดินเนอร์ปิ้งย่างเนื้อยากินิคุสไตล์ญี่ปุ่น 🥩🔥",
          category: "food",
          desc: "ฉลองค่ำคืนสุดท้ายที่ฟูจิด้วยเนื้อลายหินอ่อนย่างบนเตาถ่านร้อนๆ หอมนุ่มละลายในปาก",
          cost: 4800,
          locationName: "Yakiniku Sanroku, Kawaguchiko",
          lat: 35.4988,
          lng: 138.7634,
          completed: false,
          notes: "แนะนำเนื้อส่วน Rib eye และลิ้นวัวพิเศษ",
          transportToNext: "🛌 กลับไปแช่ออนเซ็นรอบดึกและแพ็คกระเป๋า"
        }
      ]
    },
    {
      dayNumber: 5,
      date: "19 ต.ค. 2026",
      title: "วันที่ห้า: เดินทางกลับโตเกียว & บินปลอดภัยสู่กรุงเทพฯ ✈️",
      weather: "⛅ 20°C",
      highlight: "แวะช้อปปิ้งของฝากสนามบินฮาเนดะก่อนขึ้นเครื่อง",
      activities: [
        {
          id: "act_501",
          time: "06:30",
          endTime: "07:30",
          title: "เช็คเอาท์ & นั่ง Airport Limousine Bus สู่สนามบิน",
          category: "transport",
          desc: "ขึ้นรถบัสตรงจากสถานี Kawaguchiko มุ่งหน้าสู่ Tokyo Haneda Airport อย่างสะดวกสบาย",
          cost: 4800, // 1,200 x 4
          locationName: "Kawaguchiko Station Bus Terminal",
          lat: 35.4981,
          lng: 138.7687,
          completed: false,
          notes: "จองที่นั่งรถบัสไว้ล่วงหน้าเรียบร้อย ออกตรงเวลา 06:45 น.",
          transportToNext: "🚌 รถบัสสายตรง (2 ชม. 15 นาที)"
        },
        {
          id: "act_502",
          time: "09:00",
          endTime: "10:35",
          title: "เช็คอินเคาน์เตอร์ TG & ช้อปของฝาก Tax Free 🛍️",
          category: "shopping",
          desc: "โหลดกระเป๋า ผ่านจุดตรวจ และช้อปขนม Tokyo Banana, Royce Nama Chocolate, Shiroi Koibito",
          cost: 6000,
          locationName: "Haneda Airport Terminal 3 Duty Free",
          lat: 35.5494,
          lng: 139.7798,
          completed: false,
          notes: "เผื่อเวลาเดินไป Gate 112 ปิดประตู 10:15 น.",
          transportToNext: "✈️ เที่ยวบิน TG683 (6 ชม. 30 นาที)"
        },
        {
          id: "act_503",
          time: "15:05",
          endTime: "16:00",
          title: "เดินทางถึงกรุงเทพฯ (สุวรรณภูมิ) โดยสวัสดิภาพ 🇹🇭",
          category: "transport",
          desc: "รับกระเป๋าสัมภาระ แยกย้ายกลับบ้านพร้อมความประทับใจและความสุขเต็มกระเป๋า!",
          cost: 0,
          locationName: "Suvarnabhumi Airport (BKK)",
          lat: 13.6900,
          lng: 100.7501,
          completed: false,
          notes: "แชร์รูปและสรุปค่าใช้จ่ายในแอป Wander3D ให้เพื่อนๆ",
          transportToNext: "🏠 ถึงบ้านโดยปลอดภัย"
        }
      ]
    }
  ]
};

// Storage Key
const STORAGE_KEY = "wander3d_trip_data";

// Helper functions for LocalStorage and State
const TripDataStore = {
  getTrip: function() {
    try {
      // Check if URL has a shared trip payload
      const urlParams = new URLSearchParams(window.location.search);
      const sharedData = urlParams.get("share");
      if (sharedData) {
        try {
          const decoded = decodeURIComponent(escape(atob(sharedData)));
          const parsed = JSON.parse(decoded);
          if (parsed && parsed.title) {
            console.log("Loaded trip from shared URL payload!");
            return parsed;
          }
        } catch (e) {
          console.warn("Could not decode share param:", e);
        }
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SAMPLE_TRIP));
  },

  saveTrip: function(tripData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tripData));
      return true;
    } catch (e) {
      console.error("Error saving trip data:", e);
      return false;
    }
  },

  resetToDefault: function() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return JSON.parse(JSON.stringify(DEFAULT_SAMPLE_TRIP));
    } catch (e) {
      return DEFAULT_SAMPLE_TRIP;
    }
  },

  generateShareableLink: function(tripData, permission = "view") {
    try {
      // Clean and compress trip representation
      const jsonStr = JSON.stringify(tripData);
      const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?share=${encoded}&mode=${permission}`;
    } catch (e) {
      console.error("Failed to generate share link:", e);
      return window.location.href;
    }
  }
};
