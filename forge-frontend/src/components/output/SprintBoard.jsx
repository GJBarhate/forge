// src/components/output/SprintBoard.jsx
import { useState } from 'react';
import { LayoutGrid, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import ExportButton from '../shared/ExportButton.jsx';

function PriorityDot({ p }) {
  return (
    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
      p === 'P0' ? 'bg-coral' : p === 'P1' ? 'bg-amber' : 'bg-teal'
    }`} />
  );
}

function TaskCard({ task }) {
  return (
    <div className="bg-bg-2 border border-white/[0.07] rounded-lg p-3 hover:border-white/[0.12] transition-colors">
      <div className="flex items-start gap-2 mb-1.5">
        <PriorityDot p={task.priority} />
        <p className="text-xs font-500 text-[#e8e8f0] leading-snug">{task.title}</p>
      </div>
      <p className="text-[11px] text-[#5f5f80] leading-relaxed mb-2 ml-4">{task.description}</p>
      <div className="flex items-center gap-1 ml-4">
        <Clock size={10} className="text-[#5f5f80]" />
        <span className="text-[11px] text-[#5f5f80] font-mono">{task.hours}h est.</span>
        <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded ${
          task.priority === 'P0' ? 'bg-coral/15 text-coral-light' :
          task.priority === 'P1' ? 'bg-amber/15 text-amber-light' : 'bg-teal/15 text-teal-light'
        }`}>{task.priority}</span>
      </div>
    </div>
  );
}

function Sprint({ sprint, index }) {
  const [collapsed, setCollapsed] = useState(false);
  const totalHours = sprint.tasks.reduce((s, t) => s + (t.hours || 0), 0);
  const p0Count = sprint.tasks.filter((t) => t.priority === 'P0').length;

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-purple/20 border border-purple/30 flex items-center justify-center font-mono text-xs text-purple-light font-700">
            {index + 1}
          </div>
          <div className="text-left">
            <p className="text-sm font-600 text-[#e8e8f0]">{sprint.name}</p>
            <p className="text-[11px] text-[#5f5f80] font-mono">
              {sprint.tasks.length} tasks · {totalHours}h total
              {p0Count > 0 && ` · ${p0Count} critical`}
            </p>
          </div>
        </div>
        {collapsed ? <ChevronDown size={14} className="text-[#5f5f80]" /> : <ChevronUp size={14} className="text-[#5f5f80]" />}
      </button>

      {!collapsed && (
        <div className="space-y-2">
          {sprint.tasks.map((task, i) => (
            <TaskCard key={i} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SprintBoard({ taskBoard }) {
  if (!taskBoard?.sprints) return null;

  const totalTasks = taskBoard.sprints.reduce((s, sp) => s + sp.tasks.length, 0);
  const totalHours = taskBoard.sprints.reduce(
    (s, sp) => s + sp.tasks.reduce((ts, t) => ts + (t.hours || 0), 0), 0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid size={15} className="text-teal" />
          <span className="text-sm font-display font-600 text-[#e8e8f0]">Sprint board</span>
          <span className="badge-teal text-[11px]">{taskBoard.sprints.length} sprints</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-[11px] text-[#5f5f80] font-mono">
            <span>{totalTasks} tasks</span>
            <span>{totalHours}h total</span>
          </div>
          <ExportButton
            content={JSON.stringify(taskBoard, null, 2)}
            filename="sprint-board.json"
            label="Board"
          />
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'P0 Critical', count: taskBoard.sprints.flatMap(s => s.tasks).filter(t => t.priority === 'P0').length, color: 'coral' },
          { label: 'P1 Important', count: taskBoard.sprints.flatMap(s => s.tasks).filter(t => t.priority === 'P1').length, color: 'amber' },
          { label: 'P2 Nice-to-have', count: taskBoard.sprints.flatMap(s => s.tasks).filter(t => t.priority === 'P2').length, color: 'teal' },
        ].map((item) => (
          <div key={item.label} className={`bg-${item.color}/5 border border-${item.color}/20 rounded-lg p-3 text-center`}>
            <p className={`text-xl font-display font-800 text-${item.color}-light`}>{item.count}</p>
            <p className="text-[11px] text-[#5f5f80] mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {taskBoard.sprints.map((sprint, i) => (
          <Sprint key={i} sprint={sprint} index={i} />
        ))}
      </div>
    </div>
  );
}
