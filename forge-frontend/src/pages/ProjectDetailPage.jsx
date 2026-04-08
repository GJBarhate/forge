// src/pages/ProjectDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';
import { projectService } from '../services/projectService.js';
import PrdViewer from '../components/output/PrdViewer.jsx';
import SchemaEditor from '../components/output/SchemaEditor.jsx';
import ComponentTree from '../components/output/ComponentTree.jsx';
import SprintBoard from '../components/output/SprintBoard.jsx';
import VersionHistory from '../components/shared/VersionHistory.jsx';
import PremiumLoadingState from '../components/shared/PremiumLoadingState.jsx';
import EnhancedLoadingState from '../components/shared/EnhancedLoadingState.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import GitHubInspiration from '../components/project/GitHubInspiration.jsx';
import ExportDropdown from '../components/shared/ExportDropdown.jsx';
import ShareButton from '../components/shared/ShareButton.jsx';
import IterationModal from '../components/shared/IterationModal.jsx';
import { ChevronLeft, RefreshCw, RotateCcw, Loader2, AlertCircle } from 'lucide-react';

const TABS = [
  { key: 'prd', label: 'PRD', artifact: 'PRD' },
  { key: 'schema', label: 'Schema', artifact: 'SCHEMA' },
  { key: 'components', label: 'Components', artifact: 'COMPONENT_TREE' },
  { key: 'sprints', label: 'Sprints', artifact: 'TASK_BOARD' },
];

function StatusIndicator({ status }) {
  if (status === 'COMPLETE') return <span className="w-2 h-2 rounded-full bg-teal inline-block" />;
  if (status === 'FAILED') return <span className="w-2 h-2 rounded-full bg-coral inline-block" />;
  return <span className="w-2 h-2 rounded-full bg-amber animate-pulse inline-block" />;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onJobComplete } = useSocket();

  const [activeTab, setActiveTab] = useState('prd');
  const [showHistory, setShowHistory] = useState(false);
  const [showIterationModal, setShowIterationModal] = useState(false);
  const [isReiterating, setIsReiterating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [newIterationJobId, setNewIterationJobId] = useState(null);

  const { data: project, isLoading, isError, refetch, status } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id),
    refetchInterval: (data) => {
      // Only refetch if PROCESSING, and space out refetches to reduce lag
      if (data?.status === 'PROCESSING') return 3000; // Every 3 seconds instead of 2
      return false;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  const { data: iterations = [] } = useQuery({
    queryKey: ['iterations', id],
    queryFn: () => projectService.getIterations(id),
    enabled: !!project,
    refetchInterval: (data) => {
      // Only refetch if PROCESSING
      if (project?.status === 'PROCESSING') return 3000; // Every 3 seconds
      return false;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  // Keep loading state visible during initial load or while processing
  useEffect(() => {
    if (project && initialLoad) {
      setInitialLoad(false);
    }
  }, [project, initialLoad]);

  useEffect(() => {
    const unsubscribe = onJobComplete((data) => {
      if (data.projectId === id) {
        setInitialLoad(false);
        refetch();
        queryClient.invalidateQueries({ queryKey: ['iterations', id] });
      }
    });
    return unsubscribe;
  }, [onJobComplete, id, refetch, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple/20 to-teal/20 blur-xl animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-light animate-spin" />
              </div>
            </div>
          </div>
          <p className="text-white text-sm">Loading project details...</p>
          <p className="text-[#5f5f80] text-xs">You can still navigate using the sidebar</p>
        </div>
      </div>
    );
  }

  if (initialLoad && project?.status === 'PROCESSING') {
    // Get jobId from the latest iteration (first in descending order)
    const latestIteration = project?.iterations?.[0];
    const jobId = latestIteration?.jobId;
    
    if (!jobId) {
      console.warn('⚠️  No jobId found in iterations, waiting for data...');
      return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple/20 to-teal/20 blur-xl animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-purple-light animate-spin" />
                </div>
              </div>
            </div>
            <p className="text-white text-sm">Loading project details...</p>
          </div>
        </div>
      );
    }
    
    console.log('✅ Using jobId from iteration:', jobId);
    return <PremiumLoadingState jobId={jobId} projectId={id} />;
  }

  if (isError || !project) {
    const handleErrorRefresh = async () => {
      try {
        // Invalidate query cache to force fresh fetch
        await queryClient.invalidateQueries({ queryKey: ['project', id] });
        
        // Try to refetch the current project by ID from the URL
        const freshProject = await projectService.getById(id);
        if (freshProject && freshProject.id) {
          console.log('✅ Got fresh project, navigating to:', freshProject.id);
          // Refetch will trigger component re-render
          await refetch();
          return;
        }
      } catch (err) {
        console.error('Error fetching current project by ID:', err.message);
      }

      // If that fails, try to fetch all projects and use the first one
      try {
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
        const allProjects = await projectService.getAll();
        if (allProjects && allProjects.length > 0) {
          // Find the most recent project or use the first one
          const latestProject = allProjects.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
          console.log('✅ Navigating to latest project:', latestProject.id);
          navigate(`/project/${latestProject.id}`, { replace: true });
          return;
        }
      } catch (err) {
        console.error('Error fetching all projects:', err.message);
      }

      // Only go to dashboard if everything fails
      toast.error('Unable to load project');
      navigate('/dashboard', { replace: true });
    };

    return (
      <>
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg p-12 max-w-xl mx-4 border border-emerald-500/50 shadow-2xl pointer-events-auto relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-emerald-500/20 to-cyan-500/20 blur-2xl -z-10" />
            
            {/* Info icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <AlertCircle className="w-20 h-20 text-blue-400 animate-bounce" />
              </div>
            </div>

            {/* Main message */}
            <h2 className="text-3xl font-bold text-white text-center mb-2">
              Project Loading
            </h2>
            
            <p className="text-base text-gray-300 text-center mb-8 font-medium">
              Your project is being generated or processed. You can check the dashboard or refresh to see the latest status.
            </p>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  navigate('/dashboard', { replace: true });
                }}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
              >
                📊
                Dashboard
              </button>
              <button
                onClick={handleErrorRefresh}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
              >
                🔄
                Refresh
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (newIterationJobId) {
    return <PremiumLoadingState jobId={newIterationJobId} projectId={id} onComplete={() => {
      setNewIterationJobId(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['iterations', id] });
    }} />;
  }

  if (project.status === 'PROCESSING') {
    // Get jobId from the latest iteration
    const latestIteration = project?.iterations?.[0];
    const jobId = latestIteration?.jobId;
    
    if (!jobId) {
      console.warn('⚠️  No jobId found in iterations');
      return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-purple-light animate-spin mx-auto" />
            <p className="text-white text-sm">Loading iteration data...</p>
          </div>
        </div>
      );
    }
    
    console.log('✅ Using jobId from iteration:', jobId);
    return <PremiumLoadingState jobId={jobId} projectId={id} />;
  }

  if (project.status === 'FAILED') {
    return (
      <EnhancedLoadingState
        status="FAILED"
        projectName={project.name}
        onRetry={() => {
          setInitialLoad(true);
          refetch();
        }}
      />
    );
  }

  const safeIterations = Array.isArray(iterations) ? iterations : [];
  const latestIteration = safeIterations.length
    ? [...safeIterations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
    : null;

  const getArtifact = (type) => latestIteration?.artifacts?.find(a => a.type === type)?.content || '';

  const handleIterationConfirm = async (payload) => {
    setIsReiterating(true);
    try {
      const response = await projectService.reiterate(id, payload);
      const jobId = response?.jobId || response?.data?.jobId;
      
      if (jobId) {
        setNewIterationJobId(jobId);
        setShowIterationModal(false);
      } else {
        toast.success('New iteration started successfully!');
        setShowIterationModal(false);
        refetch();
        queryClient.invalidateQueries({ queryKey: ['iterations', id] });
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create iteration');
      setIsReiterating(false);
    }
  };

  // New helper: refresh project data then navigate to the authoritative project id returned by the backend
  const handleRefreshNavigate = async () => {
    if (isRefreshing) return; // Prevent double-click
    setIsRefreshing(true);
    try {
      const res = await refetch();
      // Get the actual project data from the response
      let actualProject = null;
      
      if (res?.data) {
        actualProject = res.data;
      } else {
        // Fallback to current project state
        actualProject = project;
      }

      // ALWAYS use the actual project's MongoDB ID, never the route parameter
      const actualProjectId = actualProject?.id;
      
      if (!actualProjectId) {
        toast.error('Could not determine project ID');
        setIsRefreshing(false);
        return;
      }

      // Ensure iterations are refreshed
      queryClient.invalidateQueries({ queryKey: ['iterations', id] });

      // Navigate to the REAL project ID (not the temporary route ID)
      navigate(`/project/${actualProjectId}`, { replace: true });
    } catch (err) {
      toast.error('Failed to refresh project');
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {showHistory && (
        <aside className="w-56 bg-bg-2 border-r border-white/[0.07] flex-shrink-0">
          <div className="p-4 border-b border-white/[0.07]">
            <p className="text-xs font-mono text-[#5f5f80] uppercase tracking-wider">Version history</p>
          </div>
          <div className="p-2">
            <VersionHistory iterations={safeIterations} currentId={latestIteration?.id} onSelect={() => {}} />
          </div>
        </aside>
      )}

      <div className="flex-1 min-w-0">
        <div className="page-container">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-3 min-w-0">
              <button onClick={() => navigate('/dashboard')} className="mt-1 btn-ghost p-1.5 -ml-1.5">
                <ChevronLeft size={16} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusIndicator status={project.status} />
                  <h1 className="font-display font-700 text-xl text-white truncate">{project.name}</h1>
                </div>
                <p className="text-xs text-[#5f5f80] font-mono">
                  {safeIterations.length} iteration{safeIterations.length !== 1 ? 's' : ''} · last updated{' '}
                  {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowIterationModal(true)}
                disabled={isReiterating}
                className="btn-ghost gap-2 text-xs disabled:opacity-40"
              >
                <RotateCcw size={13} /> New Iteration
              </button>

              <ExportDropdown
                prd={getArtifact('PRD')}
                schema={getArtifact('SCHEMA')}
                components={getArtifact('COMPONENT_TREE')}
                sprints={getArtifact('TASK_BOARD')}
                projectName={project.name}
              />

              <ShareButton projectId={id} projectName={project.name} />

              <button
                onClick={handleRefreshNavigate}
                disabled={isRefreshing}
                className="btn-ghost gap-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          <IterationModal
            isOpen={showIterationModal}
            projectName={project.name}
            isLoading={isReiterating}
            onConfirm={handleIterationConfirm}
            onCancel={() => setShowIterationModal(false)}
          />

          {latestIteration ? (
            <>
              <div className="flex items-center gap-1 border-b border-white/[0.07] mb-6 overflow-x-auto">
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-display font-500 border-b-2 -mb-px whitespace-nowrap ${
                      activeTab === key ? 'border-purple text-purple-light' : 'border-transparent text-[#9999b8] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div>
                {activeTab === 'prd' && <PrdViewer prd={getArtifact('PRD')} />}
                {activeTab === 'schema' && <SchemaEditor schema={getArtifact('SCHEMA')} />}
                {activeTab === 'components' && <ComponentTree componentTree={getArtifact('COMPONENT_TREE')} />}
                {activeTab === 'sprints' && <SprintBoard taskBoard={getArtifact('TASK_BOARD')} />}
              </div>

              <div className="mt-12 pt-8 border-t border-white/[0.07]">
                <GitHubInspiration repos={getArtifact('GITHUB_REPOS')?.repos || []} />
              </div>
            </>
          ) : (
            <EmptyState icon={AlertCircle} title="No blueprint yet" />
          )}
        </div>
      </div>
    </div>
  );
}