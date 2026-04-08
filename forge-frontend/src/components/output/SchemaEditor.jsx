// src/components/output/SchemaEditor.jsx
import { useState } from 'react';
import { Database, Edit3, Check, X } from 'lucide-react';
import ExportButton from '../shared/ExportButton.jsx';

export default function SchemaEditor({ schema }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const schemaText = typeof schema === 'string' ? schema : schema?.schema || '';

  const handleEditStart = () => {
    setEditValue(schemaText);
    setIsEditing(true);
  };

  // Syntax highlight keywords
  const highlight = (text) =>
    text
      .replace(/(model|enum|generator|datasource)\s+(\w+)/g, '<span class="kw-model">$1</span> <span class="kw-name">$2</span>')
      .replace(/(@id|@default|@unique|@relation|@index|@@index|@@unique|@db\.\w+)/g, '<span class="kw-decorator">$1</span>')
      .replace(/(String|Int|Float|Boolean|DateTime|Json|Bytes)\??/g, '<span class="kw-type">$&</span>')
      .replace(/\/\/.*/g, '<span class="kw-comment">$&</span>');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-amber" />
          <span className="text-sm font-display font-600 text-[#e8e8f0]">schema.prisma</span>
          <span className="badge-amber text-[11px]">Copy-paste ready</span>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton content={schemaText} filename="schema.prisma" label="schema.prisma" />
          {!isEditing ? (
            <button onClick={handleEditStart} className="btn-ghost text-xs gap-1.5">
              <Edit3 size={12} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="btn-ghost text-xs gap-1.5 text-teal">
                <Check size={12} /> Done
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-ghost text-xs">
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .kw-model    { color: #c792ea; }
        .kw-name     { color: #82aaff; }
        .kw-decorator{ color: #2dd4a0; }
        .kw-type     { color: #fcd470; }
        .kw-comment  { color: #5f5f80; font-style: italic; }
      `}</style>

      {isEditing ? (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full bg-[#0a0a12] border border-amber/25 rounded-xl p-5 text-[#a8b3c9] font-mono text-xs leading-7 outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/20 resize-none transition-all"
          rows={Math.min(40, (editValue.split('\n').length || 10) + 2)}
          spellCheck={false}
        />
      ) : (
        <div
          className="bg-[#0a0a12] border border-white/[0.07] rounded-xl p-5 font-mono text-xs leading-7 text-[#a8b3c9] overflow-x-auto whitespace-pre border-l-2 border-l-amber/50"
          dangerouslySetInnerHTML={{ __html: highlight(schemaText) }}
        />
      )}

      <div className="flex items-center gap-3 text-[11px] text-[#5f5f80] font-mono">
        <span>{schemaText.split('\n').length} lines</span>
        <span>·</span>
        <span>Run: <code className="text-teal">npx prisma migrate dev --name init</code></span>
      </div>
    </div>
  );
}
