// components/AnalyticsView.jsx
// Analytics dashboard with sphere balance and insights

const AnalyticsView = ({ sessions, activities }) => {
  const sphereData = SphereMapper.getSphereData(sessions, activities);
  const balanceScore = SphereMapper.getSphereBalance(sessions, activities);
  const recommendations = SphereMapper.getBalanceRecommendations(sessions, activities);

  const totalTime = Utils.getTotalTime(sessions);
  const todayTime = Utils.getTotalTime(Utils.getTodaySessions(sessions));
  const weekTime = Utils.getTotalTime(Utils.getWeekSessions(sessions));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sphere Analytics</h2>
        <p className="text-gray-600 mt-1">Visualize your time distribution across life spheres</p>
      </div>

      {sphereData.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="empty-state">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No data yet</h3>
            <p className="text-gray-500">Start tracking to see your sphere balance!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Time Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm font-medium opacity-90">Today</div>
              <div className="text-3xl font-bold mt-2">{Utils.formatDuration(todayTime)}</div>
              <div className="text-xs opacity-75 mt-1">{Utils.getTodaySessions(sessions).length} sessions</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm font-medium opacity-90">This Week</div>
              <div className="text-3xl font-bold mt-2">{Utils.formatDuration(weekTime)}</div>
              <div className="text-xs opacity-75 mt-1">{Utils.getWeekSessions(sessions).length} sessions</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm font-medium opacity-90">All Time</div>
              <div className="text-3xl font-bold mt-2">{Utils.formatDuration(totalTime)}</div>
              <div className="text-xs opacity-75 mt-1">{sessions.length} sessions</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm font-medium opacity-90">Balance Score</div>
              <div className="text-3xl font-bold mt-2">{balanceScore}/100</div>
              <div className="text-xs opacity-75 mt-1">
                {balanceScore >= 80 ? '🎯 Excellent' : balanceScore >= 60 ? '👍 Good' : balanceScore >= 40 ? '😊 Fair' : '💪 Needs work'}
              </div>
            </div>
          </div>

          {/* Sphere Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Sphere Time Distribution</h3>
            <div className="space-y-4">
              {sphereData.map(item => {
                const sphere = SPHERES[item.sphere];
                const hours = (item.time / (1000 * 60 * 60)).toFixed(1);
                return (
                  <div key={item.sphere} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{sphere.icon}</span>
                        <div>
                          <span className="font-semibold text-gray-900 text-lg">{sphere.name}</span>
                          <div className="text-xs text-gray-500 mt-1">{hours} hours</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold" style={{ color: sphere.color }}>
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: sphere.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Balance Recommendations */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📊 Balance Insights & Recommendations
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                >
                  <p className="text-gray-800">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sphere Comparison Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Visual Sphere Balance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(SPHERES).map(([key, sphere]) => {
                const sphereItem = sphereData.find(s => s.sphere === key);
                const percentage = sphereItem ? parseFloat(sphereItem.percentage) : 0;
                const isActive = percentage > 0;
                
                return (
                  <div 
                    key={key}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isActive 
                        ? 'border-current shadow-lg' 
                        : 'border-gray-200 opacity-50'
                    }`}
                    style={{ 
                      borderColor: isActive ? sphere.color : undefined,
                      backgroundColor: isActive ? `${sphere.color}10` : undefined
                    }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{sphere.icon}</div>
                      <div className="font-semibold text-gray-900 text-sm">{sphere.name}</div>
                      {isActive && (
                        <div 
                          className="text-2xl font-bold mt-2"
                          style={{ color: sphere.color }}
                        >
                          {percentage}%
                        </div>
                      )}
                      {!isActive && (
                        <div className="text-sm text-gray-500 mt-2">Not tracked</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Data Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📥 Data Management</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  const data = StorageManager.exportData();
                  Utils.downloadJSON(data, `workingonit-export-${new Date().toISOString().split('T')[0]}.json`);
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                Export All Data
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
                    StorageManager.clearAll();
                    window.location.reload();
                  }
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
              >
                Clear All Data
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              💡 Tip: Export your data regularly to keep a backup of your progress
            </p>
          </div>
        </>
      )}
    </div>
  );
};