import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartHandshake, Search, Calendar, Clock, Star, BadgeCheck,
  Filter, Check, ArrowRight, UserCheck
} from 'lucide-react';
import api from '../services/api';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('All');
  
  // Booking Modal States
  const [bookingMentor, setBookingMentor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('10:00 AM - 11:00 AM');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchMentors = async () => {
    try {
      const res = await api.get('/mentors');
      setMentors(res.data);
    } catch (err) {
      console.error('Error fetching mentors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleOpenBooking = (mentor) => {
    setBookingMentor(mentor);
    setBookingDate('');
    setBookingSlot('10:00 AM - 11:00 AM');
    setBookingSuccess('');
    setBookingLoading(false);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingSlot) return;
    
    setBookingLoading(true);
    try {
      const res = await api.post(`/mentors/${bookingMentor._id}/book`, {
        date: bookingDate,
        timeSlot: bookingSlot
      });
      setBookingSuccess(res.data.message);
    } catch (err) {
      console.error('Booking failed', err);
      alert('Could not book session. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const expertiseTags = ['All', 'Investing', 'Stocks', 'Risk', 'Saving', 'Budgeting', 'FD', 'Tax Basics', 'Financial Psychology'];

  // Filter list
  const filteredMentors = mentors.filter((m) => {
    const matchesSearch = m.userId?.name.toLowerCase().includes(search.toLowerCase()) ||
      m.bio.toLowerCase().includes(search.toLowerCase());

    const matchesExpertise = filterExpertise === 'All' || m.expertise.includes(filterExpertise);

    return matchesSearch && matchesExpertise;
  });

  const slots = [
    '10:00 AM - 11:00 AM',
    '11:30 AM - 12:30 PM',
    '2:00 PM - 3:00 PM',
    '4:00 PM - 5:00 PM',
    '6:30 PM - 7:30 PM'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-slate-100">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-secondary animate-spin"></div>
        </div>
        <p className="mt-4 text-brand-muted text-xs font-medium">Connecting to financial advisory network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6 md:px-12 relative overflow-hidden bg-brand-bg text-slate-100">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 z-10 relative">
        <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest block mb-2">VERIFIED ADVISORY NETWORK</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Mentor Connect</h1>
        <p className="text-brand-muted text-xs md:text-sm max-w-xl leading-relaxed">
          Get personal guidance on complex topics. Connect with certified wealth advisors, financial planners, and industry experts for simulated advisory sessions.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto glass-card rounded-2xl p-6 border border-white/5 mb-10 z-10 relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search advisors, credentials, CAs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-bg/40 border border-white/10 hover:border-white/20 focus:border-brand-primary rounded-xl py-3 pl-11 pr-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Expertise Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-brand-secondary" />
          <span className="text-xs text-brand-muted font-medium">Expertise:</span>
          <select
            value={filterExpertise}
            onChange={(e) => setFilterExpertise(e.target.value)}
            className="bg-brand-bg/60 border border-white/10 text-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-primary"
          >
            {expertiseTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="max-w-7xl mx-auto z-10 relative">
        {filteredMentors.length === 0 ? (
          <div className="text-center glass-card rounded-3xl p-12 border border-white/5">
            <p className="text-brand-muted text-xs">No advisors match your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <motion.div
                key={mentor._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between hover:border-brand-primary/20 hover:shadow-glow-primary transition-all relative overflow-hidden group"
              >
                {/* Top card bar decoration */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-primary to-brand-secondary"></div>

                {/* Profile Header */}
                <div>
                  <div className="flex items-start space-x-4 mb-4">
                    {/* Mock Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary/10 to-brand-secondary/15 border border-white/10 flex items-center justify-center font-bold text-base text-brand-secondary">
                      {mentor.userId?.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <h3 className="font-extrabold text-sm text-slate-200 truncate group-hover:text-brand-secondary transition-colors">
                          {mentor.userId?.name}
                        </h3>
                        {mentor.verificationStatus === 'VERIFIED' && (
                          <BadgeCheck className="w-4.5 h-4.5 text-brand-secondary fill-brand-secondary/5 flex-shrink-0" title="Verified Professional" />
                        )}
                      </div>
                      <span className="text-[10px] text-brand-muted block font-medium mt-0.5">
                        {mentor.experience} Years Experience
                      </span>
                    </div>

                    <div className="flex items-center text-[10px] font-bold text-brand-warning bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
                      <Star className="w-3 h-3 fill-brand-warning text-brand-warning mr-1" />
                      {mentor.rating.toFixed(1)}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-brand-muted leading-relaxed mb-6 line-clamp-3">
                    {mentor.bio}
                  </p>

                  {/* Tags list */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {mentor.expertise.map((exp) => (
                      <span
                        key={exp}
                        className="text-[9px] font-bold text-slate-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer price & booking action */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <div>
                    <span className="text-[9px] text-brand-muted block uppercase font-semibold">Consultancy Fee</span>
                    <span className="text-xs font-bold text-white">₹{mentor.hourlyFee}/hr</span>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(mentor)}
                    className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl text-xs shadow-glow-primary transition-all flex items-center cursor-pointer"
                  >
                    <span>Connect Live</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* BOOKING MODAL DIALOG */}
      <AnimatePresence>
        {bookingMentor && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-bg/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full glass-card rounded-3xl p-6 md:p-8 border border-white/10 shadow-glass relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-primary to-brand-secondary"></div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-brand-secondary" />
                  <span>Book Advisory Session</span>
                </h3>
                <button
                  onClick={() => setBookingMentor(null)}
                  className="text-xs text-slate-500 hover:text-slate-200 font-bold"
                >
                  Cancel
                </button>
              </div>

              {!bookingSuccess ? (
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  {/* Expert Profile Snapshot */}
                  <div className="p-4 bg-brand-bg/60 border border-white/5 rounded-2xl flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-brand-primary/10 flex items-center justify-center font-bold text-xs text-brand-secondary">
                      {bookingMentor.userId?.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{bookingMentor.userId?.name}</h4>
                      <p className="text-[10px] text-brand-muted">{bookingMentor.expertise.slice(0, 3).join(', ')}</p>
                    </div>
                  </div>

                  {/* Date Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase block">Select Calendar Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-brand-bg/40 border border-white/10 focus:border-brand-primary rounded-xl py-3 px-4 text-xs text-slate-200 outline-none transition-all"
                    />
                  </div>

                  {/* Slot selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-muted uppercase block">Select Time Slot</label>
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map((slot) => {
                        const active = bookingSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBookingSlot(slot)}
                            className={`p-2.5 rounded-xl border text-[10px] font-bold text-center transition-all ${
                              active
                                ? 'bg-indigo-500/10 border-brand-primary text-white shadow-glow-primary'
                                : 'bg-brand-bg/50 hover:bg-white/5 border-white/5 text-slate-400'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    disabled={bookingLoading}
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl text-xs shadow-glow-primary hover:opacity-95 disabled:opacity-50 transition-all uppercase tracking-wider mt-2"
                  >
                    {bookingLoading ? 'Scheduling Booking...' : 'Reserve Video Session'}
                  </button>
                </form>
              ) : (
                /* SUCCESS PANEL */
                <div className="text-center space-y-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-brand-primary/20 flex items-center justify-center mx-auto text-brand-success">
                    <UserCheck className="w-6 h-6 text-brand-secondary" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-white">Advisory Reservation Confirmed</h4>
                    <p className="text-xs text-brand-muted leading-relaxed">
                      {bookingSuccess}
                    </p>
                  </div>

                  <div className="p-3 bg-brand-bg/50 border border-white/5 rounded-2xl flex justify-around text-xs font-semibold text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-brand-secondary" />
                      <span>{bookingDate}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-brand-secondary" />
                      <span>{bookingSlot}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookingMentor(null)}
                    className="w-full py-3 bg-brand-primary text-white text-xs font-bold rounded-xl"
                  >
                    Return to Advisors Catalogue
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Mentors;
