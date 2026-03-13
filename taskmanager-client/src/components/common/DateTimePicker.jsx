import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

/* ═══════════════════════════════════════════════
   PREMIUM DATE-TIME PICKER
   ═══════════════════════════════════════════════ */

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const DateTimePicker = ({ value, onChange, className = '', error = false, placeholder = 'Select date & time' }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('date'); // 'date' | 'time'
  const ref = useRef(null);

  // Parse value (yyyy-MM-ddTHH:mm)
  const parsed = useMemo(() => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const [navYear, setNavYear]   = useState(parsed?.getFullYear() ?? new Date().getFullYear());
  const [navMonth, setNavMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());
  const [selHour, setSelHour]   = useState(parsed ? String(parsed.getHours()).padStart(2,'0') : '09');
  const [selMin, setSelMin]     = useState(parsed ? String(parsed.getMinutes()).padStart(2,'0') : '00');

  // Sync when value changes externally
  useEffect(() => {
    if (parsed) {
      setNavYear(parsed.getFullYear());
      setNavMonth(parsed.getMonth());
      setSelHour(String(parsed.getHours()).padStart(2,'0'));
      setSelMin(String(parsed.getMinutes()).padStart(2,'0'));
    }
  }, [parsed]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const first = new Date(navYear, navMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(navYear, navMonth + 1, 0).getDate();
    const prevMonthDays = new Date(navYear, navMonth, 0).getDate();

    const cells = [];
    // Previous month trailing days
    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, current: false, date: new Date(navYear, navMonth - 1, prevMonthDays - i) });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, current: true, date: new Date(navYear, navMonth, d) });
    }
    // Next month leading days
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, current: false, date: new Date(navYear, navMonth + 1, d) });
    }
    return cells;
  }, [navYear, navMonth]);

  const today = useMemo(() => {
    const t = new Date(); t.setHours(0,0,0,0); return t;
  }, []);

  const selectedDate = useMemo(() => {
    if (!parsed) return null;
    const s = new Date(parsed); s.setHours(0,0,0,0); return s;
  }, [parsed]);

  const emit = useCallback((year, month, day, hour, min) => {
    const m = String(month + 1).padStart(2,'0');
    const d = String(day).padStart(2,'0');
    const h = String(hour).padStart(2,'0');
    const mi = String(min).padStart(2,'0');
    onChange(`${year}-${m}-${d}T${h}:${mi}`);
  }, [onChange]);

  const selectDay = (cell) => {
    const h = parseInt(selHour, 10);
    const m = parseInt(selMin, 10);
    emit(cell.date.getFullYear(), cell.date.getMonth(), cell.day, h, m);
    if (!cell.current) {
      setNavYear(cell.date.getFullYear());
      setNavMonth(cell.date.getMonth());
    }
  };

  const updateTime = (hour, min) => {
    setSelHour(hour);
    setSelMin(min);
    if (parsed) {
      emit(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), parseInt(hour,10), parseInt(min,10));
    }
  };

  const prevMonth = () => {
    if (navMonth === 0) { setNavMonth(11); setNavYear(y => y - 1); }
    else setNavMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (navMonth === 11) { setNavMonth(0); setNavYear(y => y + 1); }
    else setNavMonth(m => m + 1);
  };

  const goToday = () => {
    const now = new Date();
    setNavYear(now.getFullYear());
    setNavMonth(now.getMonth());
  };

  const clearValue = (e) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
  };

  const formatDisplay = () => {
    if (!parsed) return '';
    const day = parsed.getDate();
    const month = MONTHS[parsed.getMonth()].slice(0,3);
    const year = parsed.getFullYear();
    const h = String(parsed.getHours()).padStart(2,'0');
    const m = String(parsed.getMinutes()).padStart(2,'0');
    return `${day} ${month} ${year}, ${h}:${m}`;
  };

  const isSameDay = (a, b) => a && b && a.getTime() === b.getTime();

  const hours = Array.from({length: 24}, (_, i) => String(i).padStart(2,'0'));
  const minutes = Array.from({length: 12}, (_, i) => String(i * 5).padStart(2,'0'));

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all cursor-pointer
          ${error ? 'border-red-300 ring-2 ring-red-100' : open ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}
          ${className}`}
      >
        <Calendar className={`w-4 h-4 flex-shrink-0 ${parsed ? 'text-indigo-500' : 'text-slate-400'}`} />
        <span className={`flex-1 text-left truncate ${parsed ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
          {formatDisplay() || placeholder}
        </span>
        {parsed && (
          <button
            type="button"
            onClick={clearValue}
            className="p-0.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[100] mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
             style={{ width: '320px', left: '50%', transform: 'translateX(-50%)' }}>

          {/* Tab bar */}
          <div className="flex border-b border-slate-100">
            <button
              type="button"
              onClick={() => setView('date')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold tracking-wide transition-all cursor-pointer
                ${view === 'date' ? 'text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <Calendar className="w-3.5 h-3.5" /> DATE
            </button>
            <button
              type="button"
              onClick={() => setView('time')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold tracking-wide transition-all cursor-pointer
                ${view === 'time' ? 'text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <Clock className="w-3.5 h-3.5" /> TIME
            </button>
          </div>

          {view === 'date' ? (
            <div className="p-4">
              {/* Month/Year nav */}
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer">
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <h3 className="text-sm font-bold text-slate-800">
                  {MONTHS[navMonth]} {navYear}
                </h3>
                <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 py-1.5">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((cell, idx) => {
                  const cellDate = new Date(cell.date); cellDate.setHours(0,0,0,0);
                  const isToday = isSameDay(cellDate, today);
                  const isSelected = isSameDay(cellDate, selectedDate);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectDay(cell)}
                      className={`relative w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all cursor-pointer
                        ${!cell.current ? 'text-slate-300' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'}
                        ${isSelected ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-md shadow-indigo-200 hover:text-white hover:bg-none' : ''}
                        ${isToday && !isSelected ? 'font-bold ring-2 ring-indigo-300 ring-inset' : ''}
                      `}
                    >
                      {cell.day}
                      {isToday && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Today button */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={goToday} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer">
                  Today
                </button>
                {parsed && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatDisplay()}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Hours */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Hour</p>
                  <div className="h-52 overflow-y-auto rounded-xl border border-slate-100 scrollbar-thin">
                    {hours.map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => updateTime(h, selMin)}
                        className={`w-full text-center py-2 text-sm transition-colors cursor-pointer
                          ${selHour === h
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold'
                            : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                          }`}
                      >
                        {h}:00
                      </button>
                    ))}
                  </div>
                </div>
                {/* Minutes */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Minute</p>
                  <div className="h-52 overflow-y-auto rounded-xl border border-slate-100 scrollbar-thin">
                    {minutes.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => updateTime(selHour, m)}
                        className={`w-full text-center py-2 text-sm transition-colors cursor-pointer
                          ${selMin === m
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold'
                            : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                          }`}
                      >
                        :{m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current time display */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-slate-800 tabular-nums">{selHour}:{selMin}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const h = String(now.getHours()).padStart(2,'0');
                    const m = String(Math.round(now.getMinutes()/5)*5).padStart(2,'0');
                    updateTime(h, m === '60' ? '55' : m);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
