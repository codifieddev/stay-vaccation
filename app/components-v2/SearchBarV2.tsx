"use client";
import React, { useState, useRef, useEffect } from 'react';
import LucideIcon from '../components/LucideIcon';
import { useRouter } from 'next/navigation';

interface Destination {
  id: string;
  name: string;
  category?: string;
  image?: string;
}

interface SearchBarLabels {
  destination?: string;
  placeholder_destination?: string;
  checkin?: string;
  checkout?: string;
  guests?: string;
  placeholder_guests?: string;
  search_btn?: string;
}

interface SearchBarV2Props {
  destinations?: Destination[];
  labels?: SearchBarLabels;
}

const SearchBarV2: React.FC<SearchBarV2Props> = ({ destinations = [], labels = {} }) => {

  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [showDestinations, setShowDestinations] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showGuests, setShowGuests] = useState(false);
  
  const destRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);
  const checkInCalRef = useRef<HTMLDivElement>(null);
  const checkOutCalRef = useRef<HTMLDivElement>(null);
  const [todayString, setTodayString] = useState('');

  const [showCheckInCal, setShowCheckInCal] = useState(false);
  const [showCheckOutCal, setShowCheckOutCal] = useState(false);
  const [checkInMonth, setCheckInMonth] = useState<Date | null>(null);
  const [checkOutMonth, setCheckOutMonth] = useState<Date | null>(null);

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setTodayString(`${yyyy}-${mm}-${dd}`);
    setCheckInMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setCheckOutMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestinations(false);
      }
      if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
        setShowGuests(false);
      }
      if (checkInCalRef.current && !checkInCalRef.current.contains(event.target as Node)) {
        setShowCheckInCal(false);
      }
      if (checkOutCalRef.current && !checkOutCalRef.current.contains(event.target as Node)) {
        setShowCheckOutCal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCalendarDays = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const days: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      days.push({
        dateStr: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
        dayNum,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Next month padding days to complete a grid of 6 weeks (42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      days.push({
        dateStr: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handlePrevCheckInMonth = () => {
    if (!checkInMonth) return;
    const prev = new Date(checkInMonth.getFullYear(), checkInMonth.getMonth() - 1, 1);
    const today = new Date();
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prev >= minMonth) {
      setCheckInMonth(prev);
    }
  };

  const handleNextCheckInMonth = () => {
    if (!checkInMonth) return;
    setCheckInMonth(new Date(checkInMonth.getFullYear(), checkInMonth.getMonth() + 1, 1));
  };

  const handlePrevCheckOutMonth = () => {
    if (!checkOutMonth) return;
    const prev = new Date(checkOutMonth.getFullYear(), checkOutMonth.getMonth() - 1, 1);
    const today = new Date();
    const minDate = checkIn ? new Date(checkIn) : today;
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    if (prev >= minMonth) {
      setCheckOutMonth(prev);
    }
  };

  const handleNextCheckOutMonth = () => {
    if (!checkOutMonth) return;
    setCheckOutMonth(new Date(checkOutMonth.getFullYear(), checkOutMonth.getMonth() + 1, 1));
  };

  const handleSelectCheckIn = (dateStr: string) => {
    setCheckIn(dateStr);
    setShowCheckInCal(false);
    if (checkOut && checkOut < dateStr) {
      setCheckOut('');
    }
    setShowCheckOutCal(true);

    const selectDateObj = new Date(dateStr);
    const startOfSelectMonth = new Date(selectDateObj.getFullYear(), selectDateObj.getMonth(), 1);
    if (checkOutMonth && checkOutMonth < startOfSelectMonth) {
      setCheckOutMonth(startOfSelectMonth);
    }
  };

  const handleSelectCheckOut = (dateStr: string) => {
    setCheckOut(dateStr);
    setShowCheckOutCal(false);
  };

  const renderCalendar = (
    type: 'in' | 'out',
    currentViewMonth: Date | null,
    onPrevMonth: () => void,
    onNextMonth: () => void,
    onSelectDate: (dateStr: string) => void,
    selectedDate: string
  ) => {
    if (!currentViewMonth) return null;
    const year = currentViewMonth.getFullYear();
    const month = currentViewMonth.getMonth();
    const days = getCalendarDays(year, month);

    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div 
        className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-3 bg-white rounded-2xl shadow-luxury-lg border border-gray-100 z-[100] p-4 animate-in fade-in slide-in-from-top-2 duration-200 w-[290px] pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            type="button"
            onClick={onPrevMonth}
            className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all text-[#1a1a2e]"
          >
            <LucideIcon name="ChevronLeft" size={14} />
          </button>
          <span className="font-['Poppins'] font-bold text-xs text-[#1a1a2e]">
            {MONTHS[month]} {year}
          </span>
          <button 
            type="button"
            onClick={onNextMonth}
            className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all text-[#1a1a2e]"
          >
            <LucideIcon name="ChevronRight" size={14} />
          </button>
        </div>

        {/* Weekdays Row */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekdays.map((day) => (
            <span key={day} className="font-['Poppins'] font-bold text-[9px] text-gray-400 uppercase tracking-wider py-1">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(({ dateStr, dayNum, isCurrentMonth }) => {
            let isDisabled = false;
            if (type === 'in') {
              isDisabled = dateStr < todayString;
            } else {
              isDisabled = dateStr < (checkIn || todayString);
            }

            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayString;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isDisabled}
                onClick={() => onSelectDate(dateStr)}
                className={`
                  w-8 h-8 rounded-full font-['Poppins'] text-xs font-semibold flex items-center justify-center transition-all
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                  ${isDisabled ? 'text-gray-200 cursor-not-allowed bg-transparent' : ''}
                  ${isToday && !isSelected ? 'border border-[#4a90e2] text-[#4a90e2]' : ''}
                  ${isSelected ? 'bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white font-bold shadow-[0_4px_12px_rgba(255,149,0,0.3)]' : ''}
                  ${!isDisabled && !isSelected ? 'hover:bg-gray-100' : ''}
                `}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(destination.toLowerCase())
  );

  // Helper to remove emojis from labels
  const cleanLabel = (text: string | undefined, fallback: string) => {
    if (!text) return fallback;
    return text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim();
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set('location', destination);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('guests', guests.toString());
    
    router.push(`/packages?${params.toString()}`);
  };

  return (
    <div className="hero-search-v2 shadow-luxury">
      {/* Destination Field */}
      <div className="hs-field relative group" ref={destRef}>
        <div className="hs-icon-badge">
          <LucideIcon name="MapPin" size={16} />
        </div>
        <div className="hs-content-stack">
          <div className="hs-label">
            {cleanLabel(labels.destination, 'Destination')}
          </div>
          <input 
            className="hs-input mt-0.5" 
            type="text" 
            placeholder={cleanLabel(labels.placeholder_destination, 'Where to go?')}
            value={destination}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setDestination(e.target.value);
              setShowDestinations(true);
            }}
            onFocus={() => setShowDestinations(true)}
          />
        </div>
        
        {showDestinations && filteredDestinations.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] max-h-[350px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 shadow-luxury-lg">
            {filteredDestinations.map((dest) => (
              <button
                key={dest.id}
                type="button"
                className="w-full text-left px-5 py-3.5 hover:bg-sky-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                onClick={() => {
                  setDestination(dest.name);
                  setShowDestinations(false);
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#ff9500]">
                  <LucideIcon name="MapPin" size={14} />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1a1a2e]">{dest.name}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest">{dest.category || 'Destination'}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Check-In Field */}
      <div 
        ref={checkInCalRef}
        className="hs-field cursor-pointer relative group" 
        onClick={() => {
          setShowCheckInCal(prev => !prev);
          setShowCheckOutCal(false);
          setShowDestinations(false);
          setShowGuests(false);
        }}
      >
        <div className="hs-icon-badge">
          <LucideIcon name="Calendar" size={16} />
        </div>
        <div className="hs-content-stack">
          <div className="hs-label">
            {cleanLabel(labels.checkin, 'Check-in')}
          </div>
          <div className={`hs-input mt-0.5 flex items-center justify-between w-full cursor-pointer ${checkIn ? 'text-[#1e293b]' : 'text-[#cbd5e1] font-medium'}`}>
            <span>{checkIn ? formatDateDisplay(checkIn) : 'DD-MM-YYYY'}</span>
          </div>
        </div>
        {showCheckInCal && renderCalendar('in', checkInMonth, handlePrevCheckInMonth, handleNextCheckInMonth, handleSelectCheckIn, checkIn)}
      </div>

      {/* Check-Out Field */}
      <div 
        ref={checkOutCalRef}
        className="hs-field cursor-pointer relative group" 
        onClick={() => {
          setShowCheckOutCal(prev => !prev);
          setShowCheckInCal(false);
          setShowDestinations(false);
          setShowGuests(false);
        }}
      >
        <div className="hs-icon-badge">
          <LucideIcon name="Calendar" size={16} />
        </div>
        <div className="hs-content-stack">
          <div className="hs-label">
            {cleanLabel(labels.checkout, 'Check-out')}
          </div>
          <div className={`hs-input mt-0.5 flex items-center justify-between w-full cursor-pointer ${checkOut ? 'text-[#1e293b]' : 'text-[#cbd5e1] font-medium'}`}>
            <span>{checkOut ? formatDateDisplay(checkOut) : 'DD-MM-YYYY'}</span>
          </div>
        </div>
        {showCheckOutCal && renderCalendar('out', checkOutMonth, handlePrevCheckOutMonth, handleNextCheckOutMonth, handleSelectCheckOut, checkOut)}
      </div>

      {/* Guests Field */}
      <div className="hs-field relative group" ref={guestRef}>
        <div className="hs-icon-badge">
          <LucideIcon name="Users" size={16} />
        </div>
        <div className="hs-content-stack">
          <div className="hs-label">
            {cleanLabel(labels.guests, 'Guests')}
          </div>
          <button 
            type="button"
            className="hs-input mt-0.5 text-left flex items-center justify-between w-full"
            onClick={() => setShowGuests(!showGuests)}
          >
            <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
            <LucideIcon name="ChevronDown" size={14} className={`text-gray-300 transition-transform ${showGuests ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showGuests && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-luxury-lg border border-gray-100 z-[100] p-5 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-[#1a1a2e]">Travelers</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">Number of guests</div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-sky-50 hover:border-sky-200 transition-all text-[#1a1a2e]"
                >
                  <LucideIcon name="Minus" size={14} />
                </button>
                <span className="font-bold text-lg min-w-[20px] text-center">{guests}</span>
                <button 
                  type="button"
                  onClick={() => setGuests(guests + 1)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-sky-50 hover:border-sky-200 transition-all text-[#1a1a2e]"
                >
                  <LucideIcon name="Plus" size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Button */}
      <button 
        type="button"
        className="hs-btn"
        onClick={handleSearch}
      >
        <LucideIcon name="Search" size={18} />
        <span>{cleanLabel(labels.search_btn, 'Search')}</span>
      </button>
    </div>
  );
};

export default SearchBarV2;
