// app.js - Core tracking functionality
import { supabase } from './supabase.js';
import { sphereKeywordMapping, mapActivityToSphere, suggestSphereWithAI } from './sphereMapping.js';
import { syncToSupabase, loadFromSupabase } from './storage.js';

// ===== CONFIGURATION =====
const SPHERES = [
    { id: 'physical', name: 'Physical', emoji: '🌱', element: 'Earth', colors: ['#2d5016', '#3d6b1f', '#4d7c2a', '#5d8d35'] },
    { id: 'emotional', name: 'Emotional', emoji: '💧', element: 'Water', colors: ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa'] },
    { id: 'social', name: 'Social', emoji: '🔥', element: 'Fire', colors: ['#ea580c', '#f97316', '#fb923c', '#fdba74'] },
    { id: 'intellectual', name: 'Intellectual', emoji: '🌬️', element: 'Air', colors: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc'] },
    { id: 'creative', name: 'Creative', emoji: '🌸', element: 'Flora', colors: ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe'] },
    { id: 'professional', name: 'Professional', emoji: '⛰️', element: 'Stone', colors: ['#475569', '#64748b', '#94a3b8', '#cbd5e1'] },
    { id: 'spiritual', name: 'Spiritual', emoji: '✨', element: 'Ether', colors: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d'] }
];

// ===== STATE =====
let currentUser = null;
let activities = [];
let timeEntries = [];
let activeTimer = null;
let timerInterval = null;
let selectedFeeling = 0;
let currentTimeEntry = null;

// ===== DOM ELEMENTS =====
const elements = {
    ambientBg: document.getElementById('ambient-bg'),
    currentTime: document.getElementById('current-time'),
    greeting: document.getElementById('greeting'),
    logoutBtn: document.getElementById('logout-btn'),
    
    activitySelect: document.getElementById('activity-select'),
    createActivityBtn: document.getElementById('create-activity-btn'),
    startTimerBtn: document.getElementById('start-timer-btn'),
    stopTimerBtn: document.getElementById('stop-timer-btn'),
    timerDisplay: document.getElementById('timer-display'),
    timerClock: document.getElementById('timer-clock'),
    currentActivityName: document.getElementById('current-activity-name'),
    currentActivitySphere: document.getElementById('current-activity-sphere'),
    
    todayActivities: document.getElementById('today-activities'),
    
    activityModal: document.getElementById('activity-modal'),
    closeModal: document.getElementById('close-modal'),
    activityNameInput: document.getElementById('activity-name-input'),
    sphereSuggestions: document.getElementById('sphere-suggestions'),
    sphereSelect: document.getElementById('sphere-select'),
    colorPicker: document.getElementById('color-picker'),
    saveActivityBtn: document.getElementById('save-activity-btn'),
    
    rateModal: document.getElementById('rate-modal'),
    activityNote: document.getElementById('activity-note'),
    noteCount: document.getElementById('note-count'),
    saveRatingBtn: document.getElementById('save-rating-btn')
};

// ===== INITIALIZATION =====
async function init() {
    // Check authentication
    currentUser = await checkAuth();
    if (!currentUser) {
        window.location.href = '/auth.html';
        return;
    }
    
    // Load data
    await loadData();
    
    // Setup UI
    setupAmbientTheme();
    updateTimeDisplay();
    populateSphereSelect();
    renderActivities();
    renderTodayActivities();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start intervals
    setInterval(updateTimeDisplay, 1000);
    setInterval(updateAmbientTheme, 60000); // Check every minute
}

// ===== AUTHENTICATION =====
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/auth.html';
        return null;
    }
    return session.user;
}

elements.logoutBtn.addEventListener('click', async () => {
    const confirm = window.confirm('Are you sure you want to logout?');
    if (confirm) {
        await supabase.auth.signOut();
        window.location.href = '/auth.html';
    }
});

// ===== DATA LOADING =====
async function loadData() {
    // Try to load from Supabase first
    const supabaseData = await loadFromSupabase(currentUser.id);
    
    if (supabaseData) {
        activities = supabaseData.activities || [];
        timeEntries = supabaseData.timeEntries || [];
    } else {
        // Fallback to localStorage
        activities = JSON.parse(localStorage.getItem('activities') || '[]');
        timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    }
    
    // Check for active timer in localStorage
    const savedTimer = localStorage.getItem('activeTimer');
    if (savedTimer) {
        activeTimer = JSON.parse(savedTimer);
        resumeTimer();
    }
}

// ===== AMBIENT THEME =====
function updateAmbientTheme() {
    const hour = new Date().getHours();
    let theme;
    
    if (hour >= 5 && hour < 9) theme = 'dawn';
    else if (hour >= 9 && hour < 12) theme = 'morning';
    else if (hour >= 12 && hour < 17) theme = 'afternoon';
    else if (hour >= 17 && hour < 21) theme = 'evening';
    else theme = 'night';
    
    elements.ambientBg.className = `ambient-background ${theme}`;
}

function setupAmbientTheme() {
    updateAmbientTheme();
}

function updateTimeDisplay() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const hour = now.getHours();
    
    let greeting;
    if (hour >= 5 && hour < 12) greeting = 'Good morning';
    else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17 && hour < 21) greeting = 'Good evening';
    else greeting = 'Good night';
    
    elements.currentTime.textContent = timeStr;
    elements.greeting.textContent = greeting;
}

// ===== ACTIVITY MANAGEMENT =====
function renderActivities() {
    elements.activitySelect.innerHTML = '<option value="">Select an activity...</option>';
    
    activities.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity.id;
        option.textContent = `${activity.name} (${activity.sphere})`;
        elements.activitySelect.appendChild(option);
    });
}

function populateSphereSelect() {
    elements.sphereSelect.innerHTML = '<option value="">Select a sphere...</option>';
    
    SPHERES.forEach(sphere => {
        const option = document.createElement('option');
        option.value = sphere.id;
        option.textContent = `${sphere.emoji} ${sphere.name} - ${sphere.element}`;
        elements.sphereSelect.appendChild(option);
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Activity selection
    elements.activitySelect.addEventListener('change', () => {
        if (elements.activitySelect.value) {
            elements.startTimerBtn.classList.remove('hidden');
        } else {
            elements.startTimerBtn.classList.add('hidden');
        }
    });
    
    // Create activity
    elements.createActivityBtn.addEventListener('click', openActivityModal);
    elements.closeModal.addEventListener('click', closeActivityModal);
    
    // Activity name input for AI suggestions
    elements.activityNameInput.addEventListener('input', debounce(handleActivityNameInput, 500));
    
    // Sphere selection
    elements.sphereSelect.addEventListener('change', handleSphereSelection);
    
    // Save activity
    elements.saveActivityBtn.addEventListener('click', saveActivity);
    
    // Timer controls
    elements.startTimerBtn.addEventListener('click', startTimer);
    elements.stopTimerBtn.addEventListener('click', stopTimer);
    
    // Rating modal
    document.querySelectorAll('.feeling-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.feeling-btn').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            selectedFeeling = parseInt(e.currentTarget.dataset.rating);
        });
    });
    
    elements.activityNote.addEventListener('input', () => {
        elements.noteCount.textContent = elements.activityNote.value.length;
    });
    
    elements.saveRatingBtn.addEventListener('click', saveRating);
}

// ===== ACTIVITY MODAL =====
function openActivityModal() {
    elements.activityModal.classList.remove('hidden');
    elements.activityNameInput.value = '';
    elements.sphereSuggestions.innerHTML = '';
    elements.sphereSelect.value = '';
    elements.colorPicker.innerHTML = '';
}

function closeActivityModal() {
    elements.activityModal.classList.add('hidden');
}

async function handleActivityNameInput() {
    const activityName = elements.activityNameInput.value.trim();
    if (activityName.length < 3) return;
    
    // Try keyword mapping first
    const keywordSuggestion = mapActivityToSphere(activityName);
    
    if (keywordSuggestion) {
        displaySphereSuggestions([keywordSuggestion]);
    } else {
        // Fallback to AI
        const aiSuggestion = await suggestSphereWithAI(activityName);
        if (aiSuggestion) {
            displaySphereSuggestions([aiSuggestion]);
        }
    }
}

function displaySphereSuggestions(suggestions) {
    elements.sphereSuggestions.innerHTML = '';
    
    suggestions.forEach(sphereId => {
        const sphere = SPHERES.find(s => s.id === sphereId);
        if (!sphere) return;
        
        const chip = document.createElement('div');
        chip.className = 'sphere-chip';
        chip.style.borderColor = sphere.colors[0];
        chip.textContent = `${sphere.emoji} ${sphere.name}`;
        chip.addEventListener('click', () => {
            elements.sphereSelect.value = sphereId;
            handleSphereSelection();
        });
        
        elements.sphereSuggestions.appendChild(chip);
    });
}

function handleSphereSelection() {
    const selectedSphere = elements.sphereSelect.value;
    if (!selectedSphere) return;
    
    const sphere = SPHERES.find(s => s.id === selectedSphere);
    if (!sphere) return;
    
    // Display color options
    elements.colorPicker.innerHTML = '';
    sphere.colors.forEach((color, index) => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.style.backgroundColor = color;
        colorOption.dataset.color = color;
        
        if (index === 0) colorOption.classList.add('selected');
        
        colorOption.addEventListener('click', (e) => {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
        });
        
        elements.colorPicker.appendChild(colorOption);
    });
}

async function saveActivity() {
    const name = elements.activityNameInput.value.trim();
    const sphere = elements.sphereSelect.value;
    const selectedColorEl = document.querySelector('.color-option.selected');
    const color = selectedColorEl ? selectedColorEl.dataset.color : null;
    
    if (!name || !sphere || !color) {
        alert('Please fill in all fields');
        return;
    }
    
    const activity = {
        id: Date.now().toString(),
        user_id: currentUser.id,
        name,
        sphere,
        color,
        created_at: new Date().toISOString()
    };
    
    activities.push(activity);
    localStorage.setItem('activities', JSON.stringify(activities));
    
    // Sync to Supabase
    await syncToSupabase(currentUser.id, { activities, timeEntries });
    
    renderActivities();
    closeActivityModal();
}

// ===== TIMER FUNCTIONALITY =====
function startTimer() {
    const activityId = elements.activitySelect.value;
    if (!activityId) return;
    
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;
    
    activeTimer = {
        activityId,
        startTime: Date.now(),
        activity
    };
    
    localStorage.setItem('activeTimer', JSON.stringify(activeTimer));
    
    elements.startTimerBtn.classList.add('hidden');
    elements.activitySelect.disabled = true;
    elements.timerDisplay.classList.remove('hidden');
    elements.currentActivityName.textContent = activity.name;
    elements.currentActivitySphere.textContent = `${activity.sphere} sphere`;
    
    timerInterval = setInterval(updateTimerClock, 1000);
    updateTimerClock();
}

function resumeTimer() {
    if (!activeTimer) return;
    
    const activity = activities.find(a => a.id === activeTimer.activityId);
    if (!activity) {
        localStorage.removeItem('activeTimer');
        activeTimer = null;
        return;
    }
    
    elements.activitySelect.value = activeTimer.activityId;
    elements.startTimerBtn.classList.add('hidden');
    elements.activitySelect.disabled = true;
    elements.timerDisplay.classList.remove('hidden');
    elements.currentActivityName.textContent = activity.name;
    elements.currentActivitySphere.textContent = `${activity.sphere} sphere`;
    
    timerInterval = setInterval(updateTimerClock, 1000);
    updateTimerClock();
}

function updateTimerClock() {
    if (!activeTimer) return;
    
    const elapsed = Date.now() - activeTimer.startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    elements.timerClock.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
    if (!activeTimer) return;
    
    clearInterval(timerInterval);
    
    const endTime = Date.now();
    const duration = Math.floor((endTime - activeTimer.startTime) / 60000); // in minutes
    
    currentTimeEntry = {
        id: Date.now().toString(),
        user_id: currentUser.id,
        activity_id: activeTimer.activityId,
        start_time: new Date(activeTimer.startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        duration_minutes: duration,
        created_at: new Date().toISOString()
    };
    
    // Open rating modal
    elements.rateModal.classList.remove('hidden');
    selectedFeeling = 0;
    elements.activityNote.value = '';
    elements.noteCount.textContent = '0';
    document.querySelectorAll('.feeling-btn').forEach(b => b.classList.remove('selected'));
}

async function saveRating() {
    if (selectedFeeling === 0) {
        alert('Please select how you\'re feeling');
        return;
    }
    
    currentTimeEntry.feeling_rating = selectedFeeling;
    currentTimeEntry.note = elements.activityNote.value.trim();
    
    timeEntries.push(currentTimeEntry);
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
    
    // Sync to Supabase
    await syncToSupabase(currentUser.id, { activities, timeEntries });
    
    // Reset timer
    localStorage.removeItem('activeTimer');
    activeTimer = null;
    currentTimeEntry = null;
    
    elements.rateModal.classList.add('hidden');
    elements.timerDisplay.classList.add('hidden');
    elements.activitySelect.disabled = false;
    elements.activitySelect.value = '';
    elements.startTimerBtn.classList.add('hidden');
    
    renderTodayActivities();
}

// ===== TODAY'S ACTIVITIES =====
function renderTodayActivities() {
    const today = new Date().toDateString();
    const todayEntries = timeEntries.filter(entry => {
        return new Date(entry.start_time).toDateString() === today;
    });
    
    if (todayEntries.length === 0) {
        elements.todayActivities.innerHTML = '<p class="empty-state">No activities tracked yet today. Start tracking!</p>';
        return;
    }
    
    elements.todayActivities.innerHTML = '';
    
    todayEntries.reverse().forEach(entry => {
        const activity = activities.find(a => a.id === entry.activity_id);
        if (!activity) return;
        
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.style.borderLeftColor = activity.color;
        
        const feelings = ['😞', '😕', '😐', '🙂', '😊'];
        
        item.innerHTML = `
            <div class="activity-details">
                <div class="activity-title">${activity.name}</div>
                <div class="activity-meta">
                    <span>${entry.duration_minutes} min</span>
                    <span>${activity.sphere}</span>
                    <span class="activity-rating">${feelings[entry.feeling_rating - 1]}</span>
                </div>
                ${entry.note ? `<div style="margin-top: 8px; color: #6b7280; font-size: 14px;">${entry.note}</div>` : ''}
            </div>
        `;
        
        elements.todayActivities.appendChild(item);
    });
}

// ===== UTILITIES =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize app
init();