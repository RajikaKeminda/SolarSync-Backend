const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const GEMINI_API_KEY = 'AIzaSyD8_kKyUtm8xdEvfsVzWL33im80OTn5Yf4';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate AI-powered personalized recommendations for EV users
 */
async function generateUserRecommendations(userData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert EV (Electric Vehicle) advisor. Analyze the following user data and provide personalized recommendations and insights.

User Profile:
- Vehicle: ${userData.vehicle?.make} ${userData.vehicle?.model} (${userData.vehicle?.year})
- Battery Capacity: ${userData.vehicle?.batteryCapacity} kWh
- Current Battery Level: ${userData.vehicle?.currentBatteryLevel}%
- Estimated Range: ${userData.vehicle?.estimatedRange} km
- Charging Port Types: ${userData.vehicle?.chargingPortType?.join(', ') || 'Not specified'}

Charging History (Last 30 days):
- Total Sessions: ${userData.chargingHistory?.totalSessions || 0}
- Total Energy Used: ${userData.chargingHistory?.totalEnergy || 0} kWh
- Average Session Duration: ${userData.chargingHistory?.avgDuration || 0} minutes
- Most Frequent Charging Times: ${userData.chargingHistory?.peakTimes?.join(', ') || 'No data'}
- Favorite Stations: ${userData.chargingHistory?.favoriteStations?.join(', ') || 'None'}

Current Status:
- Active Charging Session: ${userData.hasActiveSession ? 'Yes' : 'No'}
- Upcoming Reservations: ${userData.upcomingReservations || 0}
- Last Charged: ${userData.lastCharged || 'Unknown'}

Location Context:
- Current Location: ${userData.location || 'Not provided'}
- Nearby Stations Count: ${userData.nearbyStationsCount || 0}

Based on this data, provide:
1. 3-4 personalized tips for optimal EV usage and battery health
2. Charging routine insights based on their patterns
3. Station recommendations based on their vehicle and usage
4. Battery optimization suggestions
5. Cost-saving opportunities

Format your response as a JSON object with this structure:
{
  "tips": [
    {
      "title": "Brief title (max 40 chars)",
      "description": "Detailed tip (max 120 chars)",
      "icon": "leaf|battery-charging|wallet|time|flash|trending-up|shield-checkmark",
      "category": "battery|charging|cost|efficiency|health",
      "priority": "high|medium|low"
    }
  ],
  "chargingRoutine": {
    "pattern": "Description of their charging pattern",
    "suggestion": "Recommendation to optimize their routine",
    "bestTimes": ["time1", "time2"],
    "estimatedSavings": "Potential monthly savings"
  },
  "stationRecommendations": [
    {
      "reason": "Why this type of station is recommended",
      "features": ["feature1", "feature2"],
      "tip": "Usage tip for these stations"
    }
  ],
  "nextChargeSuggestion": {
    "when": "When they should charge next",
    "why": "Reason for this timing",
    "targetLevel": "Recommended charge level"
  }
}

Respond ONLY with the JSON object, no markdown, no code blocks, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Remove markdown code blocks if present
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }

    const recommendations = JSON.parse(text);

    // Add metadata
    return {
      ...recommendations,
      generatedAt: new Date(),
      userId: userData.userId
    };

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    
    // Return fallback recommendations if AI fails
    return getFallbackRecommendations(userData);
  }
}

/**
 * Fallback recommendations if AI fails
 */
function getFallbackRecommendations(userData) {
  const batteryLevel = userData.vehicle?.currentBatteryLevel || 85;
  const tips = [];

  // Battery level based tip
  if (batteryLevel < 30) {
    tips.push({
      title: 'Low Battery Alert',
      description: 'Your battery is below 30%. Find a charging station nearby to avoid range anxiety.',
      icon: 'battery-charging',
      category: 'battery',
      priority: 'high'
    });
  } else if (batteryLevel > 90) {
    tips.push({
      title: 'Optimal Charge Level',
      description: 'Great! Keeping battery between 20-80% daily helps extend battery life.',
      icon: 'shield-checkmark',
      category: 'health',
      priority: 'low'
    });
  }

  // General tips
  tips.push(
    {
      title: 'Charge During Off-Peak Hours',
      description: 'Save up to 40% by charging between 11 PM and 6 AM when electricity rates are lower.',
      icon: 'wallet',
      category: 'cost',
      priority: 'medium'
    },
    {
      title: 'Pre-condition Your Battery',
      description: 'Warm up or cool down your battery before charging to achieve faster charging speeds.',
      icon: 'flash',
      category: 'efficiency',
      priority: 'medium'
    },
    {
      title: 'Regular Charging Routine',
      description: 'Establish a consistent charging routine to maximize battery health and lifespan.',
      icon: 'time',
      category: 'health',
      priority: 'low'
    }
  );

  return {
    tips: tips.slice(0, 4),
    chargingRoutine: {
      pattern: userData.chargingHistory?.totalSessions > 5 
        ? 'You charge regularly, which is good for battery health'
        : 'Consider establishing a more consistent charging routine',
      suggestion: 'Try to charge during off-peak hours (11 PM - 6 AM) to save on costs',
      bestTimes: ['23:00', '00:00', '01:00'],
      estimatedSavings: '$15-25 per month'
    },
    stationRecommendations: [
      {
        reason: `Based on your ${userData.vehicle?.make || 'vehicle'}'s ${userData.vehicle?.chargingPortType?.[0] || 'CCS2'} port`,
        features: ['Fast charging compatible', 'Available 24/7', 'Covered parking'],
        tip: 'Look for stations with power output of 50kW or higher for faster charging'
      }
    ],
    nextChargeSuggestion: {
      when: batteryLevel < 30 ? 'Soon - within next few hours' : 
            batteryLevel < 50 ? 'Today or tomorrow' : 
            'In 2-3 days',
      why: batteryLevel < 30 ? 'Battery is low' : 
           batteryLevel < 50 ? 'Maintain optimal battery health' : 
           'Battery level is good',
      targetLevel: '80%'
    },
    generatedAt: new Date(),
    userId: userData.userId
  };
}

/**
 * Analyze charging routine and identify patterns
 */
function analyzeChargingRoutine(chargingHistory) {
  if (!chargingHistory || chargingHistory.length === 0) {
    return {
      hasPattern: false,
      frequency: 'irregular',
      suggestion: 'Start building a consistent charging routine'
    };
  }

  // Analyze charging times
  const chargingHours = chargingHistory.map(session => 
    new Date(session.startTime).getHours()
  );

  // Find most common charging hour
  const hourCounts = {};
  chargingHours.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const mostCommonHour = Object.keys(hourCounts).reduce((a, b) => 
    hourCounts[a] > hourCounts[b] ? a : b
  );

  // Calculate average frequency (days between charges)
  const timestamps = chargingHistory.map(s => new Date(s.startTime).getTime());
  timestamps.sort((a, b) => a - b);
  
  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push((timestamps[i] - timestamps[i - 1]) / (1000 * 60 * 60 * 24));
  }
  
  const avgInterval = intervals.length > 0 
    ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
    : 0;

  return {
    hasPattern: true,
    mostCommonHour: parseInt(mostCommonHour),
    averageInterval: avgInterval.toFixed(1),
    frequency: avgInterval < 2 ? 'daily' : avgInterval < 4 ? 'every-few-days' : 'weekly',
    consistency: intervals.length > 0 ? 
      (Math.max(...intervals) - Math.min(...intervals)) < 3 ? 'consistent' : 'variable' : 'unknown'
  };
}

module.exports = {
  generateUserRecommendations,
  analyzeChargingRoutine
};

