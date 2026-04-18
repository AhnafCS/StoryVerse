import Media from '../models/Media.js';

const createMedia = function(req, res) {
  const title = req.body.title;
  const type = req.body.type;
  const creator = req.body.creator;
  const releaseYear = req.body.releaseYear;
  const summary = req.body.summary;
  const genres = req.body.genres;
  const tags = req.body.tags;

  const newMedia = new Media({
    title: title,
    type: type,
    creator: creator,
    releaseYear: releaseYear,
    summary: summary,
    genres: genres,
    tags: tags
  });

  newMedia.save()
    .then(function(saved) {
      res.status(201).json(saved);
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Failed to add media', error: err.message });
    });
};

const getAllMedia = function(req, res) {
  const query = {};

  if (req.query.title) {
    query.title = { $regex: req.query.title, $options: 'i' };
  }
  if (req.query.genre) {
    query.genres = { $in: [req.query.genre] };
  }
  if (req.query.creator) {
    query.creator = { $regex: req.query.creator, $options: 'i' };
  }
  if (req.query.tag) {
    query.tags = { $in: [req.query.tag] };
  }

  Media.find(query)
    .then(function(list) {
      res.status(200).json(list);
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Failed to fetch media', error: err.message });
    });
};

const getMediaById = function(req, res) {
  Media.findById(req.params.id)
    .then(function(media) {
      if (!media) return res.status(404).json({ message: 'Media not found' });
      res.status(200).json(media);
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Failed to fetch media', error: err.message });
    });
};

export { createMedia, getAllMedia, getMediaById };
