const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const { getAnalyticsOverview } = require("../services/analyticsService");

const getAnalytics = asyncHandler(async (_req, res) => {
  const analytics = await getAnalyticsOverview();
  successResponse(res, {
    message: "Analytics fetched.",
    data: { analytics },
  });
});

module.exports = { getAnalytics };
