const { getTokenFromDotNet } = require("../helpers/getToken");
const Package = require("../model/packageModel");
const SubPackage = require("../model/subPackageModel");
const { PaymentProcess } = require("../helpers/payment");
const Session = require("../model/sessionModel");
const PFinancial = require("../model/PFinancialModel");

const paymentService ={
    joinSubscription: async (req, res) => {
        try {
            const token = req.headers['authorization'];
            console.log(req);
            
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
            const user = await getTokenFromDotNet(token);
            if (user.role !== "CompanyAdmin") {
                return res.status(401).json({ success: false, message: 'The company admin must renew the package.' });
            }
            const { packageId } = req.body;
            const pkg = await Package.findById(packageId);
            if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

            if (pkg.price === 0) {
                const alreadySubscribed = await SubPackage.findOne({
                    "company.id": user.id,
                    packageId
                });

                if (alreadySubscribed) {
                    return res.status(400).json({ success: false, message: "You cannot subscribe to the free package more than once." });
                } else {
                    const newSub = await SubPackage.create({
                        packageId,
                        company: user,
                        startSub: new Date(),
                        status: "accepted"
                    });
                    await newSub.save();
                    res.status(201).json({ success: true, message: "The package was successfully subscribed.", type: "Free", data: newSub });
                }
            }
            if (pkg.price > 0) {
                const data = await PaymentProcess({
                    price: pkg.price,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                })
                const newSub = await SubPackage.create({
                    packageId,
                    company: user,
                    startSub: new Date(),
                    status: "pending"
                });
                const newSession = await Session.create({ type: "SubPackage", typeId: newSub._id, orderId: data.orderId, status: "pending" })
                await newSub.save();
                await newSession.save();
                res.status(201).json({ success: true, message: "Please pay for the package.", type: "paid", iframURL: data.iframURL });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    payProject: async (req, res) => {
        try {
            const token = req.headers['authorization'];
    
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
    
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
    
            const { projectId, freelancerId, budget, deliveryTime } = req.body;
    
            // ✅ التحقق من البيانات المطلوبة
            if (!projectId || !freelancerId || !budget || !deliveryTime) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields (projectId, freelancerId, budgut, deliveryTime) are required.'
                });
            }
    
            if (typeof budget !== 'number' || budget <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'budgut must be a positive number.'
                });
            }
    
            // ✅ هنا يبدأ الدفع
            const data = await PaymentProcess({
                price: budget,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            });
    
            const newPFinancial = await PFinancial.create({
                company: user,
                projectId,
                freelancerId,
                budget,
                deliveryTime,
                paymentDate: new Date(),
                paymentStatus: "pending"
            });
    
            const newSession = Session.create({
                type: "PFinancial",
                typeId: newPFinancial._id,
                orderId: data.orderId,
                status: "pending"
            });
    
            await newPFinancial.save();
            await newSession.save();
    
            res.status(201).json({
                success: true,
                message: "Please pay for the package.",
                type: "paid",
                iframURL: data.iframURL
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    callBack: async (req, res) => {
        try {
          const {success, orderId, message } = req.body;
      
          if (success) {
            const session = await Session.findOne({ orderId });
      
            if (!session) {
              return res.status(404).json({ message: "Session not found" });
            }
      
            if (session.type === "SubPackage") {
              const subPackage = await SubPackage.findOne({ _id: session.typeId });
      
              if (!subPackage) {
                return res.status(404).json({ message: "SubPackage not found" });
              }
      
              subPackage.status = "accepted";
              await subPackage.save();
      
              session.status = "paid";
              await session.save();
            }
      
            // ممكن تضيف أنواع تانية هنا حسب نوع الجلسة
            // else if (session.type === "Plan") { ... }
      
            return res.status(200).json({success: true,  message: "Payment confirmed and data updated." });
          } else {
            return res.status(400).json({success: false,  message: "Payment was not successful", details: message });
          }
      
        } catch (error) {
          res.status(500).json({success: false, message:error.message});
        }
      }
      
}

module.exports = { paymentService };