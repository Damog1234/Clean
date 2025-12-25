import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

export default function GenLayerDashboard() {
  const [name, setName] = useState('');
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cardRef = useRef(null);

  const getRoleInfo = (level) => {
    if (level >= 54) return { name: 'SINGULARITY', color: 'text-[#22C55E]', glow: 'shadow-[0_0_30px_rgba(34,197,94,0.4)]' };
    if (level >= 36) return { name: 'BRAIN', color: 'text-[#A855F7]', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]' };
    if (level >= 18) return { name: 'SYNAPSE', color: 'text-[#3B82F6]', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]' };
    if (level >= 7)  return { name: 'CELL', color: 'text-[#FB923C]', glow: 'shadow-[0_0_30px_rgba(251,146,60,0.4)]' };
    return { name: 'MOLECULE', color: 'text-[#FACC15]', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.4)]' };
  };

  useEffect(() => {
    fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!name) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`/api/stats?username=${encodeURIComponent(name)}`);
      const result = await res.json();
      if (res.status === 404) setError("User not found in Top 5000.");
      else setData(result);
    } catch (e) { setError("Deep Scan failed. Try again."); }
    setLoading(false);
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: '#000000', useCORS: true, scale: 2 });
    const link = document.createElement('a');
    link.download = `${data.username}-genlayer.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen text-white bg-black font-sans p-6 md:p-12 relative overflow-x-hidden">
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000')] bg-cover opacity-10"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <img src="https://docs.genlayer.com/img/logo.svg" className="h-12 mx-auto mb-4" alt="GenLayer" />
          <h1 className="text-blue-500 font-mono text-[10px] tracking-[0.5em] uppercase font-bold">Network Operator Deep Scan</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div className="relative">
              <input 
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500/50 text-lg"
                placeholder="Discord Username..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} className="absolute right-2 top-2 bottom-2 px-8 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all">
                {loading ? 'SCANNING...' : 'SCAN'}
              </button>
            </div>

            {error && <p className="text-red-500 text-center font-mono text-xs uppercase">{error}</p>}

            {data && (
              <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-300">
                <div ref={cardRef} className={`w-full p-10 rounded-[2.5rem] bg-[#050505] border border-white/10 relative ${getRoleInfo(data.level).glow}`}>
                  <div className="flex items-center gap-6 mb-8">
                    <img src={`https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`} crossOrigin="anonymous" className="w-24 h-24 rounded-full border-4 border-white/5" onError={(e) => e.target.src="https://cdn.discordapp.com/embed/avatars/0.png"} />
                    <div>
                      <h2 className="text-4xl font-black tracking-tighter uppercase">{data.username}</h2>
                      <p className="text-blue-400 font-mono text-sm">RANK #{data.rank}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 p-6 rounded-2xl text-center"><p className="text-[10px] text-gray-500 mb-1">LEVEL</p><p className="text-4xl font-black">{data.level}</p></div>
                    <div className="bg-white/5 p-6 rounded-2xl text-center"><p className="text-[10px] text-gray-500 mb-1">XP</p><p className="text-4xl font-black">{data.xp.toLocaleString()}</p></div>
                  </div>
                  <div className="text-center pt-6 border-t border-white/5">
                    <div className={`text-6xl font-black italic tracking-tighter ${getRoleInfo(data.level).color}`}>{getRoleInfo(data.level).name}</div>
                  </div>
                </div>
                <button onClick={downloadCard} className="bg-white/10 border border-white/10 px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-all text-xs tracking-widest uppercase">📥 Download Image</button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-6 h-fit backdrop-blur-md">
            <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-6">Global Top 10</h3>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div key={user.id} onClick={() => { setName(user.username); }} className="flex items-center justify-between p-3 rounded-xl bg-black/40 hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5 group">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-gray-600 text-[10px]">#{user.rank}</span>
                    <span className="font-bold text-sm group-hover:text-blue-400">{user.username}</span>
                  </div>
                  <div className={`text-[9px] font-bold px-2 py-1 rounded border border-current ${getRoleInfo(user.level).color}`}>L{user.level}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }
