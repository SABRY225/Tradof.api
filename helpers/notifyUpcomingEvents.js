const Event = require('../models/eventModel');
const Notification = require('../models/notificationModel');

const notifyUpcomingEvents = async () => {
  try {
    const now = new Date();
    const halfHourLater = new Date(now.getTime() + 30 * 60 * 1000);

    const events = await Event.find({
      startDate: { $gte: now, $lte: halfHourLater },
      notifiedBeforeStart: false
    }).populate('calendarId');

    for (const event of events) {
      const userId = event.calendarId?.user.id ;

      const newNotification = await Notification.create({ type:"Calendar", receiverId:userId, message:`The event "${event.title}" will start in half an hour.` });


      event.notifiedBeforeStart = true;
      await event.save();
    }

    console.log('✅ تم إرسال تنبيهات بالأحداث القادمة.');
  } catch (error) {
    console.error('❌ خطأ في إرسال تنبيهات الأحداث:', error.message);
  }
};

module.exports = notifyUpcomingEvents;
