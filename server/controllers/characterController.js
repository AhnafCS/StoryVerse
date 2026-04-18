import Character from '../models/Character.js';

// Requirement 3: Add Character
const createCharacter = function(req, res) {
  const name = req.body.name;
  const description = req.body.description;
  const background = req.body.background;
  const mediaId = req.body.mediaId;

  const newCharacter = new Character({
    name: name,
    description: description,
    background: background,
    mediaId: mediaId
  });

  newCharacter.save()
    .then(function(saved) {
      res.status(201).json(saved);
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Failed to add character', error: err.message });
    });
};

// Get all characters for a specific media
const getCharactersByMedia = function(req, res) {
  Character.find({ mediaId: req.params.mediaId })
    .then(function(characters) {
      res.status(200).json(characters);
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Failed to fetch characters', error: err.message });
    });
};

// Delete a character
const deleteCharacter = function(req, res) {
  Character.findByIdAndDelete(req.params.id)
    .then(function() {
      res.status(200).json({ message: 'Character deleted' });
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Failed to delete character', error: err.message });
    });
};

export { createCharacter, getCharactersByMedia, deleteCharacter };