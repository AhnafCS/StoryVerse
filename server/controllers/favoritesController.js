import User from '../models/User.js';

// Requirement 5: Add to Favorites
const addFavorite = function(req, res) {
  const userId = req.params.userId;
  const mediaId = req.body.mediaId;

  User.findByIdAndUpdate(
    userId,
    { $addToSet: { favorites: mediaId } },
    { new: true }
  )
    .populate('favorites')
    .then(function(user) {
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json({ message: 'Added to favorites', favorites: user.favorites });
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Failed to add favorite', error: err.message });
    });
};

// Get all favorites for a user
const getFavorites = function(req, res) {
  User.findById(req.params.userId)
    .populate('favorites')
    .then(function(user) {
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json(user.favorites);
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Failed to fetch favorites', error: err.message });
    });
};

// Remove from favorites
const removeFavorite = function(req, res) {
  const userId = req.params.userId;
  const mediaId = req.body.mediaId;

  User.findByIdAndUpdate(
    userId,
    { $pull: { favorites: mediaId } },
    { new: true }
  )
    .populate('favorites')
    .then(function(user) {
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json({ message: 'Removed from favorites', favorites: user.favorites });
    })
    .catch(function(err) {
      res.status(500).json({ message: 'Failed to remove favorite', error: err.message });
    });
};

export { addFavorite, getFavorites, removeFavorite };