import { Router } from "express";
import auth from "../middlewares/auth";
import schemas from "../../schemas";
import db from "../../utils/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", auth, async (req, res) => {
  const allQuizzes = await db.select().from(schemas.quizzes).all();

  res.json(allQuizzes);
});

router.delete("/", async (req, res) => {
  const quiz = await db
    .select()
    .from(schemas.quizzes)
    .where(eq(schemas.quizzes.question, req.body.question))
    .get();

  if (quiz) {
    res.status(404).json({ message: "Quiz not found" });
    return;
  }

  res.status(200).json({ message: "Quiz deleted successfully" });

  await db
    .delete(schemas.quizzes)
    .where(eq(schemas.quizzes.question, req.body.question));
});

router.post("/", async (req, res) => {
  const quiz = await db
    .select()
    .from(schemas.quizzes)
    .where(eq(schemas.quizzes.question, req.body.question))
    .get();

  if (quiz) {
    res.status(400).json({ message: "Quiz already exists" });
    return;
  }

  await db.insert(schemas.quizzes).values({
    question: req.body.question,
    answer: req.body.answer,
    options: req.body.options,
  });

  res.status(201).json({ message: "Quiz created successfully" });
});

export default router;
