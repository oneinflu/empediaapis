const CompanyUser = require('../models/CompanyUser');

exports.addCompanyUser = async (req, res) => {
  try {
    const companyUser = new CompanyUser(req.body);
    const savedCompanyUser = await companyUser.save();
    res.status(201).json(savedCompanyUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCompanyUsers = async (req, res) => {
  try {
    const { company_id } = req.query;
    const query = company_id ? { company_id } : {};
    
    const companyUsers = await CompanyUser.find(query)
      .populate('user_id', 'full_name email')
      .populate('company_id', 'company_name');
      
    res.status(200).json(companyUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCompanyUserRole = async (req, res) => {
  try {
    const companyUser = await CompanyUser.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!companyUser) return res.status(404).json({ message: 'Company User record not found' });
    res.status(200).json(companyUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeCompanyUser = async (req, res) => {
  try {
    const companyUser = await CompanyUser.findByIdAndDelete(req.params.id);
    if (!companyUser) return res.status(404).json({ message: 'Company User record not found' });
    res.status(200).json({ message: 'User removed from company successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
