const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const GEMINI_API_KEY = 'AIzaSyD8_kKyUtm8xdEvfsVzWL33im80OTn5Yf4';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Analyze review sentiment using Gemini AI
 * Returns: 'positive', 'negative', or 'neutral'
 */
async function analyzeReviewSentiment(comment, rating) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert sentiment analyzer for EV charging station reviews. 
Analyze the following review and determine if the overall sentiment is positive, negative, or neutral.

Review Text: "${comment}"
Star Rating: ${rating}/5

Consider both the text content and the rating to determine sentiment:
- Positive: Generally satisfied, recommends, praises features, minimal complaints
- Negative: Generally dissatisfied, warns others, complains about issues, had bad experience
- Neutral: Mixed feelings, balanced pros and cons, average experience, factual without strong emotion

Respond with ONLY ONE WORD: "positive", "negative", or "neutral"
No explanation, no punctuation, just the sentiment word.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let sentiment = response.text().trim().toLowerCase();

    // Clean up response (remove any extra characters)
    sentiment = sentiment.replace(/[^a-z]/g, '');

    // Validate response
    if (!['positive', 'negative', 'neutral'].includes(sentiment)) {
      console.warn('Invalid AI sentiment response:', sentiment, 'Falling back to rating-based');
      return getRatingBasedSentiment(rating);
    }

    return sentiment;

  } catch (error) {
    console.error('Error analyzing review sentiment:', error);
    // Fallback to simple rating-based sentiment
    return getRatingBasedSentiment(rating);
  }
}

/**
 * Fallback: Determine sentiment based on rating only
 */
function getRatingBasedSentiment(rating) {
  if (rating >= 4) return 'positive';
  if (rating <= 2) return 'negative';
  return 'neutral';
}

/**
 * Batch analyze multiple reviews (for existing data migration)
 */
async function batchAnalyzeReviews(reviews) {
  const results = [];
  
  for (const review of reviews) {
    try {
      const sentiment = await analyzeReviewSentiment(review.comment, review.rating);
      results.push({
        reviewId: review._id || review.id,
        sentiment,
        originalRating: review.rating
      });
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error analyzing review ${review._id}:`, error);
      results.push({
        reviewId: review._id || review.id,
        sentiment: getRatingBasedSentiment(review.rating),
        originalRating: review.rating,
        error: true
      });
    }
  }
  
  return results;
}

/**
 * Get sentiment statistics for a station
 */
function calculateSentimentStats(reviews) {
  const total = reviews.length;
  
  if (total === 0) {
    return {
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      positivePercentage: 0,
      negativePercentage: 0,
      neutralPercentage: 0
    };
  }

  const counts = {
    positive: 0,
    negative: 0,
    neutral: 0
  };

  reviews.forEach(review => {
    const type = review.commentType || 'neutral';
    counts[type]++;
  });

  return {
    total,
    positive: counts.positive,
    negative: counts.negative,
    neutral: counts.neutral,
    positivePercentage: Math.round((counts.positive / total) * 100),
    negativePercentage: Math.round((counts.negative / total) * 100),
    neutralPercentage: Math.round((counts.neutral / total) * 100)
  };
}

module.exports = {
  analyzeReviewSentiment,
  batchAnalyzeReviews,
  calculateSentimentStats,
  getRatingBasedSentiment
};

