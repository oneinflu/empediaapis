const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const upload = require('../middleware/upload');

router.post('/', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), companyController.createCompany);

router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);

router.put('/:id', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), companyController.updateCompany);

router.delete('/:id', companyController.deleteCompany);

module.exports = router;
