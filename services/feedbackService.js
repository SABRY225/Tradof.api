const Feedback = require("../model/feedbackModel");

const feedbackService = {
    sendFeedback: async (req, res) => {
        try {
            const newFeedback = new Feedback(req.body);
            await newFeedback.save();
            res.status(201).json({
                success: true,
                message: "Feedback sent successfully"
            });
        } catch (error) {
            console.error("Error sending Feedback:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },
    getFeedbacks: async (req, res) => {
        try {
            const feedbacks = await Feedback.find().sort({ timestamp: 1 });

            res.status(200).json({
                success: true,
                data: feedbacks
            });

        } catch (error) {
            console.error("Error fetching feedbacks:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },
    deleteFeedback: async (req, res) => {
        try {
            const { feedbackId } = req.params;
            await Feedback.findByIdAndDelete({ feedbackId })
            res.status(200).json({
                success: true,
                messages: "Feedback deleted successfully"
            });

        } catch (error) {
            console.error("Error delete feedback:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
};

module.exports = { feedbackService };