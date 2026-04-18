import Request from "../models/Request.js";

// Enhanced AI-like categorization based on keywords and context
const categorizeRequest = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();

  // Frontend patterns
  const frontendKeywords = ['react', 'vue', 'angular', 'frontend', 'ui', 'css', 'html', 'javascript', 'component', 'responsive', 'mobile', 'web', 'browser', 'dom', 'jsx', 'tsx'];
  // Backend patterns
  const backendKeywords = ['node', 'express', 'api', 'backend', 'server', 'database', 'authentication', 'jwt', 'middleware', 'routes', 'controllers', 'models'];
  // Database patterns
  const databaseKeywords = ['mongo', 'mongodb', 'mongoose', 'sql', 'mysql', 'postgresql', 'schema', 'collection', 'query', 'aggregation'];
  // DevOps patterns
  const devopsKeywords = ['docker', 'aws', 'deployment', 'ci/cd', 'kubernetes', 'nginx', 'apache', 'server', 'hosting', 'cloud'];
  // AI/ML patterns
  const aiKeywords = ['ai', 'ml', 'machine learning', 'neural', 'tensorflow', 'pytorch', 'data science', 'algorithm', 'model'];

  const frontendScore = frontendKeywords.filter(keyword => text.includes(keyword)).length;
  const backendScore = backendKeywords.filter(keyword => text.includes(keyword)).length;
  const databaseScore = databaseKeywords.filter(keyword => text.includes(keyword)).length;
  const devopsScore = devopsKeywords.filter(keyword => text.includes(keyword)).length;
  const aiScore = aiKeywords.filter(keyword => text.includes(keyword)).length;

  const scores = [
    { category: 'Frontend', score: frontendScore },
    { category: 'Backend', score: backendScore },
    { category: 'Database', score: databaseScore },
    { category: 'DevOps', score: devopsScore },
    { category: 'AI/ML', score: aiScore }
  ];

  const maxScore = Math.max(...scores.map(s => s.score));
  if (maxScore > 0) {
    return scores.find(s => s.score === maxScore).category;
  }

  return 'Other';
};

// Enhanced urgency detection with context understanding
const detectUrgency = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();

  // High urgency indicators
  const highUrgencyWords = ['urgent', 'asap', 'emergency', 'critical', 'broken', 'crash', 'down', 'fail', 'error', 'bug', 'fix immediately', 'production', 'deadline'];
  // Medium urgency indicators
  const mediumUrgencyWords = ['soon', 'important', 'needed', 'help', 'stuck', 'issue', 'problem', 'question', 'advice'];

  const highMatches = highUrgencyWords.filter(word => text.includes(word)).length;
  const mediumMatches = mediumUrgencyWords.filter(word => text.includes(word)).length;

  if (highMatches > 0) return 'High';
  if (mediumMatches > 1) return 'Medium'; // Need multiple medium indicators

  return 'Low';
};

// Enhanced tag suggestions with intelligent matching
const suggestTags = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  const suggestedTags = new Set();

  const tagMappings = {
    'React': ['react', 'jsx', 'component', 'hooks', 'state', 'props', 'redux', 'context'],
    'Node.js': ['node', 'nodejs', 'express', 'npm', 'package.json', 'middleware'],
    'JavaScript': ['javascript', 'js', 'es6', 'async', 'promise', 'function', 'variable'],
    'TypeScript': ['typescript', 'ts', 'interface', 'type', 'generic'],
    'MongoDB': ['mongodb', 'mongoose', 'collection', 'document', 'aggregation'],
    'CSS': ['css', 'scss', 'sass', 'tailwind', 'bootstrap', 'flexbox', 'grid'],
    'HTML': ['html', 'dom', 'element', 'attribute', 'semantic'],
    'Python': ['python', 'django', 'flask', 'pip', 'virtualenv'],
    'API': ['api', 'rest', 'graphql', 'endpoint', 'http', 'json'],
    'Database': ['database', 'sql', 'mysql', 'postgresql', 'query', 'join'],
    'Docker': ['docker', 'container', 'image', 'dockerfile', 'compose'],
    'AWS': ['aws', 'ec2', 's3', 'lambda', 'cloudformation'],
    'Performance': ['performance', 'optimization', 'speed', 'memory', 'cpu'],
    'Security': ['security', 'auth', 'authentication', 'authorization', 'jwt', 'oauth'],
    'Testing': ['test', 'jest', 'mocha', 'cypress', 'unit test', 'integration'],
    'Git': ['git', 'github', 'merge', 'branch', 'commit', 'pull request']
  };

  // Find matching tags based on keyword presence
  Object.entries(tagMappings).forEach(([tag, keywords]) => {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > 0) {
      suggestedTags.add(tag);
    }
  });

  // Add contextual tags based on combinations
  if (text.includes('react') && text.includes('api')) {
    suggestedTags.add('API Integration');
  }
  if (text.includes('node') && text.includes('database')) {
    suggestedTags.add('Backend Development');
  }
  if (text.includes('css') && text.includes('responsive')) {
    suggestedTags.add('Responsive Design');
  }

  return Array.from(suggestedTags).slice(0, 6); // Limit to 6 suggestions
};

export const createRequest = async (req, res) => {
  const { title, description, category, urgency, tags } = req.body;

  try {
    // AI-enhanced categorization and urgency detection
    const aiCategory = category || categorizeRequest(title, description);
    const aiUrgency = urgency || detectUrgency(title, description);
    const aiTags = tags || suggestTags(title, description);

    const request = await Request.create({
      title,
      description,
      category: aiCategory,
      urgency: aiUrgency,
      tags: aiTags,
      userId: req.user._id
    });

    // Populate user info
    await request.populate('userId', 'fullName email');

    res.status(201).json(request);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    const { category, urgency, skills, location, status = 'open' } = req.query;

    let filter = { status };

    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (skills) {
      filter.tags = { $in: skills.split(',').map(s => new RegExp(s.trim(), 'i')) };
    }

    // If location filter is provided, we would need to join with user data
    // For now, we'll skip location filtering as it requires user location data

    const requests = await Request.find(filter)
      .populate('userId', 'fullName email role skills location')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('userId', 'fullName email role skills location')
      .populate('helperId', 'fullName email');

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only request owner or assigned helper can mark as solved
    if (status === 'solved' && request.userId.toString() !== req.user._id.toString() && request.helperId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the request owner or assigned helper can mark as solved" });
    }

    request.status = status;
    if (status === 'solved') {
      request.solvedAt = new Date();
      request.helperId = req.user._id; // Mark current user as helper
    }

    await request.save();
    await request.populate('userId', 'fullName email');
    await request.populate('helperId', 'fullName email');

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user._id })
      .populate('helperId', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};