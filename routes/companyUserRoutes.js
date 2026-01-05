const express = require('express');
const router = express.Router();
const companyUserController = require('../controllers/companyUserController');

router.post('/', companyUserController.addCompanyUser);
router.get('/', companyUserController.getCompanyUsers);
router.put('/:id', companyUserController.updateCompanyUserRole);
router.delete('/:id', companyUserController.removeCompanyUser);

module.exports = router;
