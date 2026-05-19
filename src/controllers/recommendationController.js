const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const { getRuleBasedRecommendations } = require("../services/recommendationService");

const getRecommendations = asyncHandler(async (req, res) => {
  const result = await getRuleBasedRecommendations({
    user: req.user,
    category: req.body.category,
    favorites: req.body.favorites || [],
  });

  successResponse(res, {
    message: "Recommendations fetched.",
    data: result,
  });
});

module.exports = { getRecommendations };
