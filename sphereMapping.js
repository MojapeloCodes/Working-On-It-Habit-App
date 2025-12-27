// sphereMapping.js - Hybrid AI sphere mapping (keywords + Claude API)

// ===== KEYWORD MAPPING (Rule-based) =====
export const sphereKeywordMapping = {
    physical: [
        'workout', 'exercise', 'run', 'walk', 'gym', 'yoga', 'swim', 'bike',
        'sleep', 'rest', 'nap', 'stretch', 'fitness', 'sport', 'health',
        'meal', 'cook', 'eat', 'nutrition', 'diet', 'hydrate', 'doctor'
    ],
    emotional: [
        'therapy', 'journal', 'reflect', 'meditate', 'emotion', 'feeling',
        'cry', 'process', 'heal', 'self-care', 'mindfulness', 'breathe',
        'anxiety', 'stress', 'calm', 'peace', 'gratitude', 'mood'
    ],
    social: [
        'friend', 'family', 'call', 'text', 'chat', 'hangout', 'party',
        'meeting', 'connect', 'community', 'conversation', 'relationship',
        'date', 'social', 'networking', 'collaboration', 'team'
    ],
    intellectual: [
        'read', 'study', 'learn', 'course', 'class', 'research', 'book',
        'podcast', 'article', 'video', 'tutorial', 'education', 'skill',
        'practice', 'training', 'knowledge', 'analyze', 'think'
    ],
    creative: [
        'write', 'draw', 'paint', 'design', 'create', 'art', 'music',
        'compose', 'craft', 'make', 'build', 'photography', 'dance',
        'creative', 'imagination', 'express', 'play', 'hobby'
    ],
    professional: [
        'work', 'project', 'task', 'job', 'career', 'meeting', 'email',
        'deadline', 'client', 'presentation', 'business', 'office',
        'professional', 'development', 'productivity', 'goal', 'plan'
    ],
    spiritual: [
        'meditate', 'pray', 'worship', 'spiritual', 'meaning', 'purpose',
        'values', 'faith', 'belief', 'nature', 'reflect', 'contemplate',
        'philosophy', 'existential', 'mindful', 'sacred', 'ritual'
    ]
};

// ===== KEYWORD-BASED MAPPING =====
export function mapActivityToSphere(activityName) {
    const lowerName = activityName.toLowerCase();
    
    // Check each sphere's keywords
    for (const [sphere, keywords] of Object.entries(sphereKeywordMapping)) {
        for (const keyword of keywords) {
            if (lowerName.includes(keyword)) {
                console.log(`Keyword match: "${activityName}" → ${sphere} (keyword: ${keyword})`);
                return sphere;
            }
        }
    }
    
    return null; // No keyword match found
}

// ===== AI-BASED MAPPING (Claude API) =====
export async function suggestSphereWithAI(activityName) {
    try {
        console.log(`Requesting AI suggestion for: "${activityName}"`);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: `You are a wellness categorization assistant. Categorize the following activity into ONE of these psychological spheres:

Physical - Exercise, sleep, nutrition, health
Emotional - Processing feelings, therapy, self-reflection
Social - Relationships, connections, community
Intellectual - Learning, reading, skill development
Creative - Art, writing, making, expression
Professional - Work, career development, projects
Spiritual - Meditation, meaning, purpose, values

Activity: "${activityName}"

Respond with ONLY the sphere name (one word: physical, emotional, social, intellectual, creative, professional, or spiritual). No explanation.`
                    }
                ]
            })
        });
        
        if (!response.ok) {
            console.error('AI API error:', response.status);
            return null;
        }
        
        const data = await response.json();
        const suggestion = data.content[0]?.text?.trim().toLowerCase();
        
        // Validate the response
        const validSpheres = ['physical', 'emotional', 'social', 'intellectual', 'creative', 'professional', 'spiritual'];
        if (validSpheres.includes(suggestion)) {
            console.log(`AI suggestion: "${activityName}" → ${suggestion}`);
            return suggestion;
        } else {
            console.error('Invalid AI response:', suggestion);
            return null;
        }
        
    } catch (error) {
        console.error('Error calling AI API:', error);
        return null;
    }
}

// ===== HYBRID MAPPING (Try keywords first, fallback to AI) =====
export async function getSphereMapping(activityName) {
    // Try keyword mapping first (fast & free)
    const keywordMatch = mapActivityToSphere(activityName);
    if (keywordMatch) {
        return { sphere: keywordMatch, method: 'keyword' };
    }
    
    // Fallback to AI (slower but more accurate)
    const aiMatch = await suggestSphereWithAI(activityName);
    if (aiMatch) {
        return { sphere: aiMatch, method: 'ai' };
    }
    
    // Default fallback
    return { sphere: 'professional', method: 'default' };
}