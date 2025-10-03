const express = require('express');
const router = express.Router();
const { Organisation } = require('../models/organisation');
const { validateOrganisation } = require('../middleware/validation');

// GET /organisations
router.get('/', async (req, res) => {
    try {
        const organisations = await Organisation.findAll();
        res.json(organisations);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving organisations' });
    }
});

// GET /organisations/:id
router.get('/:id', async (req, res) => {
    try {
        const organisation = await Organisation.findByPk(req.params.id);
        if (organisation) {
            res.json(organisation);
        } else {
            res.status(404).json({ message: 'Organisation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving organisation' });
    }
});

// POST /organisations
router.post('/', validateOrganisation, async (req, res) => {
    try {
        const organisation = await Organisation.create(req.body);
        res.status(201).json(organisation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating organisation' });
    }
});

// PUT /organisations/:id
router.put('/:id', validateOrganisation, async (req, res) => {
    try {
        const [updated] = await Organisation.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedOrganisation = await Organisation.findByPk(req.params.id);
            res.json(updatedOrganisation);
        } else {
            res.status(404).json({ message: 'Organisation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating organisation' });
    }
});

// DELETE /organisations/:id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Organisation.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Organisation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting organisation' });
    }
});

module.exports = router;