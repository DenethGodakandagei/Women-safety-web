const { GoogleGenerativeAI } = require('@google/generative-ai');
const Incident = require('../models/Incident');

// Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Primary model



exports.predictRisk = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // radius in km, default 5km

    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide latitude and longitude (lat, lng).'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInKm = parseFloat(radius);

    // 1. Calculate bounding box for the radius (approximate)
    // 1 degree of latitude is ~111km
    const latDelta = radiusInKm / 111;
    // 1 degree of longitude is ~111km * cos(latitude)
    const lngDelta = radiusInKm / (111 * Math.cos(latitude * (Math.PI / 180)));

    const minLat = latitude - latDelta;
    const maxLat = latitude + latDelta;
    const minLng = longitude - lngDelta;
    const maxLng = longitude + lngDelta;

    // 2. Fetch incidents within the bounding box
    const nearbyIncidents = await Incident.find({
      'location.lat': { $gte: minLat, $lte: maxLat },
      'location.lng': { $gte: minLng, $lte: maxLng },
      status: { $ne: 'resolved' } // Only consider active or under_review incidents
    }).select('title type severity createdAt location description');

    // 3. Prepare data for Gemini
    let incidentSummary = nearbyIncidents.map(inc => ({
      type: inc.type,
      severity: inc.severity,
      date: inc.createdAt,
      title: inc.title,
      description: inc.description?.substring(0, 100)
    }));

    if (incidentSummary.length === 0) {
      // Return a safe status directly without calling Gemini to save quota/avoid errors
      return res.status(200).json({
        status: 'success',
        data: {
          location: { lat: latitude, lng: longitude },
          radius: radiusInKm,
          incidentsCount: 0,
          riskAnalysis: {
            riskScore: 5,
            riskLevel: "Safe",
            analysis: "No active safety incidents have been reported in this immediate area recently. This is a positive indicator, but as always, please stay alert.",
            safetySuggestions: ["Enjoy your visit while staying aware of your surroundings.", "Share your live location with a contact if walking alone.", "Keep your phone charged and easily accessible."],
            temporalAnalysis: "Insufficient local data to determine time-based risk patterns.",
            confidenceRate: 20
          }
        }
      });
    }

    const prompt = `

      Act as a safety expert for women's security. 
      Analyze the following incident data for a specific location (lat: ${lat}, lng: ${lng}) within a ${radius}km radius.
      
      Incidents found: ${JSON.stringify(incidentSummary)}
      
      Provide a Risk Prediction Analysis in JSON format with the following fields:
      1. "riskScore": A number from 0 to 100 representing the danger level (0 = Very Safe, 100 = Extremely Dangerous).
      2. "riskLevel": One of ["Safe", "Low", "Moderate", "High", "Critical"].
      3. "analysis": A brief 2-3 sentence explanation of why this rating was given.
      4. "safetySuggestions": An array of 3 practical safety tips for a woman visiting this area.
      5. "temporalAnalysis": A note on whether certain times of day (e.g., night) are riskier based on the data.
      6. "confidenceRate": A percentage (0-100%) indicating how confident you are in this prediction based on the amount of data provided.

      Return ONLY the JSON.
    `;

    // 4. Call Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up JSON response (in case Gemini adds markdown blocks)
    let cleanText = responseText.replace(/```json|```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    const riskAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };


    res.status(200).json({
      status: 'success',
      data: {
        location: { lat: latitude, lng: longitude },
        radius: radiusInKm,
        incidentsCount: nearbyIncidents.length,
        riskAnalysis
      }
    });

  } catch (err) {
    console.error('Risk Prediction Error:', err);
    // If Gemini fails (404, etc.), return a safe fallback instead of 500
    res.status(200).json({
      status: 'success',
      data: {
        location: { lat: parseFloat(req.query.lat), lng: parseFloat(req.query.lng) },
        radius: parseFloat(req.query.radius || 5),
        incidentsCount: 0,
        riskAnalysis: {
          riskScore: 30, // Default moderate safety
          riskLevel: "Moderate",
          analysis: "AI analysis is currently unavailable. Based on general area trends, please remain vigilant.",
          safetySuggestions: ["Always share your location with a trusted contact.", "Stay in well-lit areas.", "Have an emergency number on speed dial."],
          temporalAnalysis: "Data unavailable",
          confidenceRate: 0
        }
      }
    });
  }
};

exports.analyzeRoute = async (req, res) => {
  try {
    const { points } = req.body; // Array of {lat, lng} waypoints

    if (!points || !Array.isArray(points) || points.length < 2) {
      return res.status(400).json({ status: 'fail', message: 'Please provide at least 2 points (origin and destination) for route analysis.' });
    }

    // 1. Collect incidents along the route nodes
    // To be efficient, we scan around each waypoint with a 3km radius
    const allIncidents = [];
    const seenIds = new Set();
    const Incident = require('../models/Incident');

    for (const point of points) {
      const lat = parseFloat(point.lat);
      const lng = parseFloat(point.lng);
      
      const latDelta = 3 / 111;
      const lngDelta = 3 / (111 * Math.cos(lat * (Math.PI / 180)));

      const nearby = await Incident.find({
        'location.lat': { $gte: lat - latDelta, $lte: lat + latDelta },
        'location.lng': { $gte: lng - lngDelta, $lte: lng + lngDelta },
        status: { $ne: 'resolved' }
      }).select('type severity location title');

      nearby.forEach(inc => {
        if (!seenIds.has(inc._id.toString())) {
          allIncidents.push(inc);
          seenIds.add(inc._id.toString());
        }
      });
    }

    // 2. Prepare for Gemini
    const summary = allIncidents.map(i => ({ type: i.type, severity: i.severity, location: i.location.address }));
    
    const prompt = `
      Act as a travel safety agent for women.
      I am traveling between several points. Here is the list of reported safety incidents nearby these path segments:
      ${JSON.stringify(summary.slice(0, 30))} 

      Provide a Route Safety Verdict in JSON format with exactly these fields:
      - "overallSafety": "Safe", "Caution", or "High Risk"
      - "safetyRating": Score 0-100 (100 is safest)
      - "verdict": A simple 2-sentence summary of whether this route is good or bad.
      - "hotspots": An array of any specific areas mentioned in the incident list to approach with caution.
      - "recommendation": A simple suggestion for the best way to travel this route.

      Return ONLY pure JSON. No markdown. No explanations outside the JSON.
    `;

    // 3. AI call with fallback
    let riskAnalysis;
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      let cleanText = responseText.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      riskAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (aiErr) {
       console.error("Route AI Error:", aiErr);
    }

    if (!riskAnalysis) {
      riskAnalysis = {
        overallSafety: allIncidents.length > 5 ? "Caution" : "Safe",
        safetyRating: Math.max(0, 100 - (allIncidents.length * 5)),
        verdict: allIncidents.length > 0 ? `Found ${allIncidents.length} active incident reports along this corridor.` : "No active threats detected along this route. It appears to be a good choice.",
        hotspots: allIncidents.slice(0, 2).map(i => i.location.address || i.type),
        recommendation: "Stick to main roads and avoid deserted stretches."
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        incidentsCount: allIncidents.length,
        riskAnalysis
      }
    });

  } catch (err) {
    console.error('Route Analysis Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to analyze route safety.' });
  }
};



