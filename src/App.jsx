import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Timer, Send, CheckCircle2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function App() {
  const [currentRound, setCurrentRound] = useState(null);
  const [latestWinner, setLatestWinner] = useState(null);
  const [forecast, setForecast] = useState('');
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') || '');
  const [userId] = useState(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('userId', id);
    }
    return id;
  });
  const [showNicknameModal, setShowNicknameModal] = useState(!localStorage.getItem('nickname'));
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/current-round`);
      setCurrentRound(res.data.currentRound);
      setLatestWinner(res.data.latestWinner);
      setForecast(res.data.forecast);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSaveNickname = () => {
    if (nickname.trim()) {
      localStorage.setItem('nickname', nickname);
      setShowNicknameModal(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    try {
      await axios.post(`${API_BASE}/submit`, {
        roundId: currentRound.id,
        userId,
        nickname,
        answerIndex: selectedOption
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen pb-10">
      {/* Nickname Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full shadow-xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <User className="text-primary" /> Welcome!
            </h2>
            <p className="text-slate-600 mb-6">Enter a nickname to participate in the quiz and win prizes!</p>
            <input 
              className="w-full border-2 border-slate-100 rounded-2xl p-4 mb-6 focus:border-primary outline-none transition-colors"
              placeholder="Your Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <button 
              onClick={handleSaveNickname}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform"
            >
              Start Playing
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="gradient-hero text-white px-6 pt-12 pb-20 rounded-b-[40px] text-center shadow-lg">
        <div className="flex justify-center mb-4">
          <Trophy size={48} className="animate-bounce" />
        </div>
        <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-2">Current Prize</p>
        <h1 className="text-4xl font-black mb-4">{currentRound?.prize || 'Big Prize Coming Soon!'}</h1>
        {currentRound && (
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 text-sm">
            <Timer size={16} />
            <span>Deadline: {new Date(currentRound.deadline).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="px-6 -mt-10">
        {currentRound ? (
          <div className="wechat-card mb-6">
            {!submitted ? (
              <>
                <h3 className="text-xl font-bold mb-6 leading-tight">{currentRound.question}</h3>
                <div className="space-y-3 mb-8">
                  {currentRound.options.map((opt, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 active:scale-[0.98] ${
                        selectedOption === idx 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                          : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === idx ? 'border-primary bg-primary' : 'border-slate-300'
                      }`}>
                        {selectedOption === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="font-medium text-slate-700">
                        {['A', 'B', 'C', 'D'][idx]}. {opt}
                      </span>
                    </div>
                  ))}
                </div>
                <button 
                  disabled={selectedOption === null}
                  onClick={handleSubmit}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95"
                >
                  <Send size={20} /> Submit Answer
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <CheckCircle2 size={80} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Answer Recorded!</h2>
                <p className="text-slate-500">Good luck, {nickname}! The winner will be announced 1 hour after the deadline.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="wechat-card text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No Active Rounds</h2>
            <p className="text-slate-500">Wait for the next round to start!</p>
          </div>
        )}

        {/* Results Card */}
        <div className="wechat-card mb-6 border-l-4 border-l-secondary">
          <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Latest Round Winner</h4>
          {latestWinner ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xl">
                {latestWinner.nickname.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800">{latestWinner.nickname}</p>
                <p className="text-sm text-slate-500">Won: {latestWinner.prize}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 italic">Winners will appear here...</p>
          )}
        </div>

        {/* Forecast Card */}
        <div className="wechat-card bg-slate-900 text-white border-none">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Next Round Forecast</h4>
          <p className="text-lg leading-relaxed font-serif italic text-slate-200">
            "{forecast || 'The next challenge is brewing...'}"
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;