const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const GEMINI_API_KEY = 'AIzaSyD8_kKyUtm8xdEvfsVzWL33im80OTn5Yf4';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate AI-powered business suggestions based on analytics data
 */
async function generateBusinessSuggestions(analyticsData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert business analyst for an electric vehicle charging station network. Analyze the following business metrics and provide actionable insights and recommendations.

Business Data:
- Total Revenue: $${analyticsData.totalRevenue}
- Total Sessions: ${analyticsData.totalSessions}
- Total Energy Delivered: ${analyticsData.totalEnergy} kWh
- Average Session Duration: ${analyticsData.averageSessionDuration} minutes
- Growth Rate: ${analyticsData.growthRate}%
- Customer Satisfaction: ${analyticsData.customerSatisfaction}/5.0
- Top Performing Station: ${analyticsData.topPerformingStation}

Station Performance:
${analyticsData.stationPerformance ? analyticsData.stationPerformance.map(s => 
  `- ${s.name}: $${s.revenue}, ${s.sessions} sessions, ${s.utilization}% utilization`
).join('\n') : 'No station data available'}

Peak Hours Data:
${analyticsData.peakHours ? `Peak usage occurs during hours: ${analyticsData.peakHours.join(', ')}` : 'No peak hours data'}

Time Period: ${analyticsData.period || 'month'}

Based on this data, provide 4-5 specific, actionable business suggestions to:
1. Increase revenue
2. Improve customer satisfaction
3. Optimize station utilization
4. Reduce operational costs
5. Expand the business

Format your response as a JSON array with this structure:
[
  {
    "title": "Brief title (max 50 chars)",
    "description": "Detailed explanation (max 150 chars)",
    "category": "revenue|efficiency|customer|expansion|optimization",
    "impact": "high|medium|low",
    "priority": "high|medium|low"
  }
]

Respond ONLY with the JSON array, no markdown, no code blocks, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Remove markdown code blocks if present
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }

    const suggestions = JSON.parse(text);

    // Validate and ensure we have the right structure
    if (!Array.isArray(suggestions)) {
      throw new Error('Invalid response format from AI');
    }

    // Add timestamps and IDs
    return suggestions.map((suggestion, index) => ({
      id: `suggestion_${Date.now()}_${index}`,
      ...suggestion,
      generatedAt: new Date()
    }));

  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    
    // Return fallback suggestions if AI fails
    return getFallbackSuggestions(analyticsData);
  }
}

/**
 * Fallback suggestions if AI fails
 */
function getFallbackSuggestions(analyticsData) {
  const suggestions = [];

  // Revenue-based suggestion
  if (analyticsData.growthRate < 10) {
    suggestions.push({
      id: `suggestion_${Date.now()}_1`,
      title: 'Introduce Dynamic Pricing',
      description: 'Implement peak and off-peak pricing to increase revenue during high-demand hours while maintaining competitive rates.',
      category: 'revenue',
      impact: 'high',
      priority: 'high',
      generatedAt: new Date()
    });
  }

  // Utilization-based suggestion
  const lowUtilizationStations = analyticsData.stationPerformance?.filter(s => s.utilization < 50) || [];
  if (lowUtilizationStations.length > 0) {
    suggestions.push({
      id: `suggestion_${Date.now()}_2`,
      title: 'Boost Low-Performing Stations',
      description: `${lowUtilizationStations.length} station(s) have low utilization. Consider marketing campaigns or location optimization.`,
      category: 'efficiency',
      impact: 'medium',
      priority: 'medium',
      generatedAt: new Date()
    });
  }

  // Customer satisfaction suggestion
  if (analyticsData.customerSatisfaction < 4.5) {
    suggestions.push({
      id: `suggestion_${Date.now()}_3`,
      title: 'Improve Customer Experience',
      description: 'Customer satisfaction is below 4.5. Focus on station cleanliness, faster charging, and better amenities.',
      category: 'customer',
      impact: 'high',
      priority: 'high',
      generatedAt: new Date()
    });
  }

  // Peak hours suggestion
  suggestions.push({
    id: `suggestion_${Date.now()}_4`,
    title: 'Optimize Staffing for Peak Hours',
    description: 'Peak usage occurs during evening hours. Ensure adequate support during 6 PM - 8 PM for better customer service.',
    category: 'optimization',
    impact: 'medium',
    priority: 'medium',
    generatedAt: new Date()
  });

  // Expansion suggestion
  if (analyticsData.growthRate > 10) {
    suggestions.push({
      id: `suggestion_${Date.now()}_5`,
      title: 'Consider Network Expansion',
      description: 'Strong growth rate indicates market demand. Evaluate high-traffic areas for new station locations.',
      category: 'expansion',
      impact: 'high',
      priority: 'medium',
      generatedAt: new Date()
    });
  }

  return suggestions.slice(0, 5); // Return max 5 suggestions
}

module.exports = {
  generateBusinessSuggestions
};

