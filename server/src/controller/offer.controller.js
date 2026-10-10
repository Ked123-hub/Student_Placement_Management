const offerService = require("../services/offer.service");

function sendError(res, err, fallbackCode) {
  const statusCode = err.statusCode || 500;
  const code = err.code || fallbackCode;

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message
    }
  });
}

async function createOffer(req, res) {
  try {
    const { driveId } = req.params;
    const offer = await offerService.createOffer(driveId, req.body);

    return res.status(201).json({
      success: true,
      data: offer
    });
  } catch (err) {
    return sendError(res, err, "OFFER_CREATE_FAILED");
  }
}

async function getDriveOffers(req, res) {
  try {
    const { driveId } = req.params;
    const data = await offerService.getDriveOffers(driveId);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    return sendError(res, err, "OFFER_FETCH_FAILED");
  }
}

async function getOfferById(req, res) {
  try {
    const { offerId } = req.params;
    const offer = await offerService.getOfferById(offerId);

    return res.status(200).json({
      success: true,
      data: offer
    });
  } catch (err) {
    return sendError(res, err, "OFFER_FETCH_FAILED");
  }
}

async function updateOffer(req, res) {
  try {
    const { offerId } = req.params;
    const offer = await offerService.updateOffer(offerId, req.body);

    return res.status(200).json({
      success: true,
      data: offer
    });
  } catch (err) {
    return sendError(res, err, "OFFER_UPDATE_FAILED");
  }
}

async function getStudentOffers(req, res) {
  try {
    const offers = await offerService.getStudentOffers(req.user.userId);

    return res.status(200).json({
      success: true,
      data: offers
    });
  } catch (err) {
    return sendError(res, err, "OFFER_FETCH_FAILED");
  }
}

async function getStudentOfferById(req, res) {
  try {
    const { offerId } = req.params;
    const offer = await offerService.getStudentOfferById(offerId, req.user.userId);

    return res.status(200).json({
      success: true,
      data: offer
    });
  } catch (err) {
    return sendError(res, err, "OFFER_FETCH_FAILED");
  }
}

module.exports = {
  createOffer,
  getDriveOffers,
  getOfferById,
  updateOffer,
  getStudentOffers,
  getStudentOfferById
};
