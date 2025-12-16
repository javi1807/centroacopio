const { body, param, validationResult } = require('express-validator');

/**
 * Validation middleware helper
 */
const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array()
        });
    };
};

// Validation schemas for different entities
const farmerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('document').trim().notEmpty().withMessage('Document is required'),
    body('document_type').isIn(['DNI', 'CE', 'RUC']).withMessage('Invalid document type'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
    body('zone').optional().trim(),
    body('status').optional().isIn(['Activo', 'Inactivo']).withMessage('Invalid status')
];

const landValidation = [
    body('name').trim().notEmpty().withMessage('Land name is required'),
    body('farmerId').isInt({ min: 1 }).withMessage('Valid farmer ID is required'),
    body('area').isFloat({ min: 0 }).withMessage('Area must be a positive number'),
    body('altitude').optional().isFloat().withMessage('Altitude must be a number'),
    body('status').optional().isIn(['Activo', 'Inactivo']).withMessage('Invalid status')
];

const deliveryValidation = [
    body('farmerId').isInt({ min: 1 }).withMessage('Valid farmer ID is required'),
    body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
    body('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    body('product_state').optional().isIn(['seco', 'baba']).withMessage('Product state must be seco or baba'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('price_per_kg').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('total_payment').optional().isFloat({ min: 0 }).withMessage('Total payment must be positive')
];

const warehouseValidation = [
    body('name').trim().notEmpty().withMessage('Warehouse name is required'),
    body('type').optional().trim(),
    body('capacity').isFloat({ min: 0 }).withMessage('Capacity must be a positive number'),
    body('location').optional().trim(),
    body('status').optional().isIn(['Activo', 'Inactivo']).withMessage('Invalid status')
];

const paymentValidation = [
    body('deliveryId').notEmpty().withMessage('Delivery ID is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('method').isIn(['Efectivo', 'Transferencia', 'Cheque']).withMessage('Invalid payment method'),
    body('status').optional().isIn(['Pendiente', 'Completado', 'Cancelado']).withMessage('Invalid status')
];

const priceUpdateValidation = [
    body('quality').isIn(['Premium', 'Estándar', 'Bajo']).withMessage('Invalid quality level'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

const idValidation = param('id').notEmpty().withMessage('ID parameter is required');

module.exports = {
    validate,
    farmerValidation,
    landValidation,
    deliveryValidation,
    warehouseValidation,
    paymentValidation,
    priceUpdateValidation,
    idValidation
};
