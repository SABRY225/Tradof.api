const { getTokenFromDotNet } = require("../helpers/getToken");
const { PaymentProcess } = require("../helpers/payment");
const Package = require("../models/packageModel");
const Session = require("../models/sessionModel");
const SubPackage = require('../models/subPackageModel');

const subscriptionService = {
    getSubscription: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            const sub = await SubPackage.findOne({ "company.id": req.params.companyId })
                .sort({ startSub: -1 })
                .populate('packageId');

            if (!sub) return res.status(200).json({ success: false, message: 'No subscription found' });

            if(sub.status=="pending"){
                return res.status(200).json({ success: false, message: 'No subscription found' });
            }

            res.status(200).json({ success: true, data: sub });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    getSubscriptionDetails: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            const sub = await SubPackage.findOne({ "company.id": user.id })
                .sort({ startSub: -1 })
                .populate('packageId');

            if (!sub) return res.status(200).json({ success: false, message: 'No subscription found' });

            const start = new Date(sub.startSub);
            const end = new Date(start);
            end.setMonth(end.getMonth() + sub.packageId.durationInMonths);

            const now = new Date();
            if (now > end) {
                return res.status(400).json({ success: false, message: "The company is not subscribed to any package or the package has expired" });
            }

            const diffTime = Math.abs(end - now);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            res.status(200).json({ success: true, data: {packageName:sub.packageId.name,price:sub.packageId.price,remaining:diffDays}});
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    getSubscriptionByCompany: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            const subs = await SubPackage.find().populate('packageId');
            res.status(200).json({ success: true, data: subs });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    getRemainingTime: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            const sub = await SubPackage.findOne({ "company.id": req.params.companyId })
                .sort({ startSub: -1 })
                .populate('packageId');

            if (!sub) return res.status(404).json({ success: false, message: 'No subscription found' });

            const start = new Date(sub.startSub);
            const end = new Date(start);
            end.setMonth(end.getMonth() + sub.packageId.durationInMonths);

            const now = new Date();
            if (now > end) {
                return res.json({ expired: true, remaining: { days: 0, months: 0, years: 0 } });
            }

            const diffTime = Math.abs(end - now);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // تحويل الفرق إلى سنين، شهور، أيام
            const years = Math.floor(diffDays / 365);
            const months = Math.floor((diffDays % 365) / 30);
            const days = (diffDays % 365) % 30;

            res.json({
                expired: false,
                sub,
                remaining: { days, months, years }
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    getIncomeStatistics: async (req, res) => {
        try {
            const token = req.headers['authorization'];

            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }

            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            const currentYear = new Date().getFullYear();
            const subs = await SubPackage.aggregate([
                {
                    $lookup: {
                        from: 'packages',
                        localField: 'packageId',
                        foreignField: '_id',
                        as: 'package'
                    }
                },
                { $unwind: '$package' },
                {
                    $match: {
                        startSub: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lte: new Date(`${currentYear}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$startSub' },
                        totalIncome: { $sum: '$package.price' }
                    }
                },
                {
                    $project: {
                        month: '$_id',
                        totalIncome: 1,
                        _id: 0
                    }
                },
                { $sort: { month: 1 } }
            ]);
    
            // نجهز مصفوفة فيها 12 شهر ونكمل الفارغين بـ 0
            const incomeByMonth = Array.from({ length: 12 }, (_, i) => {
                const found = subs.find(s => s.month === i + 1);
                return {
                    month: i + 1,
                    totalIncome: found ? found.totalIncome : 0
                };
            });
    
            res.status(200).json({ success: true, data: incomeByMonth });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = { subscriptionService };