import React, { useState, useEffect, useMemo } from 'react';

const NeuralActivityGraph = ({ streak = 0, skillScore = 0, completedTasks = 0 }) => {
  const [matrix, setMatrix] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Generate 365 days of graph
  // BUT only populate "real" data for the days since the user created their account (their streak)
  useEffect(() => {
    const today = new Date();
    const newMatrix = [];
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      let intensity = 0;
      let tasks = 0;
      
      // ONLY show activity if this date is within the user's actual account lifespan
      const isWithinLifespan = i < streak || i === 0;
      
      if (isWithinLifespan) {
        if (i === 0) {
          // TODAY: Use exactly the real data from Firebase
          tasks = completedTasks;
          if (tasks === 0) intensity = 0;
          else if (tasks <= 2) intensity = 1;
          else if (tasks <= 4) intensity = 2;
          else if (tasks <= 6) intensity = 3;
          else intensity = 4;
        } else {
          // PAST DAYS: We don't have historical arrays in DB yet, but they have a streak
          // meaning they logged in. Show a baseline 1 task to indicate activity.
          // Absolutely NO Math.random() so it stays consistent on refresh.
          tasks = 1;
          intensity = 1;
        }
      }

      newMatrix.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        intensity,
        tasks,
        month: date.getMonth(),
        dayOfWeek: date.getDay()
      });
    }
    
    setMatrix(newMatrix);
  }, [streak, skillScore]);

  const totalContributions = useMemo(() => {
    return matrix.reduce((sum, node) => sum + node.tasks, 0);
  }, [matrix]);

  // Pure GitHub-style colors using your neon primary
  const getColor = (intensity) => {
    if (intensity === 0) return '#161b22'; // GitHub dark mode empty cell
    if (intensity === 1) return 'rgba(13, 235, 161, 0.4)';
    if (intensity === 2) return 'rgba(13, 235, 161, 0.6)';
    if (intensity === 3) return 'rgba(13, 235, 161, 0.8)';
    return '#0deba1'; // Max intensity
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="card mb-8">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-gray-200">
          {totalContributions} contributions in the last year
        </h2>
        <div className="flex gap-2 items-center text-sm text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ background: getColor(i) }}></div>
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-max flex gap-3">
          
          {/* Day Labels (Mon, Wed, Fri) */}
          <div className="flex flex-col gap-1 text-xs text-gray-500 mt-[22px] pr-2">
            <span className="h-3.5"></span>
            <span className="h-3.5 leading-snug">Mon</span>
            <span className="h-3.5"></span>
            <span className="h-3.5 leading-snug">Wed</span>
            <span className="h-3.5"></span>
            <span className="h-3.5 leading-snug">Fri</span>
            <span className="h-3.5"></span>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Month Labels */}
            <div className="flex text-xs text-gray-500 mb-1" style={{ gap: '38px' }}>
              {months.map((m, i) => <span key={i}>{m}</span>)}
            </div>
            
            {/* The Grid Container - GitHub style but larger dimensions */}
            <div className="grid grid-rows-7 grid-flow-col gap-1">
              {matrix.map((node, i) => (
                <div 
                  key={i}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="w-3.5 h-3.5 rounded-sm transition-colors cursor-pointer outline outline-1 outline-white/5"
                  style={{ background: getColor(node.intensity) }}
                >
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* GitHub-style Tooltip */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-200 z-20 ${hoveredNode ? 'opacity-100' : 'opacity-0'}`}>
          {hoveredNode && (
            <div className="bg-gray-800 text-gray-200 text-sm py-2 px-4 rounded shadow-xl border border-gray-700 whitespace-nowrap">
              <span className="font-bold text-white">{hoveredNode.tasks === 0 ? 'No' : hoveredNode.tasks} contributions</span> on {hoveredNode.date}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NeuralActivityGraph;
