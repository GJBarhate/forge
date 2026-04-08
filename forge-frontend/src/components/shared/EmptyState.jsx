// src/components/shared/EmptyState.jsx
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      {Icon && (
        <div className="relative mb-8">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple/20 via-pink/10 to-transparent rounded-2xl blur-2xl"></div>
          
          {/* Icon container */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-purple/20 to-pink/10 border border-purple/20 flex items-center justify-center hover:border-purple/40 transition-colors">
            <Icon size={32} className="text-purple-light" />
          </div>
        </div>
      )}
      
      <h3 className="font-display font-700 text-2xl text-white mb-3">{title}</h3>
      
      {description && (
        <p className="text-[#9999b8] text-sm max-w-sm mb-8 leading-relaxed">{description}</p>
      )}
      
      {action && (
        <div className="flex gap-3">
          {action}
        </div>
      )}
    </div>
  );
}
