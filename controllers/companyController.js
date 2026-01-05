const Company = require('../models/Company');

exports.createCompany = async (req, res) => {
  try {
    const companyData = req.body;
    
    // Handle file uploads
    if (req.files) {
      if (req.files.logo) {
        companyData.logo_url = req.files.logo[0].path;
      }
      if (req.files.coverImage) {
        companyData.coverImage = req.files.coverImage[0].path;
      }
    }

    const company = new Company(companyData);
    const savedCompany = await company.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const updates = req.body;
    
    // Handle file uploads
    if (req.files) {
      if (req.files.logo) {
        updates.logo_url = req.files.logo[0].path;
      }
      if (req.files.coverImage) {
        updates.coverImage = req.files.coverImage[0].path;
      }
    }

    const company = await Company.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.status(200).json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
