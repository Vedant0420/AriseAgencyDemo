'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { validateBookingForm, sanitizeBookingForm, type BookingFormData } from '../../lib/validation';

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function Booking() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    platform: '',
    date: '',
    time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState('');
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);

  // Update calendar to current date every minute
  useEffect(() => {
    const updateCurrentDate = () => {
      const now = new Date();
      setCurrentMonth(now);
      setSelectedDate(now);
      setFormData(prev => ({ ...prev, date: now.toISOString().split('T')[0] }));
    };

    // Update immediately on mount
    updateCurrentDate();

    // Set interval to check every minute
    const interval = setInterval(updateCurrentDate, 60000);

    return () => clearInterval(interval);
  }, []);

  // Available time slots
  const timeSlots: TimeSlot[] = [
    { time: '12:30pm', available: true },
    { time: '1:00pm', available: true },
    { time: '1:30pm', available: true },
    { time: '2:00pm', available: true },
    { time: '2:30pm', available: true },
    { time: '3:00pm', available: true },
    { time: '3:30pm', available: true },
    { time: '4:00pm', available: true },
    { time: '4:30pm', available: true },
  ];

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const getDaysArray = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const startingDayOfWeek = firstDayOfMonth(currentMonth);

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return days;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isDateInPast = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isTimeInPast = (time: string) => {
    if (!selectedDate) return false;
    const today = new Date();
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // If selected date is not today, time is not in past
    if (selectedDateOnly.getTime() !== today.getTime()) return false;

    // Parse time and compare with current time
    const [timePart, period] = time.split(/(am|pm)/);
    let hours = 0;
    const [, minutesStr] = timePart.split(':');
    const minutes = parseInt(minutesStr || '0');
    
    hours = parseInt(timePart.split(':')[0]);
    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return slotTime < new Date();
  };

  const convertTo24h = (time12h: string): string => {
    const [timePart, period] = time12h.split(/(am|pm)/);
    const [hoursStr, minutes] = timePart.split(':');
    let h = parseInt(hoursStr);

    if (period === 'pm' && h !== 12) h += 12;
    if (period === 'am' && h === 12) h = 0;

    return `${String(h).padStart(2, '0')}:${minutes}`;
  };

  const formatTimeForDisplay = (time: string): string => {
    if (timeFormat === '24h') {
      return convertTo24h(time);
    }
    return time;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setFormData({ ...formData, date: date.toISOString().split('T')[0] });
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    setFormData({ ...formData, time });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!db) {
      setErrors({ submit: 'Service temporarily unavailable. Please try again later.' });
      return;
    }

    if (honeypot) {
      console.warn('Bot detected via honeypot field');
      setFormData({ name: '', email: '', platform: '', date: '', time: '', notes: '' });
      setHoneypot('');
      setShowModal(true);
      return;
    }

    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    const RATE_LIMIT_MS = 5000;

    if (timeSinceLastSubmission < RATE_LIMIT_MS) {
      setErrors({ submit: 'Please wait a moment before submitting again.' });
      return;
    }

    const validation = validateBookingForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    const sanitizedData = sanitizeBookingForm(formData);
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        ...sanitizedData,
        timestamp: new Date()
      });
      setFormData({ name: '', email: '', platform: '', date: '', time: '', notes: '' });
      setSelectedTime('');
      setSelectedDate(null);
      setHoneypot('');
      setLastSubmissionTime(Date.now());
      setShowModal(true);
    } catch (error) {
      console.error('Error adding document: ', error);
      setErrors({ submit: 'Unable to submit booking. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const days = getDaysArray();

  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-16 text-black tracking-tight">Book a Session</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Event Details */}
          <div className="border border-black/10 p-8 rounded-none h-fit bg-black/5 hover:border-black/20 transition-all duration-300">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-black">Demo Service</h2>
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">Schedule a consultation</h3>
              <p className="text-black/60 text-sm mb-6 font-light">A focused video call to discuss your needs, understand your goals, and explore how we can help. No pressure, no sales pitch. Just a genuine conversation.</p>
            </div>

            <div className="space-y-4 text-black/60 text-sm font-light">
              <div className="flex items-center gap-3">
                <div className="text-xl">⏱️</div>
                <span>30 minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xl">🎥</div>
                <span>Video call</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xl">🌍</div>
                <span>Asia/Kolkata</span>
              </div>
            </div>
          </div>

          {/* Middle Panel - Calendar */}
          <div className="border border-black/10 p-8 rounded-none bg-black/5 hover:border-black/20 transition-all duration-300">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="text-black/60 hover:text-black transition-colors">← </button>
                <h2 className="text-xl font-bold text-black">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <button onClick={handleNextMonth} className="text-black/60 hover:text-black transition-colors"> →</button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-black/40 text-xs font-semibold py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => date && handleDateClick(date)}
                    disabled={!date || isDateInPast(date)}
                    className={`aspect-square rounded-none font-semibold text-sm transition-all border ${
                      !date || isDateInPast(date)
                        ? 'border-black/10 bg-black/5 text-black/30 cursor-not-allowed'
                        : isDateSelected(date)
                        ? 'border-black bg-black text-white'
                        : 'border-black/20 bg-black/5 text-black/70 hover:border-black/40'
                    }`}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="text-center text-black/60 text-sm pt-4 border-t border-black/10 font-light">
                Selected: {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>

          {/* Right Panel - Time Slots */}
          <div className="border border-black/10 p-8 rounded-none bg-black/5 hover:border-black/20 transition-all duration-300">
            {selectedDate && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-black/60 text-xs font-light">{selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-black font-bold text-xl">{String(selectedDate.getDate()).padStart(2, '0')}</div>
                  </div>
                  <div className="flex gap-1 bg-black/5 border border-black/10 rounded-none p-1">
                    <button
                      onClick={() => setTimeFormat('12h')}
                      className={`px-2 py-0.5 rounded-none text-xs font-semibold transition-all ${
                        timeFormat === '12h'
                          ? 'bg-black text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      12h
                    </button>
                    <button
                      onClick={() => setTimeFormat('24h')}
                      className={`px-2 py-0.5 rounded-none text-xs font-semibold transition-all ${
                        timeFormat === '24h'
                          ? 'bg-black text-white'
                          : 'text-black/60 hover:text-black'
                      }`}
                    >
                      24h
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 mb-6">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeClick(slot.time)}
                      disabled={!slot.available || isTimeInPast(slot.time)}
                      className={`w-full py-2 px-3 rounded-none text-xs font-semibold transition-all border ${
                        selectedTime === slot.time
                          ? 'bg-black text-white border-black'
                          : slot.available && !isTimeInPast(slot.time)
                          ? 'bg-white/50 text-black/70 border-black/20 hover:border-black/40'
                          : 'bg-black/5 text-black/30 border-black/10 cursor-not-allowed'
                      }`}
                    >
                      {formatTimeForDisplay(slot.time)}
                    </button>
                  ))}
                </div>

                {selectedTime && (
                  <form onSubmit={handleSubmit} className="space-y-4 border-t border-black/10 pt-6">
                    <div>
                      <label htmlFor="name" className="block text-black font-semibold mb-2 text-sm tracking-tight">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-black/20 rounded-none focus:outline-none focus:ring-2 focus:ring-black/30 bg-white/50 text-black text-sm placeholder-black/40 transition-all"
                        placeholder="Your name"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1 font-light">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-black font-semibold mb-2 text-sm tracking-tight">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-black/20 rounded-none focus:outline-none focus:ring-2 focus:ring-black/30 bg-white/50 text-black text-sm placeholder-black/40 transition-all"
                        placeholder="your.email@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1 font-light">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="platform" className="block text-black font-semibold mb-2 text-sm tracking-tight">Platform Focus</label>
                      <select
                        id="platform"
                        name="platform"
                        value={formData.platform}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-black/20 rounded-none focus:outline-none focus:ring-2 focus:ring-black/30 bg-white/50 text-black text-sm transition-all"
                      >
                        <option value="" className="bg-white text-black">Select a platform</option>
                        <option value="YouTube" className="bg-white text-black">YouTube</option>
                        <option value="TikTok" className="bg-white text-black">TikTok</option>
                        <option value="Instagram" className="bg-white text-black">Instagram</option>
                        <option value="Other" className="bg-white text-black">Other</option>
                      </select>
                      {errors.platform && <p className="text-red-500 text-xs mt-1 font-light">{errors.platform}</p>}
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-black font-semibold mb-2 text-sm tracking-tight">Notes (Optional)</label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-black/20 rounded-none focus:outline-none focus:ring-2 focus:ring-black/30 bg-white/50 text-black text-sm resize-none placeholder-black/40 transition-all"
                        placeholder="Any additional information..."
                        rows={3}
                      />
                      {errors.notes && <p className="text-red-500 text-xs mt-1 font-light">{errors.notes}</p>}
                    </div>

                    {errors.submit && <p className="text-red-500 text-xs font-light">{errors.submit}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white py-3 px-4 rounded-none font-semibold hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black/30 disabled:opacity-50 transition-all duration-300 tracking-wide text-sm mt-6"
                    >
                      {loading ? 'Booking...' : 'Confirm Booking'}
                    </button>

                    {/* Honeypot field */}
                    <div className="absolute left-[-9999px] opacity-0 pointer-events-none">
                      <input
                        type="text"
                        name="website"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                      />
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="border border-black/10 p-8 rounded-none max-w-md w-full mx-4 bg-white hover:border-black/20 transition-all duration-300">
            <h2 className="text-2xl font-bold text-black mb-4 tracking-tight">✓ Booking Confirmed!</h2>
            <p className="text-black/70 mb-6 font-light leading-relaxed">Thank you for booking a session with us! Check your email for confirmation details.</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-black text-white py-3 px-4 rounded-none font-semibold hover:bg-black/90 transition-all duration-300 tracking-wide text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}