const mongoose = require('mongoose');


const monthStatsSchema = new mongoose.Schema({
    pending: {
      type: Number,
      default: 0,
    },
    available: {
      type: Number,
      default: 0,
    },
  }, { _id: false }); // عشان كل شهر ميكونش له _id خاص
  
  const yearStatsSchema = new mongoose.Schema({
    Jan: { type: monthStatsSchema, default: () => ({}) },
    Feb: { type: monthStatsSchema, default: () => ({}) },
    Mar: { type: monthStatsSchema, default: () => ({}) },
    Apr: { type: monthStatsSchema, default: () => ({}) },
    May: { type: monthStatsSchema, default: () => ({}) },
    Jun: { type: monthStatsSchema, default: () => ({}) },
    Jul: { type: monthStatsSchema, default: () => ({}) },
    Aug: { type: monthStatsSchema, default: () => ({}) },
    Sep: { type: monthStatsSchema, default: () => ({}) },
    Oct: { type: monthStatsSchema, default: () => ({}) },
    Nov: { type: monthStatsSchema, default: () => ({}) },
    Dec: { type: monthStatsSchema, default: () => ({}) },
  }, { _id: false });
  
  const FinancialHistoryFreelancerSchema = new mongoose.Schema({
    user: {
      type: Object,
      required: true
    },
    statistics: {
      type: Map,
      of: yearStatsSchema, // السنة -> بيانات الشهور
      default: () => new Map()
    }
  });
  

const FinancialHistoryFreelancer = mongoose.model('FinancialHistoryFreelancer', FinancialHistoryFreelancerSchema);

module.exports = FinancialHistoryFreelancer;