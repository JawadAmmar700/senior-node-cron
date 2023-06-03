const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createCronJob, createCronJobToMarkAsDone } = require("./lib/cron-job");
const {
  add_job_crons,
  get_job_crons,
  remove_job_crons,
} = require("./lib/store");
const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: process.env.CLIENT_APP, optionsSuccessStatus: 200 }));

app.get("/", (_, res) => {
  res.send(
    "Hey there!, this is a reminder schedule task for meetly-omega.vercel.app"
  );
});

app.post("/", (req, res) => {
  const { todo } = req.body;
  const scheduledJob = createCronJob(todo);
  const jobToMarkAsDone = createCronJobToMarkAsDone(todo);
  add_job_crons(todo.id, scheduledJob, jobToMarkAsDone);
  res.json({ message: "Cron is created succussfully" });
});

app.put("/reminder-update", (req, res) => {
  const { todo } = req.body;
  const job = get_job_crons(todo.id);
  if (!job) return res.json({ message: "There is no cron job" });
  job.scheduledJob.stop();
  job.jobToMarkAsDone.stop();
  remove_job_crons(todo.id);

  const scheduledJob = createCronJob(todo);
  const jobToMarkAsDone = createCronJobToMarkAsDone(todo);

  add_job_crons(todo.id, scheduledJob, jobToMarkAsDone);

  res.json({ message: "Cron is updated succussfully" });
});

app.delete("/reminder-deleted", (req, res) => {
  const { todoId } = req.body;
  // const { todoId } = req.query as { todoId: string };
  const job = get_job_crons(todoId);
  if (!job) return res.json({ message: "There is no cron job" });
  job.scheduledJob.stop();
  job.jobToMarkAsDone.stop();
  remove_job_crons(todoId);

  res.json({ message: "Cron is deleted succussfully" });
});

app.listen(5000);
