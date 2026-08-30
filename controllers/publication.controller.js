const publicationService = require('../services/publication.service');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
};

const lister = async (req, res, next) => {
  try {
    const userIdentity = req.user ? publicationService.getUserIdentity(req) : null;
    const result = await publicationService.lister({ ...req.query, userIdentity });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const listerFeatured = async (req, res, next) => {
  try {
    const result = await publicationService.lister({ mis_en_avant: true, limit: 6 });
    res.json({ success: true, data: result.publications });
  } catch (error) {
    next(error);
  }
};

const creer = async (req, res, next) => {
  try {
    const payload = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const pub = await publicationService.creer(req, payload, req.file);
    res.status(201).json({ success: true, data: publicationService.formatPublication(pub) });
  } catch (error) {
    next(error);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const identity = publicationService.getUserIdentity(req);
    const result = await publicationService.toggleLike(req.params.id, identity);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getComments = async (req, res, next) => {
  try {
    const comments = await publicationService.getComments(req.params.id);
    res.json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const identity = publicationService.getUserIdentity(req);
    const comment = await publicationService.addComment(req.params.id, identity, req.body.contenu);
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

const supprimer = async (req, res, next) => {
  try {
    const result = await publicationService.supprimer(req.params.id, req);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  optionalAuth, lister, listerFeatured, creer, toggleLike, getComments, addComment, supprimer,
};
