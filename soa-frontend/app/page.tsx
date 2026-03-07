'use client';

import { useState, useEffect, useRef } from 'react';

interface Track {
  trackId: number | string;
  trackName?: string;
  title?: string;
  artistName?: string;
  artist?: string;
  artworkUrl100?: string;
  albumCover?: string;
  previewUrl?: string;
  primaryGenreName?: string;
}

export default function MusicSearch() {
  const [currentView, setCurrentView] = useState<'search' | 'saved'>('search');
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [page, setPage] = useState(1);
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [toast, setToast] = useState<string | null>(null);


//modalfeo
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTrack(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

 
 
 
 
 
 
 
 
 
 ///
  const fetchSearchResults = async (searchQuery: string, pageNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://soa-backend-music.onrender.com/api/music/search?q=${searchQuery}&page=${pageNumber}`);
      if (!res.ok) throw new Error('Error en el servidor');
      const data = await res.json();
      setTracks(data || []);
    } catch (err) {
      setError('Fallo la comunicacion con el servidor.');
    } finally {
      setLoading(false);
    }
  };







  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setPage(1);
    setTracks([]);
    fetchSearchResults(query, 1);
  };

  const handlePagination = (direction: 'prev' | 'next') => {
    const newPage = direction === 'next' ? page + 1 : page - 1;
    if (newPage < 1) return;
    setPage(newPage);
    fetchSearchResults(query, newPage);
  };






  const fetchSavedTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://soa-backend-music.onrender.com/api/music/favorites');
      if (!res.ok) throw new Error('Error al cargar favoritas');
      const data = await res.json();
      setSavedTracks(data || []);
    } catch (err) {
      setError('No se pudieron cargar las canciones guardadas.');
    } finally {
      setLoading(false);
    }
  };






///
  const handleSave = async (track: Track) => {
    try {
      const res = await fetch('https://soa-backend-music.onrender.com/api/music/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: String(track.trackId),
          title: track.trackName || track.title,
          artist: track.artistName || track.artist,
          albumCover: track.artworkUrl100?.replace('100x100', '300x300') || track.albumCover //la prtada pero mas grand
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setSelectedTrack(null);
      showToast(`Registro exitoso: ${track.trackName || track.title}`);
    } catch (err) {
      showToast('Error al procesar la solicitud');
    }
  };







  
  
  
  useEffect(() => {
    if (currentView === 'saved') fetchSavedTracks();
  }, [currentView]);




  

  return (
    <main className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-emerald-900 selection:text-emerald-100 relative overflow-x-hidden">
      
      <nav className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40 px-8 py-4 flex justify-center gap-12">
        <button 
          onClick={() => { setCurrentView('search'); setTracks([]); setQuery(''); }}
          className={`text-xs font-bold tracking-[0.2em] transition-all ${currentView === 'search' ? 'text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          BUSCADOR
        </button>
        <button 
          onClick={() => setCurrentView('saved')}
          className={`text-xs font-bold tracking-[0.2em] transition-all ${currentView === 'saved' ? 'text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          REGISTRO
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        {currentView === 'search' && (
          <>
            <form onSubmit={handleSearch} className="flex gap-0 mb-16 justify-center max-w-xl mx-auto group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ARTISTA O CANCION"
                className="w-full px-6 py-4 bg-zinc-900/50 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-emerald-900 transition-all placeholder:text-zinc-700 text-xs tracking-widest uppercase"
              />
              <button 
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-zinc-800 hover:bg-emerald-900 text-zinc-100 text-xs font-bold transition-all disabled:opacity-50 uppercase tracking-widest border border-zinc-800"
              >
                {loading ? '...' : 'IR'}
              </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {loading ? (
                [...Array(12)].map((_, i) => (
                  <div key={i} className="bg-zinc-900 aspect-square animate-pulse border border-zinc-800"></div>
                ))
              ) : (
                tracks.map((track) => (
                  <div 
                    key={track.trackId} 
                    onClick={() => setSelectedTrack(track)}
                    className="cursor-pointer bg-zinc-900 border border-zinc-900 flex flex-col group relative overflow-hidden transition-all hover:border-emerald-900"
                  >
                    <img 
                      src={track.artworkUrl100?.replace('100x100', '300x300')}
                      alt={track.trackName} 
                      className="w-full aspect-square object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
                    />
                  </div>
                ))
              )}
            </div>

            {tracks.length > 0 && !loading && (
              <div className="flex justify-center items-center gap-10 mt-16">
                <button onClick={() => handlePagination('prev')} disabled={page === 1} className="text-[10px] text-zinc-500 hover:text-emerald-500 disabled:opacity-0 uppercase tracking-[0.2em] transition-colors">Anterior</button>
                <span className="text-zinc-800 text-[10px] tracking-[0.3em]">PAG {page}</span>
                <button onClick={() => handlePagination('next')} className="text-[10px] text-zinc-500 hover:text-emerald-500 uppercase tracking-[0.2em] transition-colors">Siguiente</button>
              </div>
            )}
          </>
        )}

        {currentView === 'saved' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {savedTracks.map((track, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-900 flex flex-col group">
                <img src={track.albumCover} alt="cover" className="w-full aspect-square object-cover opacity-40 group-hover:opacity-80 transition-opacity" />
                <div className="p-3">
                  <h3 className="text-[10px] font-bold text-zinc-400 truncate uppercase tracking-wider">{track.title}</h3>
                  <p className="text-emerald-900 text-[9px] truncate mt-1 uppercase font-bold">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DETALLE ACTUALIZADO */}
      {selectedTrack && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedTrack(null)} // MEJORA 1: Cerrar al dar clic fuera
        >
          <div 
            className="bg-zinc-950 border border-zinc-900 p-8 max-w-sm w-full relative shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]"
            onClick={(e) => e.stopPropagation()} // Evita que clics adentro cierren el modal
          >
            {/* MEJORA 2: Boton interno mas visible */}
            <button 
              onClick={() => setSelectedTrack(null)} 
              className="absolute top-4 right-4 text-zinc-600 hover:text-emerald-500 text-[9px] tracking-widest font-black transition-colors"
            >
              VOLVER [ESC]
            </button>
            
            <img 
              src={selectedTrack.artworkUrl100?.replace('100x100', '600x600')} 
              className="w-full aspect-square object-cover mb-8 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
            />
            
            <div className="mb-8">
              <h2 className="text-sm font-bold text-zinc-100 tracking-widest uppercase mb-1">{selectedTrack.trackName}</h2>
              <p className="text-zinc-500 text-xs tracking-wider uppercase mb-3">{selectedTrack.artistName}</p>
              
              {selectedTrack.primaryGenreName && (
                <span className="inline-block px-2 py-1 border border-emerald-900 text-emerald-700 text-[9px] font-black tracking-tighter uppercase">
                  {selectedTrack.primaryGenreName}
                </span>
              )}
            </div>

            {selectedTrack.previewUrl && (
              <audio controls autoPlay className="w-full h-8 mb-8 invert opacity-50 hover:opacity-100 transition-opacity" src={selectedTrack.previewUrl}></audio>
            )}

            <button 
              onClick={() => handleSave(selectedTrack)}
              className="w-full border border-zinc-800 hover:border-emerald-800 hover:text-emerald-500 text-zinc-500 font-bold py-4 transition-all uppercase tracking-[0.2em] text-[10px]"
            >
              Confirmar Registro
            </button>
          </div>
        </div>
      )}

      {/* COMPONENTE TOAST */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[60] bg-emerald-950 border border-emerald-500/30 px-6 py-3 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <p className="text-emerald-500 text-[10px] font-bold tracking-[0.2em] uppercase">{toast}</p>
        </div>
      )}
    </main>
  );
}