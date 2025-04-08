const { getTokenFromDotNet } = require("../helpers/getToken");
const Package = require("../model/packageModel");
const SubPackage = require("../model/subPackageModel");
const { PaymentProcess } = require("../helpers/payment");
const Session = require("../model/sessionModel");
const PFinancial = require("../model/PFinancialModel");
const axios = require("axios");
const https = require("https");

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
    // getProjectByFreelancer:async(req,res)=>{

    // }
}

module.exports = { paymentService };