const express = require('express');
const router = express.Router();
const { Dispensaire } = require('../models/dispensaire');

// GET /dispensaires - Retrieve all dispensaires
router.get('/', async (req, res) => {
    try {
        const dispensaires = await Dispensaire.findAll();
        res.json(dispensaires);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving dispensaires' });
    }
});

// GET /dispensaires/:id - Retrieve a dispensaire by ID
router.get('/:id', async (req, res) => {
    try {
        const dispensaire = await Dispensaire.findByPk(req.params.id);
        if (dispensaire) {
            res.json(dispensaire);
        } else {
            res.status(404).json({ message: 'Dispensaire not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving dispensaire' });
    }
});

// POST /dispensaires - Create a new dispensaire
router.post('/', async (req, res) => {
    try {
        const { name, organisationId } = req.body;
        const newDispensaire = await Dispensaire.create({ name, organisationId });
        res.status(201).json(newDispensaire);
    } catch (error) {
        res.status(400).json({ message: 'Error creating dispensaire' });
    }
});

// PUT /dispensaires/:id - Update a dispensaire by ID
router.put('/:id', async (req, res) => {
    try {
        const { name, organisationId } = req.body;
        const [updated] = await Dispensaire.update({ name, organisationId }, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedDispensaire = await Dispensaire.findByPk(req.params.id);
            res.json(updatedDispensaire);
        } else {
            res.status(404).json({ message: 'Dispensaire not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating dispensaire' });
    }
});

// DELETE /dispensaires/:id - Delete a dispensaire by ID
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Dispensaire.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Dispensaire not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting dispensaire' });
    }
});

module.exports = router;