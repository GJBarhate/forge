// forge-frontend/src/pages/NewProjectPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';
import { useAuthStore } from '../store/authStore.js';
import { Zap, ChevronDown, ChevronUp, Loader2, Mic, Image, Globe, FileText, Key } from 'lucide-react';
import VoiceCapture from '../components/input/VoiceCapture.jsx';
import ImageDropzone from '../components/input/ImageDropzone.jsx';
import CompetitorInput from '../components/input/CompetitorInput.jsx';
import { forgeService } from '../services/forgeService.js';
import { projectService } from '../services/projectService.js';
import PremiumLoadingState from '../components/shared/PremiumLoadingState.jsx';

const SECTIONS = [
  { key: 'voice', label: 'Voice brain-dump', Icon: Mic, color: 'purple', hint: 'Describe your idea out loud or type it.' },
  { key: 'image', label: 'Whiteboard sketch', Icon: Image, color: 'teal', hint: 'Upload a photo of your sketch or diagram.' },
  { key: 'text',  label: 'Additional context', Icon: FileText, color: 'amber', hint: 'Paste extra details, requirements, or constraints.' },
  { key: 'competitor', label: 'Competitor URL', Icon: Globe, color: 'coral', hint: 'Optional: add a competitor for differentiated positioning.' },
];

function SectionPanel({ section, open, onToggle, children }) {
  const { label, Icon, color, hint } = section;
  return (
    <div className={`border rounded-xl transition-all duration-200 ${open ? `border-${color}/30 bg-${color}/5` : 'border-white/[0.07] bg-bg-3'}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg bg-${color}/15 border border-${color}/25 flex items-center justify-center flex-shrink-0`}>
            <Icon size={14} className={`text-${color}-light`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-display font-600 text-[#e8e8f0]">{label}</p>
            {!open && <p className="text-xs text-[#5f5f80] mt-0.5">{hint}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={15} className="text-[#5f5f80]" /> : <ChevronDown size={15} className="text-[#5f5f80]" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

export default function NewProjectPage() {
  const navigate = useNavigate();
  const { joinJob, onJobComplete } = useSocket();
  const { getGeminiApiKey, user } = useAuthStore();
  const queryClient = useQueryClient();

  const [openSection, setOpenSection] = useState('voice');
  const [projectName, setProjectName] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [image, setImage] = useState({ base64: null, mimeType: null });
  const [textInput, setTextInput] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProjectId, setGeneratedProjectId] = useState(null);
  const [generatedJobId, setGeneratedJobId] = useState(null);

  const toggleSection = (key) => setOpenSection((prev) => (prev === key ? null : key));

  // Poll for project status after generation starts
  const { data: projectStatus } = useQuery({
    queryKey: ['generating-project', generatedProjectId],
    queryFn: async () => {
      if (!generatedProjectId) return null;
      try {
        const result = await projectService.getById(generatedProjectId);
        return result;
      } catch (err) {
        console.error('Poll error:', err);
        return null;
      }
    },
    enabled: !!generatedProjectId && isGenerating,
    refetchInterval: (data) => {
      if (!generatedProjectId || !isGenerating) return false;
      if (data?.status === 'PROCESSING') return 3000;
      if (data?.status === 'COMPLETE' || data?.status === 'FAILED') return false;
      return 3000;
    },
    staleTime: 0,
    retry: 1,
  });

  // Show celebration when project completes
  useEffect(() => {
    if (!projectStatus || !generatedProjectId) return;
    
    if (projectStatus.status === 'COMPLETE') {
      // Navigate directly to project page (no celebration)
      navigate(`/project/${generatedProjectId}`, { replace: true });
      setIsGenerating(false);
    }
    
    if (projectStatus.status === 'FAILED') {
      setIsGenerating(false);
      toast.error('Blueprint generation failed');
    }
  }, [projectStatus?.status, generatedProjectId, navigate]);

  // Listen for socket completion
  useEffect(() => {
    if (!generatedProjectId) return;
    
    let mounted = true;
    const unsubscribe = onJobComplete((data) => {
      if (mounted && data.projectId === generatedProjectId) {
        queryClient.invalidateQueries({ queryKey: ['generating-project', generatedProjectId] });
      }
    });
    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [generatedProjectId, onJobComplete, queryClient]);

  const hasInput = voiceTranscript.trim() || image.base64 || textInput.trim();

  const handleGenerate = async () => {
    if (!hasInput || isGenerating) return;

    // Check if user has credits OR personal API key
    const userApiKey = getGeminiApiKey();
    const userCredits = user?.creditsBalance || 0;

    if (!userApiKey && userCredits <= 0) {
      toast.error('❌ You need either a personal Gemini API key or purchase credits to generate projects.');
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        voiceTranscript: voiceTranscript.trim() || undefined,
        imageBase64: image.base64 || undefined,
        imageType: image.mimeType || undefined,
        textInput: textInput.trim() || undefined,
        competitorUrl: competitorUrl.trim() || undefined,
        projectName: projectName.trim() || undefined,
        userGeminiApiKey: userApiKey || undefined,
      };

      const result = await forgeService.generate(payload);
      const jobId = result.jobId || result.data?.jobId;
      const projectId = result.projectId || result.data?.projectId;
      
      if (!projectId || !jobId) throw new Error("No project or job ID returned");

      console.log("✅ Project created with ID:", projectId);
      console.log("✅ Job created with ID:", jobId);
      
      setGeneratedProjectId(projectId);
      setGeneratedJobId(jobId);
      joinJob(jobId);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setGeneratedProjectId(null);
      setGeneratedJobId(null);
      
      // Handle rate limit errors
      if (err?.response?.status === 429) {
        toast.error('⏳ Rate limit reached. You can generate 100 blueprints per hour. Please wait a moment and try again.');
        return;
      }
      
      toast.error(err?.response?.data?.error || 'Failed to start generation');
    }
  };

  return (
    <>
      <div className="page-container max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-purple/20 border border-purple/30 flex items-center justify-center">
              <Zap size={13} className="text-purple-light" />
            </div>
            <h1 className="section-title text-xl">New project</h1>
          </div>
          <p className="text-sm text-[#9999b8]">
            Add at least one input. Mix and match for the best blueprint.
          </p>
        </div>

        {/* Project name */}
        <div className="mb-5">
          <label className="label-base">Project name <span className="text-[#5f5f80]">(optional)</span></label>
          <input
            type="text"
            className="input-base"
            placeholder="e.g. TaskFlow Pro..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-3 mb-6">
          <SectionPanel section={SECTIONS[0]} open={openSection === 'voice'} onToggle={() => toggleSection('voice')}>
            <VoiceCapture value={voiceTranscript} onChange={setVoiceTranscript} disabled={isGenerating} />
          </SectionPanel>

          <SectionPanel section={SECTIONS[1]} open={openSection === 'image'} onToggle={() => toggleSection('image')}>
            <ImageDropzone value={image.base64} mimeType={image.mimeType} onChange={setImage} disabled={isGenerating} />
          </SectionPanel>

          <SectionPanel section={SECTIONS[2]} open={openSection === 'text'} onToggle={() => toggleSection('text')}>
            <textarea 
              rows={4} 
              className="input-base resize-none text-sm" 
              placeholder="Extra context, requirements..." 
              value={textInput} 
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isGenerating}
            />
          </SectionPanel>

          <SectionPanel section={SECTIONS[3]} open={openSection === 'competitor'} onToggle={() => toggleSection('competitor')}>
            <CompetitorInput value={competitorUrl} onChange={setCompetitorUrl} disabled={isGenerating} />
          </SectionPanel>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!hasInput || isGenerating}
          className={`btn-primary w-full justify-center py-4 text-base gap-3 transition-all ${
            isGenerating 
              ? 'bg-gradient-to-r from-purple to-teal pulse-glow' 
              : ''
          } ${!hasInput || isGenerating ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Forging your blueprint...</span>
            </>
          ) : (
            <>
              <Zap size={18} />
              {getGeminiApiKey() 
                ? 'Forge blueprint with YOUR key' 
                : 'Forge blueprint with Gemini 2.5 Flash'}
            </>
          )}
        </button>
      </div>

      {/* Loading state - show while generating */}
      {isGenerating && generatedProjectId && generatedJobId && (
        <PremiumLoadingState 
          jobId={generatedJobId}
          projectId={generatedProjectId}
        />
      )}
    </>
  );
}
