
import React from 'react';
import { TIMER_MAX } from '../constants';

interface TimerBarProps {
  timeLeft: number;
}

export const TimerBar: React.FC<TimerBarProps> = ({ timeLeft }) => {
  const percentage = (timeLeft / TIMER_MAX) * 100;
  
  const getColor = () => {
    if (percentage > 60) return 'bg-emerald-500 shadow-emerald-500/50';
    if (percentage > 30) return 'bg-amber-500 shadow-amber-500/50';
    return 'bg-rose-500 shadow-rose-500/50';
  };

  return (
    <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
      <div 
        className={`h-full transition-all duration-100 ease-linear shadow-lg ${getColor()}`}
        style={{ width: `${Math.max(0, percentage)}%` }}
      />
    </div>
  );
};
