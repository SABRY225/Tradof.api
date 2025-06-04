const Session = require('../models/sessionModel');
const PFinancial = require('../models/PFinancialModel');
const SubPackage = require('../models/subPackageModel');
const Notification = require('../models/notificationModel');


const notifyExpiringPackages = async () => {
  try {
    const now = new Date();

    const subPackages = await SubPackage.find({ status: 'accepted' }).populate('packageId');

    for (const sub of subPackages) {
      const durationInMonths = sub.packageId.durationInMonths;
      const startDate = new Date(sub.startSub);

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationInMonths);

      const timeLeft = endDate.getTime() - now.getTime();
      const hoursLeft = timeLeft / (1000 * 60 * 60);

      if (hoursLeft <= 24 && hoursLeft > 0) {
        const companyId = sub.company.id;

        const existingNotification = await Notification.findOne({
          receiverId: companyId.toString(),
          type: 'Subscriptions',
          message: 'Your subscription will expire in 24 hours'
        });

        if (!existingNotification) {
          const newNotification=new Notification({
            type: 'Subscriptions',
            receiverId: companyId.toString(),
            message: 'Your subscription will expire in 24 hours',
            description: `Your current subscription will expire on ${endDate.toLocaleDateString()}`,
          });
          await newNotification.save();

          console.log(`Notification sent to company ${companyId}`);
        }
      }
    }
  } catch (err) {
    console.error('Error creating subscription expiration notifications:', err.message);
  }
};


const deleteOldPendingDocs = async () => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const sessionResult = await Session.deleteMany({
      status: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    });

    const pFinancialResult = await PFinancial.deleteMany({
      paymentStatus: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    });

    const subPackageResult = await SubPackage.deleteMany({
      status: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    });

    console.log(`Deleted:
    • ${sessionResult.deletedCount} Sessions
    • ${pFinancialResult.deletedCount} PFinancials
    • ${subPackageResult.deletedCount} SubPackages`);
  } catch (err) {
    console.error('Error cleaning pending documents:', err.message);
  }
};

module.exports = {
  deleteOldPendingDocs,
  notifyExpiringPackages
};
