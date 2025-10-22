const labelService = require('../services/LabelService');

class LabelController {
  // GET /api/labels
  async getAllLabels(req, res) {
    try {
      const userId = req.userId;
      const labels = await labelService.getAllLabels(userId);
      res.status(200).json(labels);
    } catch (err) {
      console.error('Failed to fetch labels:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST /api/labels
  async createLabel(req, res) {
    try {
      const userId = req.userId;
      const { name, description } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Label name is required and must be a string' });
      }

      const label = await labelService.createLabel(userId, name, description || '');
      if (!label) {
        return res.status(400).json({ error: 'Label with this name already exists' });
      }

      res.status(201).json(label);
    } catch (err) {
      console.error('Failed to create label:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /api/labels/:id
  async getLabelById(req, res) {
    try {
      const userId = req.userId;
      const id = req.params.id;

      const label = await labelService.getLabelById(userId, id);
      if (!label) {
        return res.status(404).json({ error: 'Label not found' });
      }

      res.status(200).json(label);
    } catch (err) {
      console.error('Failed to get label:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PATCH /api/labels/:id
  async updateLabel(req, res) {
    try {
      const userId = req.userId;
      const id = req.params.id;
      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'New label name is required' });
      }

      const result = await labelService.updateLabel(userId, id, name);

      if (result === 'duplicate') {
        return res.status(400).json({ error: 'Label with this name already exists' });
      }

      if (!result) {
        return res.status(404).json({ error: 'Label not found or cannot be updated' });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error('Failed to update label:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // DELETE /api/labels/:id
  async deleteLabel(req, res) {
    try {
      const userId = req.userId;
      const id = req.params.id;

      const deleted = await labelService.deleteLabel(userId, id);
      if (!deleted) {
        return res.status(404).json({ error: 'Label not found or cannot be deleted' });
      }

      res.status(204).send();
    } catch (err) {
      console.error('Failed to delete label:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new LabelController();
