const Incident = require('../models/Incident');

// ─── Create Incident ───────────────────────────────────────────────────────────
exports.createIncident = async (req, res) => {
  try {
    const { title, description, type, severity, location, anonymous } = req.body;

    if (!location || location.lat == null || location.lng == null) {
      return res.status(400).json({ status: 'fail', message: 'Location (lat/lng) is required.' });
    }

    const incident = await Incident.create({
      title,
      description,
      type,
      severity,
      location,
      anonymous: anonymous || false,
      reportedBy: req.user._id,
    });

    res.status(201).json({ status: 'success', data: { incident } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ─── Get All Incidents ─────────────────────────────────────────────────────────
exports.getAllIncidents = async (req, res) => {
  try {
    const filter = {};

    // Optional type filter
    if (req.query.type) filter.type = req.query.type;
    // Optional severity filter
    if (req.query.severity) filter.severity = req.query.severity;
    // Optional status filter
    if (req.query.status) filter.status = req.query.status;

    const incidents = await Incident.find(filter)
      .populate({ path: 'reportedBy', select: 'name' })
      .sort({ createdAt: -1 });

    // Mask reporter name if anonymous, but let the owner know they own it
    const sanitised = incidents.map(inc => {
      const obj = inc.toObject();
      const isOwner = obj.reportedBy && obj.reportedBy._id.toString() === req.user._id.toString();
      
      if (obj.anonymous && !isOwner && req.user.role !== 'admin') {
        obj.reportedBy = { name: 'Anonymous' };
      }
      
      obj.isOwner = isOwner || req.user.role === 'admin';
      return obj;
    });


    res.status(200).json({ status: 'success', results: sanitised.length, data: { incidents: sanitised } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get Single Incident ───────────────────────────────────────────────────────
exports.getIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate({ path: 'reportedBy', select: 'name' });
    if (!incident) return res.status(404).json({ status: 'fail', message: 'No incident found with that ID.' });

    const obj = incident.toObject();
    const isOwner = obj.reportedBy && obj.reportedBy._id.toString() === req.user._id.toString();
    
    if (obj.anonymous && !isOwner && req.user.role !== 'admin') {
      obj.reportedBy = { name: 'Anonymous' };
    }
    
    obj.isOwner = isOwner || req.user.role === 'admin';
    res.status(200).json({ status: 'success', data: { incident: obj } });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Update Incident (owner only) ─────────────────────────────────────────────
exports.updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ status: 'fail', message: 'No incident found with that ID.' });

    // Only owner or admin may update
    if (incident.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'You do not have permission to update this incident.' });
    }

    const allowed = ['title', 'description', 'type', 'severity', 'location', 'status', 'anonymous'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) incident[field] = req.body[field];
    });

    await incident.save();
    res.status(200).json({ status: 'success', data: { incident } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ─── Delete Incident (owner only) ─────────────────────────────────────────────
exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ status: 'fail', message: 'No incident found with that ID.' });

    if (incident.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'You do not have permission to delete this incident.' });
    }

    await Incident.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get My Incidents ──────────────────────────────────────────────────────────
exports.getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: incidents.length, data: { incidents } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Upvote Incident ───────────────────────────────────────────────────────────
exports.upvoteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ status: 'fail', message: 'No incident found with that ID.' });

    const alreadyUpvoted = incident.upvotedBy.includes(req.user._id);
    if (alreadyUpvoted) {
      // Remove upvote (toggle)
      incident.upvotedBy = incident.upvotedBy.filter(id => id.toString() !== req.user._id.toString());
      incident.upvotes = Math.max(0, incident.upvotes - 1);
    } else {
      incident.upvotedBy.push(req.user._id);
      incident.upvotes += 1;
    }

    await incident.save();
    res.status(200).json({ status: 'success', data: { upvotes: incident.upvotes, upvoted: !alreadyUpvoted } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
