// Constants
export const DAILY_CAPACITY = 648;
export const MIN_AVAILABLE_FOR_ORDER = 6;

// Box Sizes Configuration
export const BOX_SIZES = [
  { pieces: 6, price: 25, label: "6 pcs", maxFlavors: 0, regionRestricted: true },
  { pieces: 12, price: 50, label: "12 pcs", maxFlavors: 0, regionRestricted: true },
  { pieces: 24, price: 95, label: "24 pcs", maxFlavors: 6, regionRestricted: false },
  { pieces: 36, price: 135, label: "36 pcs", bestSeller: true, maxFlavors: 9, regionRestricted: false },
];

// Flavors Configuration
export const FLAVORS = [
  { name: "Chewing-gum", nameAr: "علكة", color: "320 75% 75%" },
  { name: "Citron", nameAr: "ليمون", color: "52 90% 70%" },
  { name: "Fraise", nameAr: "فراولة", color: "350 85% 75%" },
  { name: "Pêche", nameAr: "خوخ", color: "25 90% 75%" },
  { name: "Chocolat", nameAr: "شوكولاتة", color: "25 45% 45%" },
  { name: "Orange", nameAr: "برتقال", color: "30 95% 65%" },
  { name: "Framboise", nameAr: "توت العليق", color: "340 85% 70%" },
  { name: "Vanille", nameAr: "فانيليا", color: "45 30% 85%" },
  { name: "Pistache", nameAr: "فستق", color: "100 40% 65%" },
  { name: "Caramel", nameAr: "كراميل", color: "35 60% 60%" },
  { name: "Café", nameAr: "قهوة", color: "30 30% 40%" },
  { name: "Abricot", nameAr: "مشمش", color: "28 80% 70%" },
];

// Cities Configuration with Delivery Info
export const CITIES = [
  // 24h delivery - Major cities from North to Central
  { name: "Tanger", nameAr: "طنجة", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Tétouan", nameAr: "تطوان", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Larache", nameAr: "العرائش", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Kénitra", nameAr: "القنيطرة", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Rabat", nameAr: "الرباط", deliveryHours: 24, inSaleRabatRegion: true, deliveryPrice: 30 },
  { name: "Salé", nameAr: "سلا", deliveryHours: 24, inSaleRabatRegion: true, deliveryPrice: 30 },
  { name: "Témara", nameAr: "تمارة", deliveryHours: 24, inSaleRabatRegion: true, deliveryPrice: 30 },
  { name: "Salé El Jadida", nameAr: "سلا الجديدة", deliveryHours: 24, inSaleRabatRegion: true, deliveryPrice: 30 },
  { name: "Tamesna", nameAr: "تامسنا", deliveryHours: 24, inSaleRabatRegion: true, deliveryPrice: 30 },
  { name: "Ain Atik", nameAr: "عين عتيق", deliveryHours: 24, inSaleRabatRegion: true, deliveryPrice: 30 },
  { name: "Ain Aouda", nameAr: "عين عودة", deliveryHours: 24, inSaleRabatRegion: true, deliveryPrice: 30 },
  { name: "Harhoura", nameAr: "الهرهورة", deliveryHours: 24, inSaleRabatRegion: true, deliveryPrice: 30 },
  { name: "Casablanca", nameAr: "الدار البيضاء", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Mohammedia", nameAr: "المحمدية", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "El Jadida", nameAr: "الجديدة", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Safi", nameAr: "آسفي", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Essaouira", nameAr: "الصويرة", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Marrakech", nameAr: "مراكش", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Agadir", nameAr: "أكادير", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Fès", nameAr: "فاس", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Meknès", nameAr: "مكناس", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Ifrane", nameAr: "إفران", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Khouribga", nameAr: "خريبكة", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Beni Mellal", nameAr: "بني ملال", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Settat", nameAr: "سطات", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Berrechid", nameAr: "برشيد", deliveryHours: 24, inSaleRabatRegion: false, deliveryPrice: 40 },
  
  // 48h delivery - Southern cities and Oujda
  { name: "Oujda", nameAr: "وجدة", deliveryHours: 48, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Nador", nameAr: "الناظور", deliveryHours: 48, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Ouarzazate", nameAr: "ورزازات", deliveryHours: 48, inSaleRabatRegion: false, deliveryPrice: 45 },
  { name: "Errachidia", nameAr: "الراشيدية", deliveryHours: 48, inSaleRabatRegion: false, deliveryPrice: 40 },
  { name: "Zagora", nameAr: "زاكورة", deliveryHours: 48, inSaleRabatRegion: false, deliveryPrice: 45 },
  { name: "Tan-Tan", nameAr: "طانطان", deliveryHours: 48, inSaleRabatRegion: false, deliveryPrice: 45 },
  { name: "Laâyoune", nameAr: "العيون", deliveryHours: 48, inSaleRabatRegion: false, deliveryPrice: 45 },
  { name: "Dakhla", nameAr: "الداخلة", deliveryHours: 48, inSaleRabatRegion: false, deliveryPrice: 45 },
  { name: "Guelmim", nameAr: "كلميم", deliveryHours: 48, inSaleRabatRegion: false, deliveryPrice: 45 },
  { name: "Taroudant", nameAr: "تارودانت", deliveryHours: 48, inSaleRabatRegion: false, deliveryPrice: 45 },
  { name: "Tiznit", nameAr: "تيزنيت", deliveryHours: 48, inSaleRabatRegion: false, deliveryPrice: 45 },
];

// Helper function to get city by name
export const getCityByName = (cityName) => {
  return CITIES.find(city => city.name === cityName);
};

// Helper function to get box size configuration
export const getBoxSize = (pieces) => {
  return BOX_SIZES.find(box => box.pieces === pieces);
};

// Helper function to get flavor by name
export const getFlavorByName = (flavorName) => {
  return FLAVORS.find(flavor => flavor.name === flavorName);
};