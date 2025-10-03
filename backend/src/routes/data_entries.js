const express = require('express');
const router = express.Router();
const { DataEntry } = require('../models/data_entry');

// GET /data_entries - Retrieve all data entries
router.get('/', async (req, res) => {
    try {
        const entries = await DataEntry.findAll();
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve data entries' });
    }
});

// GET /data_entries/:id - Retrieve a specific data entry by ID
router.get('/:id', async (req, res) => {
    try {
        const entry = await DataEntry.findByPk(req.params.id);
        if (entry) {
            res.json(entry);
        } else {
            res.status(404).json({ error: 'Data entry not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve data entry' });
    }
});

// POST /data_entries - Create a new data entry
router.post('/', async (req, res) => {
    try {
        const newEntry = await DataEntry.create(req.body);
        res.status(201).json(newEntry);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create data entry' });
    }
});

// PUT /data_entries/:id - Update a specific data entry by ID
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await DataEntry.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedEntry = await DataEntry.findByPk(req.params.id);
            res.json(updatedEntry);
        } else {
            res.status(404).json({ error: 'Data entry not found' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Failed to update data entry' });
    }
});

// DELETE /data_entries/:id - Delete a specific data entry by ID
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await DataEntry.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Data entry not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete data entry' });
    }
});

module.exports = router;