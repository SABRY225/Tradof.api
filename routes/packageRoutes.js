const express = require("express");
const { packageService } = require("../services/packageService");
const router = express.Router();

router.get("/",packageService.getPackages);
router.post("/",packageService.createPackage);
router.patch("/:packageId",packageService.editPackage);
router.delete("/:packageId",packageService.deletePackage)

module.exports = router;
  