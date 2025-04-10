const { getTokenFromDotNet } = require("../helpers/getToken");
const Package = require("../model/packageModel");
const SubPackage = require("../model/subPackageModel");
const { PaymentProcess } = require("../helpers/payment");
const Session = require("../model/sessionModel");
const PFinancial = require("../model/PFinancialModel");
const axios = require("axios");
const https = require("https");
const CompanyWallet = require("../model/compamyWalletModel");
const FreelancerWallet = require("../model/freelancerWalletModel");
const AdminWallet = require("../model/AdminWalletModel");
const WithdrawProfit = require("../model/withdrawProfitModel");

const paymentService = {
    getStatusProject: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }

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

            // 4. نحولهم إلى خريطة (Map) علشان نسهل الربط
            const paymentMap = new Map();
            payments.forEach(payment => {
                if (!paymentMap.has(payment.projectId)) {
                    paymentMap.set(payment.projectId, payment.paymentStatus);
                }
            });

            // 5. نركب البيانات النهائية
            const result = items.map(project => {
                return {
                    ...project,
                    paymentStatus: paymentMap.get(String(project.id)) || 'not paid'
                };
            });

            // 6. نرجع النتيجة
            res.status(200).json({
                success: true,
                count: result.length,
                items: result
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getProjectByFreelancer:async(req,res)=>{
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

            // 4. نحولهم إلى خريطة (Map) علشان نسهل الربط
            const paymentMap = new Map();
            payments.forEach(payment => {
                if (!paymentMap.has(payment.projectId)) {
                    paymentMap.set(payment.projectId, payment.paymentStatus);
                }
            });

            // 5. نركب البيانات النهائية
            const result = items.map(project => {
                return {
                    ...project,
                    paymentStatus: paymentMap.get(String(project.id)) || 'not paid'
                };
            });

            // 6. نرجع النتيجة
            res.status(200).json({
                success: true,
                count: result.length,
                items: result
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getStatisticsByCompany: async (req, res) => {
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
    
            const { companyId } = req.params;
    
            // Validate companyId
            if (!companyId || companyId.trim() === "") {
                return res.status(400).json({ success: false, message: 'companyId is required!' });
            }
    
            const companyFinancial = await CompanyWallet.findOne({ companyId });
    
            // Validate if financial data exists
            if (!companyFinancial) {
                return res.status(404).json({ success: false, message: 'No financial data found for this company!' });
            }
    
            // Response
            res.status(200).json({
                success: true,
                data: {
                    totalBalance: companyFinancial.totalBalance,
                    previousBalance: companyFinancial.previousBalance,
                    pendingBalance: companyFinancial.pendingBalance
                }
            });
    
        } catch (error) {
            console.error("Error in getStatisticsByCompany:", error);
            res.status(500).json({ success: false, message: 'Server error: ' + error.message });
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

            const freelancerFinancial = await FreelancerWallet.findOne({ companyId });
    
            // Validate if financial data exists
            if (!freelancerFinancial) {
                res.status(200).json({
                    success: true,
                    data: {
                        totalBalance: 0,
                        availableBalance: 0,
                        pendingBalance: 0
                    }
                });
            }
    
            // Response
            res.status(200).json({
                success: true,
                data: {
                    totalBalance: freelancerFinancial.totalBalance,
                    availableBalance: freelancerFinancial.previousBalance,
                    pendingBalance: freelancerFinancial.pendingBalance
                }
            });
    
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error: ' + error.message });
        }
    },
    getStatisticsByAdmin:async(req,res)=>{
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

            if (user.role!=="admin") {
                return res.status(401).json({ success: false, message: 'You are not an admin' });
            }

            const adminFinancial = await AdminWallet.find({});
    
            // Validate if financial data exists
            if (!adminFinancial) {
                res.status(200).json({
                    success: true,
                    data: {
                        totalSubscription: 0,
                        totalPendingMoney: 0,
                        totalMoneyByFreelancers: 0
                    }
                });
            }
    
            // Response
            res.status(200).json({
                success: true,
                data: {
                    totalSubscription: freelancerFinancial.totalSubscription,
                    totalPendingMoney: freelancerFinancial.totalPendingMoney,
                    totalMoneyByFreelancers: freelancerFinancial.totalMoneyByFreelancers
                }
            });
    
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error: ' + error.message });
        }
    },
    requestWithdrawProfits:async(req,res)=>{
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
            const { freelancerId, amount,paymentDetails } = req.body;
            // Validation
            if (!freelancerId || !amount ||!paymentDetails) {
                return res.status(400).json({ success: false, message: 'freelancerId and amount are required!' });
            }
            const freelancerWallet=await FreelancerWallet.findOne({"freelancer.id":freelancerId})
            if(!freelancerWallet){
                return res.status(400).json({ success: false, message: 'The freelancer has no credit' });
            }
            if(freelancerWallet.availableBalance<amount){
                return res.status(400).json({ success: false, message: 'The amount is greater than the available balance' });
            }
        
            const newRequest = new WithdrawProfit({
                freelancer:user,
                amount,
                paymentDetails,
                paymentStatus: 'pending'
            });
    
            await newRequest.save();
    
            res.status(201).json({ success: true, message: 'Withdraw request submitted successfully!' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    editStatusRequest:async(req,res)=>{
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

            if (user.role!=="admin") {
                return res.status(401).json({ success: false, message: 'You are not an admin' });
            }
            const { requestId } = req.params;
            const { paymentStatus} = req.body;
    
            // Validation
            if (!requestId) {
                return res.status(400).json({ success: false, message: 'Invalid requestId' });
            }
    
            const updateData = {};
            if (paymentStatus) updateData.paymentStatus = paymentStatus;
    
            const updatedRequest = await WithdrawProfit.findByIdAndUpdate(
                requestId,
                { $set: updateData },
                { new: true }
            );
    
            if (!updatedRequest) {
                return res.status(404).json({ success: false, message: 'Withdraw request not found!' });
            }
    
            res.status(200).json({ success: true, message: 'Withdraw request updated successfully.' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getProfitRequests:async(req,res)=>{
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

            if (user.role!=="admin") {
                return res.status(401).json({ success: false, message: 'You are not an admin' });
            }
    
            const requests = await WithdrawProfit.find({}).sort({ createdAt: -1 });
    
            res.status(200).json({ success: true, data: requests });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // finshProject:async(req,res)=>{

    // },
}

module.exports = { paymentService };