const Package = require("../models/packageModel");
const { getTokenFromDotNet } = require("../helpers/getToken");
const { default: mongoose } = require("mongoose");

const packageService = {
    getPackages: async (req, res) => {
        try {
            const packages = await Package.find({});
            const data = packages.map((pkg) => ({
                id: pkg.id,
                name: pkg.name,
                price: pkg.price,
                description: pkg.description,
                durationInMonths: pkg.durationInMonths
            }));
    
            res.json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },  
    createPackage: async (req, res) => {
        try {
            const token = req.headers['authorization'];
    
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
    
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            const { name, description, price, durationInMonths } = req.body;
            if (!name || !description || !durationInMonths) {
                return res.status(400).json({ success: false, message: 'Name, description, price, and durationInMonths are required' });
            }
            const newPackage = new Package({ name, description, price, durationInMonths });
            await newPackage.save();
            res.status(201).json({ success: true, message: 'Package created successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error' });

        }
    },
    editPackage:async (req, res) => {
        try {
            const token = req.headers['authorization'];
    
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
    
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            const { packageId } = req.params;
            const {  name, description, price, durationInMonths } = req.body;
            if (!packageId ||!name ||!description  ||!durationInMonths) {
                return res.status(400).json({ success: false, message: 'Package ID, name, description, price, and durationInMonths are required' });
            }
            const updatedPackage = await Package.findByIdAndUpdate(packageId, { name, description, price, durationInMonths }, { new: true });
            if (!updatedPackage) {
                return res.status(404).json({ success: false, message: 'Package not found' });
            }
            res.json({ success: true, message: 'Package updated successfully' });
            } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error' });
            }
    },
    deletePackage: async (req, res) => {
        try {
            const token = req.headers['authorization'];
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token is missing!' });
            }
            const user = await getTokenFromDotNet(token);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid token or user not found!' });
            }
            const { packageId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(packageId)) {
                return res.status(400).json({ success: false, message: 'Invalid Package ID' });
            }
            const deletedPackage = await Package.findByIdAndDelete(packageId);
            if (!deletedPackage) {
                return res.status(404).json({ success: false, message: 'Package not found' });
            }
            res.status(200).json({ success: true, message: 'Package deleted successfully' });
            } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
            }
    }

};

module.exports = { packageService };