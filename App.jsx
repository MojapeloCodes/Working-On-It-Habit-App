// App.jsx - Main application component

const App = () => {
  const { useState, useEffect } = React;

  // State management
  const [view, setView] = useState('timer');
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  const [activeSession, setActiveSession] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [projectForActivity, setProjectForActivity] = useState(null);
  
  const [sessionRating, setSessionRating] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    setProjects(StorageManager.loadProjects());
    setActivities(StorageManager.loadActivities());
    setSessions(StorageManager.loadSessions());
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (projects.length > 0) {
      StorageManager.saveProjects(projects);
    }
  }, [projects]);

  useEffect(() => {
    if (activities.length > 0) {
      StorageManager.saveActivities(activities);
    }
  }, [activities]);

  useEffect(() => {
    StorageManager.saveSessions(sessions);
  }, [sessions]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (activeSession && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - activeSession.startTime - (activeSession.pausedDuration || 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, isPaused]);

  // Session handlers
  const startSession = () => {
    if (!selectedProject || !selectedActivity) return;
    setActiveSession({
      id: Utils.generateId(),
      projectId: selectedProject.id,
      activityId: selectedActivity.id,
      startTime: Date.now(),
      pausedDuration: 0
    });
    setElapsedTime(0);
    setIsPaused(false);
  };

  const pauseSession = () => {
    if (!activeSession) return;
    if (isPaused) {
      setActiveSession({
        ...activeSession,
        lastResumeTime: Date.now()
      });
      setIsPaused(false);
    } else {
      const pauseTime = Date.now();
      setActiveSession({
        ...activeSession,
        pausedDuration: (activeSession.pausedDuration || 0) + 
          (pauseTime - (activeSession.lastResumeTime || activeSession.startTime)),
        lastPauseTime: pauseTime
      });
      setIsPaused(true);
    }
  };

  const completeSession = () => {
    setShowCompleteForm(true);
  };

  const saveCompletedSession = () => {
    if (!activeSession) return;
    const duration = elapsedTime;
    const newSession = {
      id: activeSession.id,
      projectId: activeSession.projectId,
      activityId: activeSession.activityId,
      startTime: activeSession.startTime,
      endTime: Date.now(),
      duration,
      rating: sessionRating,
      notes: sessionNotes
    };
    setSessions([...sessions, newSession]);
    setActiveSession(null);
    setElapsedTime(0);
    setIsPaused(false);
    setShowCompleteForm(false);
    setSessionRating(0);
    setSessionNotes('');
  };

  const keepWorking = () => {
    setShowCompleteForm(false);
    setSessionRating(0);
    setSessionNotes('');
  };

  // Project handlers
  const addProject = (projectData) => {
    const newProject = {
      id: Utils.generateId(),
      ...projectData,
      createdAt: Date.now()
    };
    setProjects([...projects, newProject]);
    setShowProjectForm(false);
  };

  const deleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
    setActivities(activities.filter(a => a.projectId !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
  };

  // Activity handlers
  const addActivity = (activityData) => {
    const newActivity = {
      id: Utils.generateId(),
      ...activityData
    };
    setActivities([...activities, newActivity]);
    setShowActivityForm(false);
    setProjectForActivity(null);
  };

  const deleteActivity = (id) => {
    setActivities(activities.filter(a => a.id !== id));
    if (selectedActivity?.id === id) setSelectedActivity(null);
  };

  const handleAddActivity = (project) => {
    setProjectForActivity(project);
    setShowActivityForm(true);
  };

  // Navigation icons
  const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const TargetIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const TrendingUpIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  const BarChart3Icon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold gradient-text">
            WorkingOnIt
          </h1>
          <p className="text-gray-600 text-sm mt-1">Track your growth across all life spheres</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {[
              { id: 'timer', icon: ClockIcon, label: 'Timer' },
              { id: 'projects', icon: TargetIcon, label: 'Projects' },
              { id: 'skills', icon: TrendingUpIcon, label: 'Skills' },
              { id: 'analytics', icon: BarChart3Icon, label: 'Analytics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                  view === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {view === 'timer' && (
          <TimerView
            projects={projects}
            activities={activities}
            sessions={sessions}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            selectedActivity={selectedActivity}
            setSelectedActivity={setSelectedActivity}
            activeSession={activeSession}
            isPaused={isPaused}
            elapsedTime={elapsedTime}
            onStart={startSession}
            onPause={pauseSession}
            onComplete={completeSession}
          />
        )}

        {view === 'projects' && (
          <ProjectsView
            projects={projects}
            activities={activities}
            onAddProject={() => setShowProjectForm(true)}
            onAddActivity={handleAddActivity}
            onDeleteProject={deleteProject}
            onDeleteActivity={deleteActivity}
          />
        )}

        {view === 'skills' && (
          <SkillsView
            sessions={sessions}
            activities={activities}
          />
        )}

        {view === 'analytics' && (
          <AnalyticsView
            sessions={sessions}
            activities={activities}
          />
        )}
      </div>

      {/* Modals */}
      {showProjectForm && (
        <ProjectForm
          onSave={addProject}
          onCancel={() => setShowProjectForm(false)}
        />
      )}

      {showActivityForm && projectForActivity && (
        <ActivityForm
          project={projectForActivity}
          onSave={addActivity}
          onCancel={() => {
            setShowActivityForm(false);
            setProjectForActivity(null);
          }}
        />
      )}

      {showCompleteForm && (
        <CompleteSessionModal
          elapsedTime={elapsedTime}
          selectedActivity={selectedActivity}
          sessionRating={sessionRating}
          setSessionRating={setSessionRating}
          sessionNotes={sessionNotes}
          setSessionNotes={setSessionNotes}
          onSave={saveCompletedSession}
          onKeepWorking={keepWorking}
        />
      )}
    </div>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);