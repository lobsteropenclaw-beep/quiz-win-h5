import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, List, Shield, Trash2, CheckCircle, ChevronRight, Calendar, Award, MessageSquare, User, HelpCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SECRET = 'admin123';

function Admin() {
  const [rounds, setRounds] = useState([]);
  const [selectedRoundEntries, setSelectedRoundEntries] = useState(null);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [form, setForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    prize: '',
    deadline: '',
    forecast: ''
  });

  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/rounds?secret=${SECRET}`);
      setRounds(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEntries = async (roundId) => {
    if (selectedRoundEntries?.roundId === roundId) {
      setSelectedRoundEntries(null);
      return;
    }
    setLoadingEntries(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/entries?secret=${SECRET}&roundId=${roundId}`);
      setSelectedRoundEntries({ roundId, data: res.data });
    } catch (err) {
      alert('Failed to fetch entries');
    }
    setLoadingEntries(false);
  };

  const handleDeleteRound = async (roundId) => {
    if (window.confirm('Are you sure you want to delete this round and all its entries?')) {
      try {
        await axios.delete(`${API_BASE}/admin/delete-round`, {
          data: { secret: SECRET, roundId }
        });
        fetchRounds();
      } catch (err) {
        alert('Failed to delete round');
      }
    }
  };

  const handleOptionChange = (idx, val) => {
    const newOptions = [...form.options];
    newOptions[idx] = val;
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/create-round`, {
        secret: SECRET,
        ...form,
        deadline: new Date(form.deadline).toISOString()
      });
      alert('Round Created!');
      fetchRounds();
      setForm({
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        prize: '',
        deadline: '',
        forecast: ''
      });
    } catch (err) {
      alert('Failed to create round');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header */}
      <div className="bg-[#6200ee] text-white px-6 py-8 shadow-lg rounded-b-[32px] mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield size={24} />
            <h1 className="text-2xl font-black tracking-tight">QUIZWIN PANEL</h1>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Admin Mode</div>
        </div>
        <p className="text-white/70 text-sm font-medium italic">"Manage rounds and crown winners"</p>
      </div>

      <div className="px-4 max-w-2xl mx-auto space-y-8">
        
        {/* Create Round Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2 text-slate-400">
            <Plus size={16} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">New Competition</h2>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase ml-1">
                  <HelpCircle size={14} className="text-primary" /> The Question
                </label>
                <input 
                  required
                  placeholder="e.g. What is the capital of Japan?"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl p-4 transition-all outline-none font-medium"
                  value={form.question}
                  onChange={e => setForm({...form, question: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase ml-1">
                  <List size={14} className="text-primary" /> Options
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {form.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                        {['A','B','C','D'][idx]}
                      </div>
                      <input 
                        required
                        placeholder={`Option ${['A','B','C','D'][idx]}`}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl p-3 transition-all outline-none text-sm"
                        value={opt}
                        onChange={e => handleOptionChange(idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correct Answer</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none text-sm font-bold text-primary appearance-none cursor-pointer"
                    value={form.correctIndex}
                    onChange={e => setForm({...form, correctIndex: e.target.value})}
                  >
                    {['A','B','C','D'].map((l, i) => <option key={i} value={i}>Choice {l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <Award size={12} /> The Prize
                  </label>
                  <input 
                    required
                    placeholder="e.g. $50 Gift Card"
                    className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none text-sm font-bold text-slate-700"
                    value={form.prize}
                    onChange={e => setForm({...form, prize: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <Calendar size={12} /> Deadline
                  </label>
                  <input 
                    required
                    type="datetime-local"
                    className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none text-sm font-medium"
                    value={form.deadline}
                    onChange={e => setForm({...form, deadline: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <MessageSquare size={12} /> Forecast
                  </label>
                  <input 
                    placeholder="Next: Math Quiz..."
                    className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none text-sm font-medium"
                    value={form.forecast}
                    onChange={e => setForm({...form, forecast: e.target.value})}
                  />
                </div>
              </div>

              <button className="w-full bg-[#6200ee] text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/30 active:scale-[0.98] transition-all hover:bg-black uppercase tracking-[0.2em] text-sm">
                Deploy Competition
              </button>
            </form>
          </div>
        </section>

        {/* Competition History Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2 text-slate-400">
            <List size={16} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">History & Participants</h2>
          </div>

          <div className="space-y-4">
            {rounds.map(r => (
              <div key={r.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-all">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1 max-w-[80%]">
                      <h3 className="font-black text-slate-800 text-lg leading-tight truncate">{r.question}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          r.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {r.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                          Prize: {r.prize}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteRound(r.id)}
                      className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => fetchEntries(r.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      {selectedRoundEntries?.roundId === r.id ? (
                        <>Hide Participants</>
                      ) : (
                        <><Plus size={14} /> View {r.id === selectedRoundEntries?.roundId ? '' : 'Entries'}</>
                      )}
                    </button>
                    {r.status === 'finished' && (
                      <div className="w-12 flex items-center justify-center bg-green-50 text-green-500 rounded-2xl">
                        <CheckCircle size={20} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Participants Drawer */}
                {selectedRoundEntries?.roundId === r.id && (
                  <div className="bg-slate-50 border-t border-slate-100 px-5 py-6">
                    <div className="flex items-center gap-2 mb-4">
                      <User size={14} className="text-slate-400" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Data</h4>
                    </div>
                    
                    {loadingEntries ? (
                      <div className="text-center py-4 text-xs font-bold text-slate-300 animate-pulse italic">Connecting to database...</div>
                    ) : (
                      <div className="space-y-2">
                        {selectedRoundEntries.data.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 text-xs font-bold uppercase italic">No entries recorded yet</div>
                        ) : (
                          selectedRoundEntries.data.map((entry, eIdx) => (
                            <div key={eIdx} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100">
                                  {entry.nickname.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-black text-slate-700 text-sm">{entry.nickname}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                                  entry.isCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'
                                }`}>
                                  Choice {['A','B','C','D'][entry.answerIndex]}
                                </span>
                                {entry.isCorrect ? <CheckCircle size={16} className="text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-red-100" />}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Admin;