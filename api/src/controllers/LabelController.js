const labelService = require('../services/LabelService');

class LabelController {
  // GET /api/labels
  async getAllLabels(req, res) {
    const userId = req.userId;
    const labels = labelService.getAllLabels(userId);
    res.status(200).json(labels);
  }

  // POST /api/labels
  async createLabel(req, res) {
    const userId = req.userId;
    const { name, description } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Label name is required and must be a string' });
    }

    const label = labelService.createLabel(userId, name, description || '');
    if (!label) {
      return res.status(400).json({ error: 'Label with this name already exists' });
    }

    res.status(201).json(label);
  }

  // GET /api/labels/:id
  async getLabelById(req, res) {
    const userId = req.userId;
    const id = req.params.id;

    const label = labelService.getLabelById(userId, id);
    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.status(200).json(label);
  }

async updateLabel(req, res) {
  const userId = req.userId;
  const id = req.params.id;
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'New label name is required' });
  }

  const result = labelService.updateLabel(userId, id, name);

  if (result === 'duplicate') {
    return res.status(400).json({ error: 'Label with this name already exists' });
  }

  if (!result) {
    return res.status(404).json({ error: 'Label not found or cannot be updated' });
  }

  res.status(200).json({ success: true });
}


  // DELETE /api/labels/:id
  async deleteLabel(req, res) {
    const userId = req.userId;
    const id = req.params.id;

    const deleted = labelService.deleteLabel(userId, id);
    if (!deleted) {
      return res.status(404).json({ error: 'Label not found or cannot be deleted' });
    }

    res.status(204).send();
  }
}

module.exports = new LabelController();
