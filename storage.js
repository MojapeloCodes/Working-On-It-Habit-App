// storage.js - Hybrid storage (localStorage + Supabase sync)
import { supabase } from './supabase.js';

// ===== SYNC TO SUPABASE =====
export async function syncToSupabase(userId, data) {
    try {
        // Sync activities
        if (data.activities && data.activities.length > 0) {
            const { error: activitiesError } = await supabase
                .from('activity_labels')
                .upsert(
                    data.activities.map(activity => ({
                        id: activity.id,
                        user_id: userId,
                        name: activity.name,
                        color: activity.color,
                        sphere: activity.sphere,
                        created_at: activity.created_at
                    })),
                    { onConflict: 'id' }
                );
            
            if (activitiesError) {
                console.error('Error syncing activities:', activitiesError);
            } else {
                console.log('Activities synced to Supabase');
            }
        }
        
        // Sync time entries
        if (data.timeEntries && data.timeEntries.length > 0) {
            const { error: entriesError } = await supabase
                .from('time_entries')
                .upsert(
                    data.timeEntries.map(entry => ({
                        id: entry.id,
                        user_id: userId,
                        activity_id: entry.activity_id,
                        start_time: entry.start_time,
                        end_time: entry.end_time,
                        duration_minutes: entry.duration_minutes,
                        feeling_rating: entry.feeling_rating,
                        note: entry.note,
                        created_at: entry.created_at
                    })),
                    { onConflict: 'id' }
                );
            
            if (entriesError) {
                console.error('Error syncing time entries:', entriesError);
            } else {
                console.log('Time entries synced to Supabase');
            }
        }
        
        return true;
    } catch (error) {
        console.error('Sync error:', error);
        return false;
    }
}

// ===== LOAD FROM SUPABASE =====
export async function loadFromSupabase(userId) {
    try {
        // Load activities
        const { data: activities, error: activitiesError } = await supabase
            .from('activity_labels')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (activitiesError) {
            console.error('Error loading activities:', activitiesError);
            return null;
        }
        
        // Load time entries
        const { data: timeEntries, error: entriesError } = await supabase
            .from('time_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (entriesError) {
            console.error('Error loading time entries:', entriesError);
            return null;
        }
        
        console.log('Data loaded from Supabase:', {
            activities: activities?.length || 0,
            timeEntries: timeEntries?.length || 0
        });
        
        // Also save to localStorage for offline access
        if (activities) localStorage.setItem('activities', JSON.stringify(activities));
        if (timeEntries) localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
        
        return {
            activities: activities || [],
            timeEntries: timeEntries || []
        };
    } catch (error) {
        console.error('Load error:', error);
        return null;
    }
}

// ===== OFFLINE DETECTION & AUTO-SYNC =====
let syncQueue = [];
let isOnline = navigator.onLine;

window.addEventListener('online', async () => {
    console.log('Connection restored. Syncing queued data...');
    isOnline = true;
    
    // Process sync queue
    if (syncQueue.length > 0) {
        for (const data of syncQueue) {
            await syncToSupabase(data.userId, data.payload);
        }
        syncQueue = [];
        localStorage.removeItem('syncQueue');
    }
});

window.addEventListener('offline', () => {
    console.log('Connection lost. Data will be synced when online.');
    isOnline = false;
});

// ===== SMART SYNC WRAPPER =====
export async function smartSync(userId, data) {
    if (isOnline) {
        // Try to sync immediately
        const success = await syncToSupabase(userId, data);
        if (!success) {
            // Queue for later if sync fails
            queueSync(userId, data);
        }
    } else {
        // Queue for later if offline
        queueSync(userId, data);
    }
}

function queueSync(userId, data) {
    syncQueue.push({ userId, payload: data, timestamp: Date.now() });
    localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
    console.log('Data queued for sync');
}

// ===== LOAD SYNC QUEUE ON INIT =====
const savedQueue = localStorage.getItem('syncQueue');
if (savedQueue) {
    syncQueue = JSON.parse(savedQueue);
}