const labelService = require('../services/LabelService');

class LabelController {
  /**
   * Handle GET /api/labels
   * Returns all labels belonging to the authenticated user.
   */
  async getAllLabels(req, res) {
    const userId = req.userId;
    const labels = labelService.getAllLabels(userId);
     // Remove userId from each label before returning
  const sanitizedLabels = labels.map(({ userId, ...rest }) => rest);

  res.status(200).json(sanitizedLabels);
  }

  /**
   * Handle POST /api/labels
   * Creates a new label for the authenticated user.
   * Validates input and responds with 201 Created.
   */
  async createLabel(req, res) {
    const userId = req.userId;

    const { name, description } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Label name is required and must be a string' });
    }

    const label = labelService.createLabel(userId, { name, description: description || '' });
    res.status(201).json(label);
  }

  /**
   * Handle GET /api/labels/:id
   * Returns label details for a specific label owned by the user.
   * Validates ID and ownership; returns 404 if not found.
   */
  async getLabelById(req, res) {
    const userId = req.userId;

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid label ID' });

    const label = labelService.getLabelById(userId, id);
    if (!label) return res.status(404).json({ error: 'Label not found' });

    // Create a copy without userId before sending
  const { userId: _, ...labelWithoutUserId } = label;

  res.status(200).json(labelWithoutUserId);
  }

  /**
   * Handle PATCH /api/labels/:id
   * Partially updates a label owned by the user.
   * Validates input and returns 404 if label not found.
   */
  async updateLabel(req, res) {
    const userId = req.userId;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid label ID' });

    const updateFields = req.body;
    if (!updateFields || typeof updateFields !== 'object') {
      return res.status(400).json({ error: 'Invalid update data' });
    }

    const updatedLabel = labelService.updateLabel(userId, id, updateFields);
    if (!updatedLabel) return res.status(404).json({ error: 'Label not found' });

    res.status(204).send();
  }

  /**
   * Handle DELETE /api/labels/:id
   * Deletes a label owned by the authenticated user.
   * Returns 204 No Content on success or 404 if not found.
   */
  async deleteLabel(req, res) {
    const userId = req.userId;

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid label ID' });

    const deleted = labelService.deleteLabel(userId, id);
    if (!deleted) return res.status(404).json({ error: 'Label not found' });

    res.status(204).send();
  }
}

module.exports = new LabelController();

