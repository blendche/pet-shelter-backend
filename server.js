
import express from "express";
import cors from "cors";
import db from "./database/db.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ===============================
// GET - Get all dogs
// ===============================
app.get("/api/dogs", (req, res) => {
  try {
    const dogs = db.prepare(
      "SELECT * FROM dogs ORDER BY id DESC"
    ).all();

    res.status(200).json(dogs);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dogs",
      error: error.message
    });
  }
});

// ===============================
// POST - Add a new dog
// ===============================
app.post("/api/dogs", (req, res) => {
  try {
    const { name, gender, description, image, status } = req.body;

    if (!name || !gender) {
      return res.status(400).json({
        message: "Name and gender are required"
      });
    }

    const result = db.prepare(`
      INSERT INTO dogs (name, gender, description, image, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      name,
      gender,
      description || null,
      image || null,
      status || "Available"
    );

    const newDog = db.prepare(
      "SELECT * FROM dogs WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.status(201).json({
      message: "Dog added successfully!",
      dog: newDog
    });

  } catch (error) {
    res.status(500).json({
      message: "Error adding dog",
      error: error.message
    });
  }
});

// ===============================
// PUT - Update an existing dog
// ===============================
app.put("/api/dogs/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, description, image, status } = req.body;

    const existingDog = db.prepare(
      "SELECT * FROM dogs WHERE id = ?"
    ).get(id);

    if (!existingDog) {
      return res.status(404).json({
        message: "Dog not found"
      });
    }

    if (!name || !gender) {
      return res.status(400).json({
        message: "Name and gender are required"
      });
    }

    db.prepare(`
      UPDATE dogs
      SET name = ?,
          gender = ?,
          description = ?,
          image = ?,
          status = ?
      WHERE id = ?
    `).run(
      name,
      gender,
      description ?? null,
      image ?? null,
      status || "Available",
      id
    );

    const updatedDog = db.prepare(
      "SELECT * FROM dogs WHERE id = ?"
    ).get(id);

    res.status(200).json({
      message: "Dog updated successfully!",
      dog: updatedDog
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating dog",
      error: error.message
    });
  }
});

// ===============================
// DELETE - Delete a dog
// ===============================
app.delete("/api/dogs/:id", (req, res) => {
  try {
    const { id } = req.params;

    const existingDog = db.prepare(
      "SELECT * FROM dogs WHERE id = ?"
    ).get(id);

    if (!existingDog) {
      return res.status(404).json({
        message: "Dog not found"
      });
    }

    db.prepare(
      "DELETE FROM dogs WHERE id = ?"
    ).run(id);

    res.status(200).json({
      message: "Dog deleted successfully!"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting dog",
      error: error.message
    });
  }
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
