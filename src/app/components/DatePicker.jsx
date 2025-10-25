"use client"
import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function DatePicker({ selectedDate, onDateChange, language, deliveryHours = 24 }) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const labels = {
    fr: {
      selectDate: "Choisir la date de commande, livraison apres 24h ou 48h de la date de commande",
      selected: "Date sélectionnée",
    },
    ar: {
      selectDate: "اختر تاريخ الطلب، والتوصيل يتم بعد 24 أو 48 ساعة من تاريخ الطلب.",
      selected: "التاريخ المحدد",
    },
  };

  // Calculate minimum delivery date based on delivery hours
  const getMinimumDate = () => {
    const now = new Date();
    const minDate = new Date(now);
    minDate.setHours(0, 0, 0, 0);
    
    // Add delivery hours converted to days
    const daysToAdd = Math.ceil(deliveryHours / 24);
    minDate.setDate(minDate.getDate() + daysToAdd);
    
    return minDate;
  };

  // Set the absolute minimum date to November 3rd, 2025
  const getAbsoluteMinimumDate = () => {
    return new Date(2025, 10, 3); // Month is 0-indexed, so 10 = November
  };

  const calculatedMinDate = getMinimumDate();
  const absoluteMinDate = getAbsoluteMinimumDate();
  
  // Use whichever date is later
  const minimumDate = calculatedMinDate > absoluteMinDate ? calculatedMinDate : absoluteMinDate;

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    
    // Check if date is before minimum date
    if (date < minimumDate) return true;
    
    // Check if date is a Sunday (0 = Sunday)
    if (date.getDay() === 0) return true;
    
    return false;
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateSelect = (date) => {
    if (!isDateDisabled(date)) {
      onDateChange(date);
      setOpen(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-900">
        {labels[language].selectDate}
      </label>
      
      <div className="relative">
        {/* Date Picker Trigger Button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          data-testid="button-date-picker"
          className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg flex items-center justify-start gap-2 text-left hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
        >
          <CalendarIcon className="w-4 h-4 text-gray-600" />
          {selectedDate ? (
            <span className="text-gray-900">
              {format(selectedDate, "PPP", { locale: fr })}
            </span>
          ) : (
            <span className="text-gray-400 text-xs">{labels[language].selectDate}</span>
          )}
        </button>

        {/* Calendar Dropdown */}
        {open && (
          <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-full sm:w-80">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <span className="font-semibold text-gray-900">
                {format(currentMonth, "MMMM yyyy", { locale: fr })}
              </span>
              
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const disabled = isDateDisabled(date);
                const selected = isDateSelected(date);

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    disabled={disabled}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                      disabled
                        ? "text-gray-300 cursor-not-allowed"
                        : selected
                        ? "bg-[#E18B73] text-white hover:bg-blue-700"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}