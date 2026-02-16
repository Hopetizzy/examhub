import React from 'react';
import { Calendar, ExternalLink, TrendingUp, Bell } from 'lucide-react';

interface NewsItem {
    id: string;
    source: 'JAMB' | 'WAEC' | 'NECO';
    title: string;
    excerpt: string;
    date: string;
    url: '#';
    color: string;
}

const MOCK_NEWS: NewsItem[] = [
    {
        id: '1',
        source: 'JAMB',
        title: '2025 UTME Registration Deadline Extended',
        excerpt: 'The Joint Admissions and Matriculation Board has announced a two-week extension for the 2025 UTME registration process due to...',
        date: '2 hrs ago',
        url: '#',
        color: 'bg-green-600'
    },
    {
        id: '2',
        source: 'WAEC',
        title: 'Release of 2024 WASSCE Results',
        excerpt: 'Candidates can now check their West African Senior School Certificate Examination results on the official portal starting from...',
        date: '5 hrs ago',
        url: '#',
        color: 'bg-blue-600'
    },
    {
        id: '3',
        source: 'JAMB',
        title: 'New Policy on Biometric Verification',
        excerpt: 'Candidates are advised that biometric verification is now mandatory for all exam centers to curb malpractice...',
        date: '1 day ago',
        url: '#',
        color: 'bg-green-600'
    },
    {
        id: '4',
        source: 'NECO',
        title: 'SSCE Internal Timetable Released',
        excerpt: 'The National Examinations Council has released the final timetable for the 2025 Senior School Certificate Examination...',
        date: '2 days ago',
        url: '#',
        color: 'bg-purple-600'
    }
];

export const NewsSection: React.FC = () => {
    return (
        <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                            <Bell size={12} /> Breaking Updates
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Latest Exam News</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                            Stay ahead with real-time updates from official examination bodies. Don't miss deadlines or policy changes.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline">
                        View All Updates <ExternalLink size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MOCK_NEWS.map((news) => (
                        <div key={news.id} className="group bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-black/20 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`${news.color} text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider`}>
                                    {news.source}
                                </span>
                                <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                                    <Calendar size={12} /> {news.date}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                {news.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3">
                                {news.excerpt}
                            </p>
                            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    Read More <TrendingUp size={12} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
