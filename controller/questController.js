const Quest = require("../model/questModel.js");

const QuestController = {
  createQuest,
  getAllQuests,
  getQuestById,
  updateQuest,
  deleteQuest,
};

async function createQuest(req, res) {
  try {
    const {
      title,
      type,
      description,
      target_count,
      xp_reward,
      active,
      repeatable,
    } = req.body;

    const newQuest = new Quest({
      title,
      type,
      description,
      target_count,
      xp_reward,
      active,
      repeatable,
    });

    const quest = await newQuest.save();

    res.status(201).json({
      status: {
        code: 201,
        message: "Quest created successfully",
      },
      data: quest,
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 500,
        message: error.message,
      },
    });
  }
}

async function getAllQuests(req, res) {
  try {
    const quests = await Quest.find();

    res.status(200).json({
      status: {
        code: 200,
        message: "Success",
      },
      data: quests,
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 500,
        message: error.message,
      },
    });
  }
}

async function getQuestById(req, res) {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "Quest not found",
        },
      });
    }

    res.status(200).json({
      status: {
        code: 200,
        message: "Success",
      },
      data: quest,
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 500,
        message: error.message,
      },
    });
  }
}

async function updateQuest(req, res) {
  try {
    const { id } = req.params;

    const allowedFields = [
      "title",
      "type",
      "description",
      "target_count",
      "xp_reward",
      "active",
      "repeatable",
    ];

    let updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const updated = await Quest.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "Quest not found",
        },
      });
    }

    res.status(200).json({
      status: {
        code: 200,
        message: "Quest updated successfully",
      },
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 500,
        message: error.message,
      },
    });
  }
}

async function deleteQuest(req, res) {
  try {
    const { id } = req.params;

    const deleted = await Quest.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: {
          code: 404,
          message: "Quest not found",
        },
      });
    }

    res.status(200).json({
      status: {
        code: 200,
        message: "Quest deleted successfully",
      },
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      status: {
        code: 500,
        message: error.message,
      },
    });
  }
}

module.exports = QuestController;
