const { getTokenFromDotNet } = require("../helpers/getToken");
const Package = require("../models/packageModel");
const SubPackage = require("../models/subPackageModel");
const { PaymentProcess } = require("../helpers/payment");
const Session = require("../models/sessionModel");
const PFinancial = require("../models/PFinancialModel");
const AdminWallet = require("../models/AdminWalletModel");
const FreelancerWallet = require("../models/freelancerWalletModel");
const CompanyWallet = require("../models/compamyWalletModel");

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
          if (user.role=="companyAdmin") {
            return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
          }
      
          const { projectId, freelancerId, budget, deliveryTime } = req.body;
      
          if (!projectId || !freelancerId || !budget || !deliveryTime) {
            return res.status(400).json({
              success: false,
              message: 'All fields (projectId, freelancerId, budget, deliveryTime) are required.'
            });
          }
      
          if (typeof budget !== 'number' || budget <= 0) {
            return res.status(400).json({
              success: false,
              message: 'Budget must be a positive number.'
            });
          }
      
          // ✅ تنفيذ الدفع
          const data = await PaymentProcess({
            price: budget,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          });
      
          // ✅ إنشاء المستندات بالتوازي
          const [newPFinancial, newSession] = await Promise.all([
            PFinancial.create({
              company: user,
              projectId,
              freelancerId,
              budget,
              deliveryTime,
              paymentDate: new Date(),
              paymentStatus: "pending"
            }),
            Session.create({
              type: "PFinancial",
              typeId:"",
              orderId: data.orderId,
              status: "pending"
            })
          ]);
      
          newSession.typeId = newPFinancial._id;
      
          // ✅ إنشاء المحافظ فقط عند الحاجة
          const walletPromises = [];
      
          const existingFreelancerWallet = await FreelancerWallet.findOne({ freelancerId });
          if (!existingFreelancerWallet) {
            walletPromises.push(FreelancerWallet.create({ freelancerId }));
          }
      
          const existingCompanyWallet = await CompanyWallet.findOne({ companyId: user.id });
          if (!existingCompanyWallet) {
            walletPromises.push(CompanyWallet.create({ companyId: user.id }));
          }
      
          walletPromises.push(newSession.save());
      
          await Promise.all(walletPromises);
      
          return res.status(201).json({
            success: true,
            message: "Please pay for the package.",
            type: "paid",
            iframURL: data.iframURL
          });
      
        } catch (err) {
          return res.status(500).json({ success: false, message: err.message });
        }
    },    
    callBack: async (req, res) => {
        try {
          const { success, orderId, message } = req.body;
      
          if (!success) {
            return res.status(400).json({ success: false, message: "Payment was not successful", details: message });
          }
      
          const session = await Session.findOne({ orderId });
          console.log(session);
          
          if (!session) return res.status(404).json({ message: "Session not found" });
      
          const adminWalletPromise = AdminWallet.findOne({ _id: "67f7bda255cec58cb4c3fd6b" });
      
          if (session.type === "SubPackage") {
            const subPackage = await SubPackage.findOne({ _id: session.typeId }).populate("packageId");
            if (!subPackage) return res.status(404).json({ message: "SubPackage not found" });
      
            const adminWallet = await adminWalletPromise;
      
            subPackage.status = "accepted";
            adminWallet.totalSubscription += subPackage.packageId.price;
            session.status = "paid";
      
            await Promise.all([
              subPackage.save(),
              adminWallet.save(),
              session.save()
            ]);
      
          } else if (session.type === "PFinancial") {
            const pFinancial = await PFinancial.findOne({ _id: session.typeId });
            if (!pFinancial) return res.status(404).json({ message: "Project Finances not found" });
      
            const [adminWallet, freelancerWallet, companyWallet] = await Promise.all([
              adminWalletPromise,
              FreelancerWallet.findOne({ freelancerId: pFinancial.freelancerId }),
              CompanyWallet.findOne({ companyId: pFinancial.company.id })
            ]);
      
            if (!freelancerWallet || !companyWallet) {
              return res.status(404).json({ message: "Freelancer or Company Wallet not found" });
            }
      
            pFinancial.paymentStatus = "paid";
      
            adminWallet.totalPendingMoney += pFinancial.budget;
      
            companyWallet.pendingBalance += pFinancial.budget;
            companyWallet.totalBalance = companyWallet.pendingBalance + companyWallet.previousBalance;
      
            freelancerWallet.pendingBalance += pFinancial.budget;
      
            session.status = "paid";
      
            await Promise.all([
              pFinancial.save(),
              companyWallet.save(),
              freelancerWallet.save(),
              adminWallet.save(),
              session.save()
            ]);
          }
      
          return res.status(200).json({ success: true, message: "Payment confirmed and data updated." });
      
        } catch (error) {
          res.status(500).json({ success: false, message: error.message });
        }
    },
    finishProject: async (req, res) => {
        try {
          const { projectId } = req.params;
      
          const pFinancial = await PFinancial.findOne(projectId);
          if (!pFinancial) {
            return res.status(404).json({ success: false, message: 'Project Financial not found!' });
          }
      
          const [adminWallet, freelancerWallet, companyWallet] = await Promise.all([
            AdminWallet.findOne({ _id: "67f7bda255cec58cb4c3fd6b" }),
            FreelancerWallet.findOne({ freelancerId :pFinancial.freelancerId }),
            CompanyWallet.findOne({ companyId: pFinancial.company.id })
          ]);
      
          if (!adminWallet || !freelancerWallet || !companyWallet) {
            return res.status(404).json({ success: false, message: "Wallets not found for admin, freelancer, or company." });
          }
      
          const amount = pFinancial.budget;
      
          // ✅ تعديل أرصدة المحافظ
          companyWallet.pendingBalance -= amount;
          companyWallet.previousBalance += amount;
          companyWallet.totalBalance = companyWallet.pendingBalance + companyWallet.previousBalance;
      
          adminWallet.totalPendingMoney -= amount;
          adminWallet.totalMoneyByFreelancersReceive += amount;
      
          freelancerWallet.pendingBalance -= amount;
          freelancerWallet.availableBalance += amount;
          freelancerWallet.totalBalance = freelancerWallet.pendingBalance + freelancerWallet.availableBalance;
      
          await Promise.all([
            companyWallet.save(),
            freelancerWallet.save(),
            adminWallet.save()
          ]);
      
          return res.status(200).json({ success: true, message: "Project finished and balances updated." });
      
        } catch (error) {
          return res.status(500).json({ success: false, message: error.message });
        }
    } 
}

module.exports = { paymentService };