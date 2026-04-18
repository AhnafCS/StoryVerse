const Media = require('../models/Media');

const createMedia = function(req, res) {
  const title = req.body.title;
  const type = req.body.type;
  const creator = req.body.creator;
  const releaseYear = req.body.releaseYear;
  const summary = req.body.summary;
  const genres = req.body.genres;

  const newMedia = new Media({
    title: title,
    type: type,
    creator: creator,
    releaseYear: releaseYear,
    summary: summary,
    genres: genres
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
  Media.find()
    .then(function(list) {
      res.status(200).json(list);
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Failed to fetch media', error: err.message });
    });
};

module.exports = {
  createMedia: createMedia,
  getAllMedia: getAllMedia
};
