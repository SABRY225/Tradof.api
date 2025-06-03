const { imageUploadUtil } = require("../helpers/cloudinary");
const { getTokenFromDotNet } = require("../helpers/getToken");
const Notification = require("../models/notificationModel");
const TechnicalSupport = require("../models/technicalSupportModel");
const sharp = require("sharp");

const technicalSupportService = {
    sendMessage: async (req, res) => {
        try {
            const token = req.headers['authorization'];
            
            if (!token) return res.status(400).json({ success: false, message: 'Token is missing!' });
            
            const user = await getTokenFromDotNet(token);

            if (!user) return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            
            const { senderId, message } = req.body;
            if (!senderId) {
                return res.status(403).json({ success: false, message: 'The sender must be the admin or the user' });
            }
    
            let chat = await TechnicalSupport.findOneAndUpdate(
                { user:user, admin:"admin" },
                { $setOnInsert: { user:user, admin:"admin", messages: [] } },
                { new: true, upsert: true }
            );
    
            let fileUrl = null;
            if (req.file) {
                try {
                    const optimizedImage = await sharp(req.file.buffer)
                        .resize(800)
                        .jpeg({ quality: 80 })
                        .toBuffer();
    
                    const base64Image = `data:${req.file.mimetype};base64,${optimizedImage.toString("base64")}`;
                    const uploadResponse = await imageUploadUtil(base64Image);
                    fileUrl = uploadResponse.secure_url;
                } catch (uploadError) {
                    return res.status(500).json({ success: false, message: "File upload failed", error: uploadError.message });
                }
            }
    
            chat.messages.push({ senderId, message, file: fileUrl });
            await chat.save();
            const newNotification = await Notification.create({ type:"Technical Support", receiverId:"admin", message:"Message from technical support" });
            await newNotification.save();
            res.status(201).json({ success: true, message: "Message sent successfully" });
    
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },    
    sendMessageAdmin: async (req, res) => {
      try {
          const token = req.headers['authorization'];
          
          if (!token) return res.status(400).json({ success: false, message: 'Token is missing!' });
          
          const user = await getTokenFromDotNet(token);

          if (!user) return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
          
          const { receiverId, message } = req.body;
          if (!receiverId) {
              return res.status(403).json({ success: false, message: 'The sender must be the admin or the user' });
          }
  
          let chat = await TechnicalSupport.findOneAndUpdate(
              { "user.id":receiverId, admin:"admin" },
              { $setOnInsert: { "user.id":receiverId, admin:"admin", messages: [] } },
              { new: true, upsert: true }
          );
  
          let fileUrl = null;
          if (req.file) {
              try {
                  const optimizedImage = await sharp(req.file.buffer)
                      .resize(800)
                      .jpeg({ quality: 80 })
                      .toBuffer();
  
                  const base64Image = `data:${req.file.mimetype};base64,${optimizedImage.toString("base64")}`;
                  const uploadResponse = await imageUploadUtil(base64Image);
                  fileUrl = uploadResponse.secure_url;
              } catch (uploadError) {
                  return res.status(500).json({ success: false, message: "File upload failed", error: uploadError.message });
              }
          }
  
          chat.messages.push({ senderId:"admin", message, file: fileUrl });
          await chat.save();
          const newNotification = await Notification.create({ type:"Technical Support",receiverId:"admin", message:`Message from the user ${user.firstName+" "+user.lastName}` });
          await newNotification.save();
          res.status(201).json({ success: true, message: "Message sent successfully" });
  
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  },    
    getMessages: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            const { userId } = req.params;

            const chat = await TechnicalSupport.findOne({ "user.id":userId }).sort({ timestamp: 1 });;

            if (!chat) {
                return res.status(404).json({ success: false, message: "No messages found" });
            }
            res.status(200).json({
                success: true,
                messages: chat.messages
            });

        } catch (error) {
            res.status(500).json({ success: false, message:error.message });
        }
    },
    getLatestMessagesFromAllUsers: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            const aggregatedData = await TechnicalSupport.aggregate([
                // فك مصفوفة الرسائل
                { $unwind: '$messages' },
                // ترتيب الرسائل حسب وقت الإرسال لكل محادثة
                { $sort: { 'messages.timestamp': 1 } },
                // تجميع الرسائل حسب معرف المستخدم
                {
                  $group: {
                    _id: '$user.id',
                    user: { $first: '$user' },
                    admin: { $first: '$admin' },
                    allMessages: { $push: '$messages' }, // تجميع جميع الرسائل
                    latestMessage: { $first: '$messages' }, // الحصول على أحدث رسالة
                  },
                },
                // حساب عدد الرسائل غير المقروءة
                {
                  $project: {
                    _id: 0,
                    userId: '$_id',
                    user: 1,
                    admin: 1,
                    allMessages: 1,
                    latestMessage: 1,
                    unreadCount: {
                      $reduce: {
                        input: '$allMessages',
                        initialValue: 0,
                        in: {
                          $cond: [
                            {
                              $and: [
                                { $eq: ['$$this.senderId', '$userId'] }, // الرسالة من المستخدم
                                {
                                  $not: [
                                    {
                                      $gt: [
                                        '$$this.timestamp',
                                        {
                                          $arrayElemAt: [
                                            '$allMessages.timestamp',
                                            {
                                              $indexOfArray: [
                                                '$allMessages.senderId',
                                                '$admin',
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                            { $add: ['$$value', 1] },
                            '$$value',
                          ],
                        },
                      },
                    },
                  },
                },
              ]);
            res.status(200).json({
                success: true,
                messages: aggregatedData
            });

        } catch (error) {
            res.status(500).json({ success: false, message:error.message });
        }
    },
};

module.exports = { technicalSupportService };
