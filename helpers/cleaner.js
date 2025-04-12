const Session = require('../models/sessionModel');
const PFinancial = require('../models/PFinancialModel');
const SubPackage = require('../models/subPackageModel');

const deleteOldPendingDocs = async () => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Delete pending Sessions
    const sessionResult = await Session.deleteMany({
      status: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    });

    // Delete pending PFinancials
    const pFinancialResult = await PFinancial.deleteMany({
      paymentStatus: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    });

    // Delete pending SubPackages
    const subPackageResult = await SubPackage.deleteMany({
      status: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    });

    console.log(`✅ Deleted:
    • ${sessionResult.deletedCount} Sessions
    • ${pFinancialResult.deletedCount} PFinancials
    • ${subPackageResult.deletedCount} SubPackages`);
  } catch (err) {
    console.error('❌ Error cleaning pending documents:', err.message);
  }
};

module.exports = deleteOldPendingDocs;
