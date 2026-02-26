import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Mail, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface SlotData {
  slot: string;
  totalParticipants: number;
}

const MORNING_SLOTS = [
  '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00'
];

const AFTERNOON_SLOTS = [
  '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00'
];

const ALL_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

export default function App() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    peopleCount: 1,
    slot: ''
  });
  const [slotsData, setSlotsData] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/slots');
      const data = await res.json();
      setSlotsData(data);
    } catch (err) {
      console.error('Failed to fetch slots', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSlotStatus = (slot: string) => {
    const data = slotsData.find(s => s.slot === slot);
    const total = data ? data.totalParticipants : 0;
    return {
      total,
      isFull: total >= 15,
      remaining: 15 - total
    };
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4 font-serif">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-[#5A5A40]/10"
        >
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">Inscription Réussie !</h2>
          <p className="text-[#5A5A40] mb-8">
            Merci {formData.firstName}. Votre réservation pour {formData.peopleCount} personne(s) à {formData.slot} a été enregistrée.
          </p>
          <button 
            onClick={() => {
              setSubmitted(false);
              setFormData({ firstName: '', lastName: '', email: '', peopleCount: 1, slot: '' });
              fetchSlots();
            }}
            className="w-full bg-[#5A5A40] text-white py-4 rounded-full font-medium hover:bg-[#4A4A30] transition-colors"
          >
            Nouvelle Inscription
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] py-12 px-4 sm:px-6 lg:px-8 font-serif">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-[#1a1a1a] mb-4 tracking-tight"
          >
            Formulaire d'Inscription
          </motion.h1>
          <p className="text-lg text-[#5A5A40] italic">Réservez votre créneau de départ</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#5A5A40]/10"
        >
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Prénom */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-[#5A5A40] uppercase tracking-wider">
                  <User className="w-4 h-4 mr-2" />
                  Prénom
                </label>
                <input
                  required
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent outline-none transition-all"
                  placeholder="Jean"
                />
              </div>

              {/* Nom */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-[#5A5A40] uppercase tracking-wider">
                  <User className="w-4 h-4 mr-2" />
                  Nom
                </label>
                <input
                  required
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent outline-none transition-all"
                  placeholder="Dupont"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-[#5A5A40] uppercase tracking-wider">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent outline-none transition-all"
                  placeholder="jean.dupont@exemple.com"
                />
              </div>

              {/* Nombre de personnes */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-[#5A5A40] uppercase tracking-wider">
                  <Users className="w-4 h-4 mr-2" />
                  Nombre de personnes
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="15"
                  value={formData.peopleCount}
                  onChange={e => setFormData({ ...formData, peopleCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Créneaux */}
            <div className="space-y-4">
              <label className="flex items-center text-sm font-medium text-[#5A5A40] uppercase tracking-wider">
                <Clock className="w-4 h-4 mr-2" />
                Choisir un créneau
              </label>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Matin (10h - 12h)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {MORNING_SLOTS.map(slot => {
                      const { isFull, total } = getSlotStatus(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isFull}
                          onClick={() => setFormData({ ...formData, slot })}
                          className={`
                            relative p-3 rounded-xl border text-sm transition-all flex flex-col items-center justify-center
                            ${isFull 
                              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60' 
                              : formData.slot === slot
                                ? 'bg-[#5A5A40] border-[#5A5A40] text-white shadow-lg'
                                : 'bg-white border-gray-200 text-[#1a1a1a] hover:border-[#5A5A40] hover:bg-gray-50'
                            }
                          `}
                        >
                          <span className="font-bold">{slot}</span>
                          {isFull && (
                            <span className="text-[10px] text-red-600 italic font-medium mt-1">(complet)</span>
                          )}
                          {!isFull && (
                            <span className="text-[9px] opacity-60 mt-1">{15 - total} places</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Après-midi (14h - 16h)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {AFTERNOON_SLOTS.map(slot => {
                      const { isFull, total } = getSlotStatus(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isFull}
                          onClick={() => setFormData({ ...formData, slot })}
                          className={`
                            relative p-3 rounded-xl border text-sm transition-all flex flex-col items-center justify-center
                            ${isFull 
                              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60' 
                              : formData.slot === slot
                                ? 'bg-[#5A5A40] border-[#5A5A40] text-white shadow-lg'
                                : 'bg-white border-gray-200 text-[#1a1a1a] hover:border-[#5A5A40] hover:bg-gray-50'
                            }
                          `}
                        >
                          <span className="font-bold">{slot}</span>
                          {isFull && (
                            <span className="text-[10px] text-red-600 italic font-medium mt-1">(complet)</span>
                          )}
                          {!isFull && (
                            <span className="text-[9px] opacity-60 mt-1">{15 - total} places</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center p-4 bg-red-50 text-red-700 rounded-xl border border-red-100"
                >
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !formData.slot}
              className={`
                w-full py-5 rounded-full font-bold text-lg transition-all shadow-xl
                ${loading || !formData.slot
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#5A5A40] text-white hover:bg-[#4A4A30] active:scale-[0.98]'
                }
              `}
            >
              {loading ? 'Traitement en cours...' : "S'inscrire"}
            </button>
          </form>
        </motion.div>

        <p className="text-center mt-8 text-[#5A5A40]/60 text-sm italic">
          * Maximum 15 participants par créneau horaire.
        </p>
      </div>
    </div>
  );
}
