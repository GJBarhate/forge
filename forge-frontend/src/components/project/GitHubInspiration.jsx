// src/components/project/GitHubInspiration.jsx
import { useState } from 'react';
import { Github, Star, ExternalLink, Code2, Flame, TrendingUp, Users, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const LanguageColors = {
  TypeScript: 'from-blue-500 to-cyan-500',
  JavaScript: 'from-yellow-500 to-orange-500',
  Python: 'from-green-500 to-emerald-500',
  Java: 'from-red-500 to-orange-500',
  Go: 'from-cyan-500 to-blue-500',
  Rust: 'from-amber-700 to-orange-500',
  C: 'from-blue-900 to-blue-500',
  Cpp: 'from-blue-600 to-indigo-600',
  React: 'from-cyan-400 to-blue-500',
  Vue: 'from-green-500 to-emerald-500',
  default: 'from-purple-500 to-pink-500',
};

export default function GitHubInspiration({ repos = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!repos || repos.length === 0) {
    return null;
  }

  const getLanguageGradient = (language) => {
    return LanguageColors[language] || LanguageColors.default;
  };

  const topRepo = repos[0];
  const otherRepos = repos.slice(1);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple/20 via-pink/10 to-transparent rounded-2xl blur-2xl -z-10"></div>
        
        <div className="flex items-center justify-between p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-bg-3/60 to-bg-2/40 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple/20 to-pink/10 border border-purple/20">
              <Github size={24} className="text-purple-light" />
            </div>
            <div>
              <h3 className="text-xl font-display font-700 text-white">GitHub Inspiration</h3>
              <p className="text-xs text-[#9999b8] mt-1">Popular repositories that inspired your blueprint</p>
            </div>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} className="text-purple-light" /> : <ChevronDown size={20} className="text-[#9999b8]" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Featured Repo - Large Bento Card */}
          {topRepo && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple/30 via-transparent to-pink/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 -z-10"></div>
              
              <a 
                href={topRepo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-bg-3/80 via-bg-2/60 to-bg-1/40 p-8 hover:border-purple/50 transition-all duration-500 backdrop-blur-xl group/card"
              >
                {/* Grid Background Pattern */}
                <div className="absolute inset-0 opacity-5 group-hover/card:opacity-10 transition-opacity">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(168, 85, 247, .05) 25%, rgba(168, 85, 247, .05) 26%, transparent 27%, transparent 74%, rgba(168, 85, 247, .05) 75%, rgba(168, 85, 247, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(168, 85, 247, .05) 25%, rgba(168, 85, 247, .05) 26%, transparent 27%, transparent 74%, rgba(168, 85, 247, .05) 75%, rgba(168, 85, 247, .05) 76%, transparent 77%, transparent)',
                    backgroundSize: '50px 50px'
                  }}></div>
                </div>

                {/* Content */}
                <div className="relative space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getLanguageGradient(topRepo.language)} p-2 flex items-center justify-center text-white font-bold`}>
                          {topRepo.name.charAt(0).toUpperCase()}
                        </div>
                        <h4 className="text-2xl font-display font-700 text-white group-hover/card:text-purple-light transition-colors">{topRepo.name}</h4>
                      </div>
                      <p className="text-[#9999b8] text-sm mb-4 leading-relaxed">{topRepo.description}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber/10 border border-amber/20">
                      <Flame size={16} className="text-amber" />
                      <span className="text-sm font-bold text-amber">{(topRepo.stars / 1000).toFixed(1)}k</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Code2 size={16} className="text-coral" />
                        <span className="text-xs text-[#9999b8]">Language</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{topRepo.language || 'N/A'}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-teal" />
                        <span className="text-xs text-[#9999b8]">Type</span>
                      </div>
                      <span className="text-sm font-semibold text-white capitalize">{topRepo.language || 'Project'}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ExternalLink size={16} className="text-purple-light" />
                        <span className="text-xs text-[#9999b8]">Link</span>
                      </div>
                      <span className="text-sm font-semibold text-purple-light">View Repo →</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {topRepo.topics && topRepo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                      {topRepo.topics.slice(0, 5).map((topic, i) => (
                        <span key={`${topic}-${i}`} className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple/20 to-pink/10 text-purple-light rounded-full border border-purple/20 hover:border-purple/40 transition-colors">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover Accent */}
                <div className="absolute top-0 right-0 w-px h-64 bg-gradient-to-b from-purple/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 blur"></div>
              </a>
            </div>
          )}

          {/* Other Repos - Grid */}
          {otherRepos.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-display font-600 text-[#9999b8] uppercase tracking-wider px-2">Recommended References</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherRepos.map((repo, idx) => (
                  <a
                    key={`${repo.name}-${idx}`}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="group/item relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-bg-3/50 to-bg-2/30 p-5 hover:border-purple/40 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
                  >
                    {/* Animated Border */}
                    <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple/20 via-transparent to-pink/10"></div>
                    </div>

                    <div className="relative space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getLanguageGradient(repo.language)} flex items-center justify-center text-white text-xs font-bold`}>
                              {repo.name.charAt(0).toUpperCase()}
                            </div>
                            <h5 className="font-semibold text-white group-hover/item:text-purple-light transition-colors truncate">{repo.name}</h5>
                          </div>
                          <p className="text-xs text-[#9999b8] line-clamp-2">{repo.description}</p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 group-hover/item:bg-purple/10 transition-colors">
                          <Star size={12} className="text-amber fill-amber" />
                          <span className="text-xs font-bold text-amber">{(repo.stars / 1000).toFixed(1)}k</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gradient-to-r ${getLanguageGradient(repo.language)} bg-clip-text text-transparent`}>
                            <Code2 size={12} />
                            {repo.language || 'Unknown'}
                          </span>
                        </div>
                        <ExternalLink size={14} className="text-[#5f5f80] group-hover/item:text-purple-light transition-colors" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Info */}
          <div className="flex items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
            <Zap size={16} className="text-amber" />
            <span className="text-xs text-[#9999b8]">These repositories were analyzed by Gemini 2.5 Flash and used as reference during your project generation.</span>
          </div>
        </div>
      )}
    </div>
  );
}