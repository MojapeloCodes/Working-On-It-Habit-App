// components/ProjectForm.jsx
// Project creation and editing form component

const ProjectForm = ({ onSave, onCancel, editProject = null }) => {
  const [name, setName] = React.useState(editProject?.name || '');
  const [selectedSpheres, setSelectedSpheres] = React.useState(editProject?.spheres || []);
  const [color, setColor] = React.useState(editProject?.color || '#667eea');

  const toggleSphere = (sphere) => {
    setSelectedSpheres(prev =>
      prev.includes(sphere)
        ? prev.filter(s => s !== sphere)
        : [...prev, sphere]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && selectedSpheres.length > 0) {
      onSave({ name, spheres: selectedSpheres, color });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto fade-in">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {editProject ? 'Edit Project' : 'Create New Project'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Habit Tracker App"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Life Spheres * (select one or more)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(SPHERES).map(([key, sphere]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSphere(key)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedSpheres.includes(key)
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{sphere.icon}</span>
                    <span className="font-medium text-gray-900">{sphere.name}</span>
                  </div>
                </button>
              ))}
            </div>
            {selectedSpheres.length === 0 && (
              <p className="text-sm text-red-600 mt-2">Please select at least one sphere</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Color
            </label>
            <div className="flex space-x-2 flex-wrap gap-2">
              {COLOR_PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-12 h-12 rounded-lg transition-all ${
                    color === c ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  title={`Select ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || selectedSpheres.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};