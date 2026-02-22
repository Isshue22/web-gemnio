import React from 'react';
import { TrendingUp, Clock, BookOpen, Flame, Play, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

const data = [
  { name: 'Mon', minutes: 45 },
  { name: 'Tue', minutes: 52 },
  { name: 'Wed', minutes: 38 },
  { name: 'Thu', minutes: 65 },
  { name: 'Fri', minutes: 48 },
  { name: 'Sat', minutes: 80 },
  { name: 'Sun', minutes: 42 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto h-full bg-zinc-950 text-white pb-24 sm:pb-8">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1 sm:mb-2">Welcome back, John</h1>
          <p className="text-zinc-400 text-sm sm:text-base">You've completed 72% of your weekly goal. Keep it up!</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm sm:text-base">
          <Play className="w-4 h-4 sm:w-5 h-5 fill-current" />
          Continue Lesson
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Daily Streak', value: '14 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Total Minutes', value: '1,240', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Vocabulary', value: '842 Words', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Avg. Accuracy', value: '92%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-800"
          >
            <div className={`${stat.bg} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
              <stat.icon className={`${stat.color} w-5 h-5 sm:w-6 h-6`} />
            </div>
            <p className="text-zinc-500 text-[10px] sm:text-sm font-medium">{stat.label}</p>
            <p className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-zinc-900 p-5 sm:p-8 rounded-3xl border border-zinc-800">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold">Learning Activity</h3>
            <select className="bg-zinc-800 border-none rounded-lg text-xs px-2 py-1 sm:px-3 sm:py-1.5 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[200px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="minutes" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMinutes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 p-5 sm:p-8 rounded-3xl border border-zinc-800 flex flex-col">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Recent Sessions</h3>
          <div className="space-y-3 sm:space-y-4 flex-1">
            {[
              { lang: 'Spanish', topic: 'Travel & Dining', date: '2h ago', duration: '15m' },
              { lang: 'French', topic: 'Business Basics', date: 'Yesterday', duration: '22m' },
              { lang: 'Spanish', topic: 'Casual Conversation', date: 'Oct 20', duration: '10m' },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl hover:bg-zinc-800 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold group-hover:bg-emerald-500 group-hover:text-black transition-colors shrink-0">
                    {session.lang[0]}
                  </div>
                  <div>
                    <p className="font-medium text-xs sm:text-sm">{session.topic}</p>
                    <p className="text-[10px] sm:text-xs text-zinc-500">{session.lang} • {session.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-zinc-500">
                  <span className="text-[10px] sm:text-xs">{session.duration}</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 sm:py-3 border border-zinc-800 rounded-xl text-xs sm:text-sm font-medium hover:bg-zinc-800 transition-colors">
            View All History
          </button>
        </div>
      </div>
    </div>
  );
};
