import React, { useState, useEffect } from 'react';
import { X, PlayCircle, Video, Loader2, Search } from 'lucide-react';
import { TutorialService, Tutorial } from '../services/TutorialService';

interface TutorialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: 'STUDENT' | 'TUTOR';
}

export const TutorialsModal: React.FC<TutorialsModalProps> = ({ isOpen, onClose, userRole }) => {
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadTutorials();
        }
    }, [isOpen]);

    const loadTutorials = async () => {
        setLoading(true);
        try {
            const data = await TutorialService.getTutorials(userRole);
            setTutorials(data);
            if (data.length > 0) {
                setSelectedTutorial(data[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredTutorials = tutorials.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getEmbedUrl = (url: string) => {
        const videoId = TutorialService.getVideoId(url);
        if (!videoId) return '';
        return `https://www.youtube.com/embed/${videoId}`;
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-0 md:p-4 animate-fade-in">
            <div className="bg-white md:rounded-3xl w-full max-w-6xl h-full md:h-[85vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">

                {/* Main Content Area (Player) */}
                <div className="flex-1 flex flex-col bg-slate-950 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition md:hidden"
                    >
                        <X size={20} />
                    </button>

                    {selectedTutorial ? (
                        <div className="flex-1 flex flex-col">
                            <div className="relative w-full h-0 pb-[56.25%] bg-black">
                                {/* Aspect Ratio 16:9 */}
                                <iframe
                                    src={getEmbedUrl(selectedTutorial.video_url)}
                                    title={selectedTutorial.title}
                                    className="absolute top-0 left-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="p-4 md:p-8 overflow-y-auto bg-slate-900 text-white flex-1">
                                <h2 className="text-xl md:text-2xl font-bold mb-2">{selectedTutorial.title}</h2>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-600/30 uppercase tracking-wide">
                                        {userRole} Tutorial
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {/* Could add duration here if we stored it */}
                                    </span>
                                </div>
                                <p className="text-slate-300 leading-relaxed max-w-3xl">
                                    {selectedTutorial.description || "No description available."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center flex-col text-slate-500 p-8 text-center">
                            {loading ? (
                                <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
                            ) : (
                                <>
                                    <Video size={48} className="mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-slate-300">Select a tutorial to watch</h3>
                                    <p className="text-slate-500 mt-2">Browse the list to find helpful guides.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar (Playlist) */}
                <div className="w-full md:w-96 bg-white border-l border-slate-200 flex flex-col h-1/2 md:h-full">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Video size={18} className="text-blue-600" /> Tutorial Library
                        </h3>
                        <button onClick={onClose} className="hidden md:block p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search tutorials..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="p-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-blue-600" /></div>
                        ) : filteredTutorials.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                {searchQuery ? 'No matching tutorials found' : 'No tutorials available yet'}
                            </div>
                        ) : (
                            filteredTutorials.map(tutorial => (
                                <button
                                    key={tutorial.id}
                                    onClick={() => setSelectedTutorial(tutorial)}
                                    className={`w-full text-left p-3 rounded-xl transition flex gap-3 group
                       ${selectedTutorial?.id === tutorial.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'}`}
                                >
                                    <div className="w-24 aspect-video bg-slate-800 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden">
                                        <PlayCircle size={20} className={`text-white absolute z-10 ${selectedTutorial?.id === tutorial.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                                        <img
                                            src={`https://img.youtube.com/vi/${TutorialService.getVideoId(tutorial.video_url)}/mqdefault.jpg`}
                                            alt=""
                                            className="w-full h-full object-cover opacity-60"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Thumb' }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm line-clamp-2 ${selectedTutorial?.id === tutorial.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                            {tutorial.title}
                                        </h4>
                                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{tutorial.description}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
