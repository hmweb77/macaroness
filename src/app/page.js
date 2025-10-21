"use client"
import { useState, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Navbar from "./components/NavBar";
import HeroSection from "./components/Hero";
import CitySelector from "./components/CitySelector";
import DatePicker from "./components/DatePicker";
import AvailabilityBar from "./components/AvailabilityBar";
import BoxSelector from "./components/BoxSelector";
import FlavorSelector from "./components/FlavorSelector";
import CheckoutForm from "./components/CheckoutForm";
import OrderSummary from "./components/OrderSummary";
import OrderConfirmation from "./components/OrderConfirmation";
import {
  DAILY_CAPACITY,
  MIN_AVAILABLE_FOR_ORDER,
  FLAVORS,
  CITIES,
  BOX_SIZES,
} from "./Shared";

// Google Sheets configuration
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212621526099";

// Function to save order to Google Sheets
const saveOrderToSheets = async (orderData) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script doesn't support CORS
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    // Since we're using no-cors, we won't get the actual response
    // but the request will still be processed by Google Apps Script
    console.log('Order saved to Google Sheets');
    return { success: true };
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    // Don't block the order if sheets fails
    return { success: false, error: error.message };
  }
};

export default function Home() {
  // Language and UI State
  const [language, setLanguage] = useState("fr");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Order State
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [selectedBoxSize, setSelectedBoxSize] = useState(null);
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [surpriseMe, setSurpriseMe] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [customerData, setCustomerData] = useState(null);
  
  // Refs
  const orderSectionRef = useRef(null);
  
  // Mock data - Replace with real API call
  const remainingCapacity = 648;
  
  // Utility Functions
  const showToast = (title, description, variant = "default") => {
    alert(`${title}\n${description}`);
  };
  
  const generateOrderNumber = () => {
    return Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
  };
  
  // Handlers
  const handleScrollToOrder = () => {
    orderSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  
  const handleLanguageToggle = () => {
    const newLanguage = language === "fr" ? "ar" : "fr";
    setLanguage(newLanguage);
    const htmlElement = document.documentElement;
    htmlElement.setAttribute("lang", newLanguage);
    htmlElement.setAttribute("dir", newLanguage === "ar" ? "rtl" : "ltr");
  };
  
  const handleCitySelection = (city) => {
    setSelectedCity(city);
    
    // Clear box selection if the new city doesn't support the current box
    if (selectedBoxSize) {
      const newCityData = CITIES.find((c) => c.name === city);
      const boxData = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
      
      if (boxData?.regionRestricted && !newCityData?.inSaleRabatRegion) {
        setSelectedBoxSize(null);
        setSelectedFlavors([]);
        setSurpriseMe(false);
      }
    }
  };
  
  const handleSurpriseMeChange = (value, maxFlavors) => {
    setSurpriseMe(value);
    if (value) {
      // Randomly select flavors for surprise option
      const randomFlavors = [...FLAVORS]
        .sort(() => 0.5 - Math.random())
        .slice(0, maxFlavors)
        .map((f) => f.name);
      setSelectedFlavors(randomFlavors);
    } else {
      setSelectedFlavors([]);
    }
  };
  
  const formatWhatsAppMessage = (data, orderNum) => {
    const boxData = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
    const cityData = CITIES.find((c) => c.name === selectedCity);
    const deliveryPrice = cityData?.deliveryPrice || 0;
    const boxPrice = boxData?.price || 0;
    const total = boxPrice + deliveryPrice;
    
    const message = `
🎉 *NOUVELLE COMMANDE MACARONESS* 🎉

📦 *Détails de la commande:*
• Numéro: #${orderNum}
• Boîte: ${selectedBoxSize} pièces
• Prix boîte: ${boxPrice} MAD
• Livraison: ${deliveryPrice} MAD
• *TOTAL: ${total} MAD*

👤 *Informations Client:*
• Nom: ${data.customerName}
• Téléphone: ${data.phone}
${data.address ? `• Adresse: ${data.address}` : ''}
${data.notes ? `• Notes: ${data.notes}` : ''}

📍 *Détails Livraison:*
• Ville: ${selectedCity}
• Date: ${format(selectedDate, "EEEE dd MMMM yyyy", { locale: fr })}
• Délai: ${cityData?.deliveryHours === 24 ? '24h' : '48h'}

🍰 *Saveurs sélectionnées:*
${surpriseMe 
  ? '✨ Surprise! (Sélection du chef)' 
  : selectedFlavors.length > 0 
    ? selectedFlavors.map(f => `• ${f}`).join('\n')
    : '• Aucune sélection de saveur requise'
}

━━━━━━━━━━━━━━━━━
📅 Commande passée le: ${format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
`.trim();
    
    return message;
  };
  
  const sendToWhatsApp = (message) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  };
  
  const handleSubmit = async (data) => {
    // Validation
    if (!selectedCity || !selectedDate || !selectedBoxSize) {
      showToast(
        language === "fr" ? "Erreur" : "خطأ",
        language === "fr"
          ? "Veuillez sélectionner une ville, une date et une boîte"
          : "يرجى اختيار مدينة وتاريخ وعلبة",
        "destructive"
      );
      return;
    }
    
    const boxData = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
    const requiresFlavors = boxData && boxData.maxFlavors > 0;
    
    if (requiresFlavors && !surpriseMe && selectedFlavors.length === 0) {
      showToast(
        language === "fr" ? "Erreur" : "خطأ",
        language === "fr"
          ? "Veuillez sélectionner au moins une saveur"
          : "يرجى اختيار نكهة واحدة على الأقل",
        "destructive"
      );
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate order number
      const orderNum = generateOrderNumber();
      
      // Calculate prices
      const cityData = CITIES.find((c) => c.name === selectedCity);
      const deliveryPrice = cityData?.deliveryPrice || 0;
      const boxPrice = boxData?.price || 0;
      const total = boxPrice + deliveryPrice;
      
      // Prepare order data for Google Sheets
      const orderDataForSheets = {
        orderNumber: orderNum,
        customerName: data.customerName,
        phone: data.phone,
        address: data.address || '',
        notes: data.notes || '',
        city: selectedCity,
        deliveryDate: format(selectedDate, "dd/MM/yyyy", { locale: fr }),
        boxSize: `${selectedBoxSize} pièces`,
        totalPrice: `${total} MAD`,
        flavors: surpriseMe 
          ? 'Surprise' 
          : selectedFlavors.length > 0 
            ? selectedFlavors.join(', ')
            : 'Aucune',
        surpriseMe: surpriseMe,
        orderDateTime: format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })
      };
      
      // Save to Google Sheets (non-blocking)
      saveOrderToSheets(orderDataForSheets).then(result => {
        if (result.success) {
          console.log('Order successfully saved to Google Sheets');
        } else {
          console.log('Failed to save to Google Sheets, but order continues');
        }
      });
      
      // Store customer data for confirmation page
      setCustomerData(data);
      setOrderNumber(orderNum);
      
      // Show loading message
      showToast(
        language === "fr" ? "Traitement..." : "معالجة...",
        language === "fr" 
          ? "Enregistrement de votre commande..." 
          : "جاري حفظ طلبك...",
        "default"
      );
      
      // Wait a bit to ensure Google Sheets request is sent
      setTimeout(() => {
        // Format and send WhatsApp message
        const whatsappMessage = formatWhatsAppMessage(data, orderNum);
        sendToWhatsApp(whatsappMessage);
        
        // Show confirmation page after a brief delay
        setTimeout(() => {
          setShowConfirmation(true);
          setIsSubmitting(false);
        }, 500);
      }, 1000);
      
    } catch (error) {
      console.error('Error processing order:', error);
      setIsSubmitting(false);
      showToast(
        language === "fr" ? "Erreur" : "خطأ",
        language === "fr"
          ? "Une erreur s'est produite. Veuillez réessayer."
          : "حدث خطأ. يرجى المحاولة مرة أخرى.",
        "destructive"
      );
    }
  };
  
  const handleNewOrder = () => {
    // Reset all state
    setShowConfirmation(false);
    setSelectedCity(null);
    setSelectedDate(undefined);
    setSelectedBoxSize(null);
    setSelectedFlavors([]);
    setSurpriseMe(false);
    setOrderNumber("");
    setCustomerData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  // Computed Values
  const selectedCityData = CITIES.find((c) => c.name === selectedCity);
  const deliveryHours = selectedCityData?.deliveryHours || 24;
  const inSaleRabatRegion = selectedCityData?.inSaleRabatRegion || false;
  
  const selectedBoxData = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
  const maxFlavors = selectedBoxData?.maxFlavors || 0;
  const needsFlavorSelection = maxFlavors > 0;
  
  const canCheckout =
    selectedCity &&
    selectedDate &&
    selectedBoxSize &&
    remainingCapacity >= MIN_AVAILABLE_FOR_ORDER &&
    (!needsFlavorSelection || surpriseMe || selectedFlavors.length > 0);
  
  // Render Confirmation Page
  if (showConfirmation && selectedDate && selectedBoxSize) {
    const selectedBox = BOX_SIZES.find((b) => b.pieces === selectedBoxSize);
    const selectedCityData = CITIES.find((c) => c.name === selectedCity);
    const deliveryPrice = selectedCityData?.deliveryPrice || 0;
    const totalPrice = (selectedBox?.price || 0) + deliveryPrice;
    
    return (
      <OrderConfirmation
        orderNumber={orderNumber}
        boxSize={selectedBoxSize}
        priceMad={totalPrice}
        customerName={customerData?.customerName || "Client"}
        deliveryDate={format(selectedDate, "PPP", { locale: fr })}
        onNewOrder={handleNewOrder}
        language={language}
      />
    );
  }
  
  // Render Main Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
      <Navbar
        language={language}
        onLanguageToggle={handleLanguageToggle}
        onCommanderClick={handleScrollToOrder}
      />
      
      <HeroSection 
        onCommanderClick={handleScrollToOrder} 
        language={language} 
      />
      
      <div
        ref={orderSectionRef}
        className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20"
      >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* City Selection */}
            <CitySelector
              selectedCity={selectedCity}
              onSelectCity={handleCitySelection}
              language={language}
            />
            
            {/* Multiple Orders Info */}
            <div 
              className="p-4 rounded-xl bg-blue-50 border border-blue-200"
              data-testid="info-multiple-orders"
            >
              <p className="text-sm text-gray-600 text-center">
                {language === "fr"
                  ? "Pour commander plusieurs boîtes, veuillez passer une commande et recommencer après validation."
                  : "لطلب عدة علب، يرجى تقديم طلب واحد وإعادة الطلب بعد التأكيد."}
              </p>
            </div>
            
            {/* Date Selection (shows after city selection) */}
            {selectedCity && (
              <div className="space-y-6">
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  language={language}
                  deliveryHours={deliveryHours}
                />
                
                {selectedDate && (
                  <AvailabilityBar
                    remaining={remainingCapacity}
                    language={language}
                  />
                )}
              </div>
            )}
            
            {/* Box and Flavor Selection (shows after date selection) */}
            {selectedCity && selectedDate && remainingCapacity >= MIN_AVAILABLE_FOR_ORDER && (
              <>
                <BoxSelector
                  selectedBoxSize={selectedBoxSize}
                  onSelectBoxSize={setSelectedBoxSize}
                  language={language}
                  inSaleRabatRegion={inSaleRabatRegion}
                />
                
                {selectedBoxSize && needsFlavorSelection && (
                  <FlavorSelector
                    selectedFlavors={selectedFlavors}
                    onFlavorsChange={setSelectedFlavors}
                    surpriseMe={surpriseMe}
                    onSurpriseMeChange={(value) => handleSurpriseMeChange(value, maxFlavors)}
                    language={language}
                    maxFlavors={maxFlavors}
                  />
                )}
                
                {/* Checkout Form (shows when all required fields are selected) */}
                {canCheckout && (
                  <div className="max-w-2xl">
                    <CheckoutForm
                      onSubmit={handleSubmit}
                      isLoading={isSubmitting}
                      language={language}
                    />
                  </div>
                )}
              </>
            )}
            
            {/* Sold Out Message */}
            {selectedCity && selectedDate && remainingCapacity < MIN_AVAILABLE_FOR_ORDER && (
              <div className="p-8 rounded-2xl bg-red-50 border border-red-200 text-center">
                <p className="text-2xl font-serif font-semibold text-red-600">
                  {language === "fr"
                    ? "Épuisé pour cette date"
                    : "نفدت الكمية لهذا التاريخ"}
                </p>
                <p className="mt-2 text-gray-600">
                  {language === "fr"
                    ? "Veuillez choisir une autre date"
                    : "يرجى اختيار تاريخ آخر"}
                </p>
              </div>
            )}
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              boxSize={selectedBoxSize}
              selectedFlavors={selectedFlavors}
              surpriseMe={surpriseMe}
              language={language}
              selectedCity={selectedCity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}