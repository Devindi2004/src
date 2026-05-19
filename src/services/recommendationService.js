const MenuItem = require("../models/MenuItem");

const getRuleBasedRecommendations = async ({ user, category, favorites = [] }) => {
  const favoriteIds = [
    ...(user?.favorites || []).map((id) => id.toString()),
    ...favorites.map((id) => id.toString()),
  ];

  const preferredCategories = user?.preferences?.favoriteCategories || [];
  const query = {
    isAvailable: true,
    inventoryStatus: { $ne: "out-of-stock" },
  };

  const orRules = [];
  if (category) orRules.push({ category });
  if (preferredCategories.length) orRules.push({ category: { $in: preferredCategories } });
  if (favoriteIds.length) orRules.push({ _id: { $in: favoriteIds } });

  if (orRules.length) query.$or = orRules;

  let items = await MenuItem.find(query).sort({ featured: -1, popularityScore: -1, rating: -1 }).limit(10);

  if (items.length < 4) {
    items = await MenuItem.find({ isAvailable: true, inventoryStatus: { $ne: "out-of-stock" } })
      .sort({ popularityScore: -1, rating: -1 })
      .limit(10);
  }

  return {
    strategy: orRules.length ? "rule-based-preferences" : "trending-foods",
    items,
  };
};

module.exports = { getRuleBasedRecommendations };
