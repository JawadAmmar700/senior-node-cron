const job_crons = new Map();

const add_job_crons = (id, scheduledJob, jobToMarkAsDone) => {
  job_crons.set(id, {
    scheduledJob,
    jobToMarkAsDone,
  });
};

const remove_job_crons = (id) => {
  job_crons.delete(id);
};

const get_job_crons = (id) => {
  return job_crons.get(id);
};

module.exports = { add_job_crons, remove_job_crons, get_job_crons };
