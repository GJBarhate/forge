// src/components/shared/VersionHistory.jsx
import { GitBranch, Clock, ChevronRight } from 'lucide-react';

function buildTree(iterations) {
  const map = {};
  iterations.forEach((it) => (map[it.id] = { ...it, children: [] }));
  const roots = [];
  iterations.forEach((it) => {
    if (it.parentId && map[it.parentId]) map[it.parentId].children.push(map[it.id]);
    else roots.push(map[it.id]);
  });
  return roots;
}

function IterationNode({ node, depth = 0, currentId, onSelect }) {
  const isActive = node.id === currentId;
  const date = new Date(node.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group ${
          isActive
            ? 'bg-purple/15 border border-purple/25'
            : 'hover:bg-white/5 border border-transparent'
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {depth > 0 && (
          <div className="flex items-center gap-1 text-[#5f5f80]">
            <ChevronRight size={12} />
          </div>
        )}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          node.status === 'COMPLETE' ? 'bg-teal' :
          node.status === 'FAILED' ? 'bg-coral' : 'bg-amber animate-pulse'
        }`} />
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-mono truncate ${isActive ? 'text-purple-light font-500' : 'text-[#9999b8]'}`}>
            {node.id.slice(-8)}
          </p>
          <p className="text-[11px] text-[#5f5f80] flex items-center gap-1 mt-0.5">
            <Clock size={10} />
            {date}
          </p>
        </div>
      </button>

      {node.children?.map((child) => (
        <IterationNode
          key={child.id}
          node={child}
          depth={depth + 1}
          currentId={currentId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default function VersionHistory({ iterations = [], currentId, onSelect }) {
  const tree = buildTree(iterations);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <GitBranch size={13} className="text-[#5f5f80]" />
        <span className="text-xs font-mono text-[#5f5f80] uppercase tracking-wider">
          {iterations.length} version{iterations.length !== 1 ? 's' : ''}
        </span>
      </div>
      {tree.map((root) => (
        <IterationNode
          key={root.id}
          node={root}
          currentId={currentId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
