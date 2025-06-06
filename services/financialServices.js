const { getTokenFromDotNet } = require("../helpers/getToken");
const Package = require("../models/packageModel");
const SubPackage = require("../models/subPackageModel");
const { PaymentProcess } = require("../helpers/payment");
const Session = require("../models/sessionModel");
const PFinancial = require("../models/PFinancialModel");
const FinancialHistoryCompany = require("../models/financialHistoryCompanyModel");
const axios = require("axios");
const https = require("https");
const CompanyWallet = require("../models/compamyWalletModel");
const FreelancerWallet = require("../models/freelancerWalletModel");
const AdminWallet = require("../models/AdminWalletModel");
const WithdrawProfit = require("../models/withdrawProfitModel");
const FinancialHistoryFreelancer = require("../models/financialHistoryFreelancerModel");
const Invoice = require("../models/InvoiceModel");
const Notification = require("../models/notificationModel");

const financialService = {
    getStatusProject: async (req, res) => {
        try {
            const { projectId } = req.params;
            if (!projectId) {
                return res.status(400).json({ success: false, message: 'projectId is required' });
            }

            // نجيب أحدث حالة دفع للمشروع ده
            const latestPayment = await PFinancial.findOne({ projectId })
                .sort({ createdAt: -1 }); // ترتيب تنازلي بالأحدث

            if (!latestPayment) {
                return res.status(200).json({ success: false, message: 'No payment record found for this projectId', paymentStatus: "pending" });
            }

            res.status(200).json({
                success: true,
                paymentStatus: latestPayment.paymentStatus,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getProjectByCompany: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            // 1. استدعاء بيانات المشاريع من الـ API الخارجي
            const response = await axios.get(`http://tradof.runasp.net/api/project/allstartedprojects?companyId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            });
            const { items } = response.data;

            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ success: false, message: 'No projects found in response.' });
            }

            // 2. استخراج كل الـ projectId من المشاريع
            const projectIds = items.map(item => String(item.id));

            // 3. نجيب كل العمليات المالية للمشاريع دي
            const payments = await PFinancial.find({ projectId: { $in: projectIds } })
                .sort({ createdAt: -1 }); // ترتيب عشان ندي الأولوية للأحدث

            // 5. نركب البيانات النهائية
            const result = items.map(project => {
                // بنجيب أحدث دفعة خاصة بالمشروع الحالي
                const latestPayment = payments.find(p => p.projectId == project.id);

                return {
                    ...project,
                    paymentStatus: latestPayment?.paymentStatus || "pending",
                    paymentPrice: latestPayment?.budget || 0,
                    paymentDate: latestPayment?.paymentDate || null,
                };
            });

            // 6. نرجع النتيجة
            res.status(200).json({
                success: true,
                data: result.map((project) => ({
                    user: {
                        id: project.freelancerId,
                        profileImageUrl: project.freelancerProfileImageUrl,
                        firstName: project.freelancerFirstName,
                        lastName: project.freelancerLastName
                    },
                    prjectData: {
                        id: project.id,
                        name: project.name,
                        depoistPrice: project.price,
                        deliveryTime: project.days,
                        posted: project.startDate
                    },
                    paymentStatus: project.paymentStatus
                }))
            });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getProjectByFreelancer: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            // 1. استدعاء بيانات المشاريع من الـ API الخارجي
            const response = await axios.get(`http://tradof.runasp.net/api/project/projects/freelancer?freelancerId=${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            });
            const { items } = response.data;

            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ success: false, message: 'No projects found in response.' });
            }

            // 2. استخراج كل الـ projectId من المشاريع
            const projectIds = items.map(item => String(item.id));

            // 3. نجيب كل العمليات المالية للمشاريع دي
            const payments = await PFinancial.find({ projectId: { $in: projectIds } })
                .sort({ createdAt: -1 }); // ترتيب عشان ندي الأولوية للأحدث


            // 5. نركب البيانات النهائية
            const result = items.map(project => {
                // بنجيب أحدث دفعة خاصة بالمشروع الحالي
                const latestPayment = payments.find(p => p.projectId == project.id);

                return {
                    ...project,
                    paymentStatus: latestPayment?.paymentStatus || "pending",
                    paymentPrice: latestPayment?.budget || 0,
                    paymentDate: latestPayment?.paymentDate || null,
                };
            });

            // 6. نرجع النتيجة
            res.status(200).json({
                success: true,
                data: result.map((project) => ({
                    user: {
                        id: project.companyId,
                        profileImageUrl: project.profileImageUrl,
                        firstName: project.firstName,
                        lastName: project.lastName
                    },
                    prjectData: {
                        id: project.id,
                        name: project.name,
                        depoistPrice: project.price,
                        deliveryTime: project.days,
                        posted: project.startDate,
                    },
                    paymentStatus: project.paymentStatus
                }))
            });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getStatisticsByCompany: async (req, res) => {
        try {
            console.log("log");

            const token = req.headers['authorization'];

            // Validate Token
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            const { companyId } = req.params;

            // Validate companyId
            if (!companyId || companyId.trim() === "") {
                return res.status(400).json({ success: false, message: 'companyId is required!' });
            }

            const companyFinancial = await CompanyWallet.findOne({ companyId });

            // Validate if financial data exists
            if (!companyFinancial) {
                return res.status(200).json({
                    success: true, data: {
                        totalBalance: 0,
                        previousBalance: 0,
                        pendingBalance: 0
                    }
                });
            }

            // Response
            return res.status(200).json({
                success: true,
                data: {
                    totalBalance: companyFinancial.totalBalance,
                    previousBalance: companyFinancial.previousBalance,
                    pendingBalance: companyFinancial.pendingBalance
                }
            });

        } catch (error) {
            console.error("Error in getStatisticsByCompany:", error);
            return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
        }
    },
    getStatisticsByFreelancer: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            // Validate Token
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            const { freelancerId } = req.params;

            // Validate freelancerId
            if (!freelancerId || freelancerId.trim() === "") {
                return res.status(400).json({ success: false, message: 'freelancerId is required!' });
            }

            const freelancerFinancial = await FreelancerWallet.findOne({ freelancerId });

            // Validate if financial data exists
            if (!freelancerFinancial) {
                return res.status(200).json({
                    success: true,
                    data: {
                        totalBalance: 0,
                        availableBalance: 0,
                        pendingBalance: 0
                    }
                });
            }

            // Response
            return res.status(200).json({
                success: true,
                data: {
                    totalBalance: freelancerFinancial.totalBalance,
                    availableBalance: freelancerFinancial.availableBalance,
                    pendingBalance: freelancerFinancial.pendingBalance
                }
            });

        } catch (error) {
            return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
        }
    },
    getStatisticsByAdmin: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            // Validate Token
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);

            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            if (user.role !== "Admin") {
                return res.status(401).json({ success: false, message: 'You are not an admin' });
            }

            const adminFinancial = await AdminWallet.findOne({ _id: "67f7bda255cec58cb4c3fd6b" });

            // Response
            res.status(200).json({
                success: true,
                data: {
                    totalSubscription: adminFinancial.totalSubscription,
                    totalPendingMoney: adminFinancial.totalPendingMoney,
                    totalMoneyByFreelancers: adminFinancial.totalMoneyByFreelancers,
                    totalMoneyByFreelancersReceive: adminFinancial.totalMoneyByFreelancersReceive
                }
            });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error: ' + error.message });
        }
    },
    requestWithdrawProfits: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            // Validate Token
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user.role || user.role !== "Freelancer") {
                return res.status(401).json({ success: false, message: 'Invalid token or user not authorized!' });
            }

            const { amount, paymentDetails } = req.body;

            // Validation
            if (!amount || !paymentDetails) {
                return res.status(400).json({ success: false, message: 'Amount and payment details are required!' });
            }

            // Check if user already has a pending or processing withdraw request
            const existingRequest = await WithdrawProfit.findOne({
                'freelancer.id': user.id,
                paymentStatus: 'pending'
            });

            if (existingRequest) {
                return res.status(400).json({ success: false, message: 'You already have a pending withdraw request. Please wait until it is processed.' });
            }

            const freelancerWallet = await FreelancerWallet.findOne({ freelancerId: user.id });
            if (!freelancerWallet) {
                return res.status(400).json({ success: false, message: 'The freelancer has no wallet.' });
            }

            if (freelancerWallet.availableBalance < amount) {
                return res.status(400).json({ success: false, message: 'The amount is greater than the available balance.' });
            }

            const newRequest = new WithdrawProfit({
                freelancer: user,
                amount,
                paymentDetails,
                paymentStatus: 'pending'
            });

            await newRequest.save();

            const invoiceNumber = `INV-${Date.now()}`;
            const invoice = await Invoice.create({
                type: "Withdraw Profits",
                invoiceNumber,
                user,
                withdrawProfitId: newRequest._id
            });

            const newNotification = new Notification({
                type: "Withdraw Profit",
                receiverId: "admin",
                message: "There is a request to withdraw new profits"
            });
            await newNotification.save();

            res.status(201).json({
                success: true,
                message: 'Withdraw request submitted and invoice created successfully!',
                withdrawId: newRequest._id,
                invoiceId: invoice._id
            });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    editStatusRequest: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            // Validate Token
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user || user.role !== "Admin") {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const { requestId } = req.params;
            const { paymentStatus } = req.body;

            if (!requestId || !paymentStatus) {
                return res.status(400).json({ success: false, message: 'Invalid input' });
            }

            const withdrawRequest = await WithdrawProfit.findById(requestId);
            if (!withdrawRequest) {
                return res.status(404).json({ success: false, message: 'Withdraw request not found!' });
            }

            if (paymentStatus === "paid") {
                const adminWallet = await AdminWallet.findOne({ _id: "67f7bda255cec58cb4c3fd6b" });
                const freelancerWallet = await FreelancerWallet.findOne({ freelancerId: withdrawRequest.freelancer.id });
                if (!freelancerWallet) {
                    return res.status(404).json({ success: false, message: 'Freelancer wallet not found' });
                }

                if (freelancerWallet.availableBalance < withdrawRequest.amount) {
                    return res.status(400).json({ success: false, message: 'Insufficient balance in freelancer wallet' });
                }

                freelancerWallet.availableBalance -= withdrawRequest.amount;
                freelancerWallet.totalBalance = freelancerWallet.availableBalance + freelancerWallet.pendingBalance;


                adminWallet.totalMoneyByFreelancersReceive -= withdrawRequest.amount;
                await adminWallet.save();
                await freelancerWallet.save();
                const newNotification = new Notification({ type: "Withdraw Profit", receiverId: withdrawRequest.freelancer.id, message: "The money was successfully sent, please review your bank and also bills" });
                await newNotification.save();
            }

            withdrawRequest.paymentStatus = paymentStatus;
            await withdrawRequest.save();
            const newNotification = new Notification({ type: "Withdraw Profit", receiverId: withdrawRequest.freelancer.id, message: "Your request has been rejected for the process of withdrawing profits, please verify the bank account data" });
            await newNotification.save();
            res.status(200).json({ success: true, message: 'Withdraw request updated and wallet adjusted successfully.' });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getProfitRequests: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            // Validate Token
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            if (user.role !== "Admin") {
                return res.status(401).json({ success: false, message: 'You are not an admin' });
            }

            const requests = await WithdrawProfit.find({}).sort({ createdAt: -1 });

            res.status(200).json({ success: true, data: requests });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getIncomeStatisticsCompany: async (req, res, next) => {
        const token = req.headers['authorization'];

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is missing!' });
        }

        const user = await getTokenFromDotNet(token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
        }

        let data;
        if (user.role === "Freelancer") {
            data = await FinancialHistoryFreelancer.findOne({ "user.id": user.id });
            if (!data) {
                data = await FinancialHistoryFreelancer.create({
                    user: user,
                    statistics: new Map()
                });
            }
        } else {
            data = await FinancialHistoryCompany.findOne({ "user.id": user.id });
            if (!data) {
                data = await FinancialHistoryCompany.create({
                    user: user,
                    statistics: new Map()
                });
            }
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const monthsToShow = 6;
        const result = { [currentYear]: {} };
        let months = [];

        // حساب الشهور السابقة (5 شهور قبل الشهر الحالي على الأكثر)
        let prevCount = Math.min(monthsToShow - 1, currentMonth - 1);

        // 1. الشهور السابقة
        for (let i = currentMonth - prevCount; i < currentMonth; i++) {
            months.push(i);
        }

        // 2. الشهر الحالي
        months.push(currentMonth);

        let nextMonth = currentMonth + 1;
        while (months.length < monthsToShow && nextMonth <= 12) {
            months.push(nextMonth);
            nextMonth++;
        }

        let maxValue = -Infinity;

        // الحصول على بيانات السنة (هي Map)
        // ممكن تكون undefined لو السنة دي مش موجودة أصلا في الداتا
        const yearStats = data.statistics.get(String(currentYear)) || {};

        months.forEach(month => {
            const monthName = monthNames[month - 1];
            // بيانات الشهر، لو مش موجودة نحط القيمة الافتراضية من schema
            const monthData = yearStats[monthName] || { pending: 0, previous: 0, available: 0 };

            // حسب اللي عندك في schema Freelancer أو Company، ممكن تغير `available` أو `previous` حسب الدور
            const pendingValue = monthData.pending || 0;
            const previousValue = monthData.previous || 0; // أو 0 افتراضياً

            result[currentYear][monthName] = {
                pending: pendingValue,
                previous: previousValue
            };

            if (pendingValue > maxValue) {
                maxValue = pendingValue;
            }
        });

        if (maxValue === -Infinity) maxValue = 0;

        res.status(200).json({
            status: 'success',
            data: result,
            maxValue: maxValue
        });
    },
    getUserInvoices: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

            const invoices = await Invoice.find({ "user.id": user.id })
                .populate("pFinancialId")
                .populate({
                    path: "subPackageId",
                    populate: {
                        path: "packageId"
                    }
                })
                .populate("withdrawProfitId");
            if (!invoices) {
                return res.status(200).json({ data: [] });
            }
            return res.status(200).json({ data: invoices });
        } catch (error) {
            console.error("Error fetching user invoices:", error);
            res.status(500).json({ message: "Something went wrong" });
        }
    }
}

module.exports = { financialService };