// src/components/output/ComponentTree.jsx
import { useState } from 'react';
import { ChevronDown, ChevronRight, Code2, Box } from 'lucide-react';
import ExportButton from '../shared/ExportButton.jsx';

function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;
  const hasProps = Object.keys(node.props || {}).length > 0;

  const depthColors = ['text-purple-light', 'text-teal-light', 'text-amber-light', 'text-coral-light'];
  const nameColor = depthColors[depth % depthColors.length];

  return (
    <div>
      <div
        className={`flex items-start gap-2 group py-1 rounded-lg transition-colors hover:bg-white/[0.03] pr-2 ${depth > 0 ? 'pl-' + (depth * 4 + 2) : 'pl-2'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          type="button"
          onClick={() => hasChildren && setOpen(!open)}
          className="mt-0.5 text-[#5f5f80] flex-shrink-0 w-4 h-4 flex items-center justify-center"
        >
          {hasChildren ? (
            open ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          ) : (
            <Box size={10} className="opacity-30" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <span className={`font-mono text-xs font-500 ${nameColor}`}>&lt;{node.name}</span>
          {hasProps && (
            <span className="text-[#5f5f80] font-mono text-[11px] ml-1">
              {Object.entries(node.props).slice(0, 2).map(([k, v]) => (
                ` ${k}={${JSON.stringify(v)}}`
              )).join('')}
              {Object.keys(node.props).length > 2 ? ' …' : ''}
            </span>
          )}
          <span className={`font-mono text-xs font-500 ${nameColor}`}>{hasChildren ? '>' : ' />'}</span>
        </div>
      </div>

      {hasChildren && open && (
        <div>
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} depth={depth + 1} />
          ))}
          <div
            className="font-mono text-xs py-1"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <span className={nameColor}>&lt;/{node.name}&gt;</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComponentTree({ componentTree }) {
  if (!componentTree) return null;

  const countNodes = (node) =>
    1 + (node.children?.reduce((sum, c) => sum + countNodes(c), 0) || 0);
  const total = countNodes(componentTree);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 size={15} className="text-purple" />
          <span className="text-sm font-display font-600 text-[#e8e8f0]">Component hierarchy</span>
          <span className="badge-purple text-[11px]">{total} component{total !== 1 ? 's' : ''}</span>
        </div>
        <ExportButton
          content={JSON.stringify(componentTree, null, 2)}
          filename="component-tree.json"
          label="Tree"
        />
      </div>

      <div className="bg-[#0a0a12] border border-white/[0.07] border-l-2 border-l-purple/50 rounded-xl p-4 overflow-x-auto">
        <TreeNode node={componentTree} />
      </div>

      <p className="text-[11px] text-[#5f5f80] font-mono">
        Click nodes to expand/collapse · Props shown inline · Depth-colored by layer
      </p>
    </div>
  );
}
