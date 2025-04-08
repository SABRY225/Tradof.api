const express = require('express');
const { paymentService } = require('../services/paymentServices');
const router = express.Router();

// Webhook to handle payment results from Paymob
router.post('/callback', express.json(), async (req, res) => {
    try {
        const data = req.body;
        const data2 = req.params;

        console.log("✅ Paymob Webhook received:", data);
        console.log("✅ Paymob Webhook received:", data2);

        if (data.obj && data.obj.success) {
            const orderId = data.obj.order.id;
            const transactionId = data.obj.id;
            const amount = data.obj.amount_cents;
            const currency = data.obj.currency;

            // 🛠️ Update your DB with payment status
            await updateOrderStatus(orderId, {
                status: 'paid',
                transactionId,
                amount,
                currency,
            });

            console.log(`✅ Order ${orderId} marked as paid.`);
        }

        // لازم ترد بـ 200 علشان Paymob تعتبر الكولباك ناجح
        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Error in Paymob Webhook:", error);
        res.sendStatus(500);
    }
});

// Dummy functions — replace with DB logic
async function updateOrderStatus(orderId, paymentInfo) {
    console.log("📝 Updating DB: PAID", orderId, paymentInfo);
    // await OrderModel.findOneAndUpdate({ orderId }, { status: 'paid', ...paymentInfo });
}

async function updateOrderToFailed(orderId, transactionId) {
    console.log("📝 Updating DB: FAILED", orderId, transactionId);
    // await OrderModel.findOneAndUpdate({ orderId }, { status: 'failed', transactionId });
}

router.post("/subscription",paymentService.joinSubscription);
router.post("/pay-project",paymentService.payProject);
module.exports = router;
