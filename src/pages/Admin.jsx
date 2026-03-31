import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, List, Shield, Trash2, CheckCircle } from 'lucide-react';

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
    setLoadingEntries(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/entries?secret=${SECRET}&roundId=${roundId}`);
      setSelectedRoundEntries({ roundId, data: res.data });
    } catch (err) {
      alert('Failed to fetch entries');
    }
    setLoadingEntries(false);
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
    <div className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="text-primary" size={32} />
        <h1 className="text-3xl font-black text-slate-800">Admin Dashboard</h1>
      </div>

      {/* Create Round Form */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Plus size={20} className="text-primary" /> Create New Round
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Question</label>
            <input 
              required
              className="w-full border-2 border-slate-50 rounded-xl p-3 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
              value={form.question}
              onChange={e => setForm({...form, question: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {form.options.map((opt, idx) => (
              <div key={idx}>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Option {['A','B','C','D'][idx]}</label>
                <input 
                  required
                  className="w-full border-2 border-slate-50 rounded-xl p-3 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                  value={opt}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Correct Answer</label>
              <select 
                className="w-full border-2 border-slate-50 rounded-xl p-3 bg-slate-50 focus:bg-white outline-none"
                value={form.correctIndex}
                onChange={e => setForm({...form, correctIndex: e.target.value})}
              >
                {['A','B','C','D'].map((l, i) => <option key={i} value={i}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Prize</label>
              <input 
                required
                className="w-full border-2 border-slate-50 rounded-xl p-3 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                value={form.prize}
                onChange={e => setForm({...form, prize: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Deadline</label>
              <input 
                required
                type="datetime-local"
                className="w-full border-2 border-slate-50 rounded-xl p-3 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                value={form.deadline}
                onChange={e => setForm({...form, deadline: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Next Round Forecast</label>
              <input 
                className="w-full border-2 border-slate-50 rounded-xl p-3 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                value={form.forecast}
                onChange={e => setForm({...form, forecast: e.target.value})}
              />
            </div>
          </div>

          <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 mt-4 active:scale-[0.98] transition-transform">
            Launch Competition
          </button>
        </form>
      </div>

      {/* Rounds List */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <List size={20} className="text-primary" /> History & Status
        </h2>
        <div className="space-y-4">
          {rounds.map(r => (
            <div key={r.id} className="p-4 border-b border-slate-50 last:border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-700">{r.question}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-tighter">Prize: {r.prize} • Status: {r.status}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => fetchEntries(r.id)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors"
                  >
                    View Entries
                  </button>
                  {r.status === 'finished' && <CheckCircle className="text-green-500" size={20} />}
                </div>
              </div>

              {selectedRoundEntries?.roundId === r.id && (
                <div className="mt-4 bg-slate-50 rounded-2xl p-4 overflow-hidden">
                  <h4 className="text-xs font-black text-slate-400 uppercase mb-3">Participants</h4>
                  {loadingEntries ? <p>Loading...</p> : (
                    <div className="space-y-2">
                      {selectedRoundEntries.data.length === 0 ? <p className="text-sm text-slate-400">No entries yet.</p> : 
                        selectedRoundEntries.data.map((entry, eIdx) => (
                          <div key={eIdx} className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-600">{entry.nickname}</span>
                            <div className="flex gap-2 items-center">
                              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                                Choice: {['A','B','C','D'][entry.answerIndex]}
                              </span>
                              {entry.isCorrect ? 
                                <span className="text-green-600 font-bold">✓</span> : 
                                <span className="text-red-400">✗</span>
                              }
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;