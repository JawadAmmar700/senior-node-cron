const cron = require("node-cron");
const { courier } = require("./courier");
const { PrismaClient } = require("@prisma/client");
const { remove_job_crons } = require("./store");
const client = new PrismaClient();

const createScheduleExpression = (date) => {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  const cronExpression = `${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;
  return cronExpression;
};

const UnixToTimeString = (time, offset) => {
  const unixTimestamp = time * 1000;
  const date = new Date(unixTimestamp - offset);
  const timeString = date.toLocaleTimeString("en-US", {
    timeZone: "Europe/Istanbul",
    hour12: false,
  });
  return timeString;
};

const dateFromString = (dateString, timeString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // add zero-padding to month
  const day = date.getDate().toString().padStart(2, "0"); // add zero-padding to day
  const formattedDate = `${year}-${month}-${day}`;
  const scheduledTime = new Date(`${formattedDate}T${timeString}`);
  return scheduledTime;
};

const createSchedule = (dateString, time, offset = 0) => {
  const timeToTimeString = UnixToTimeString(time, offset);
  const scheduledTime = dateFromString(dateString, timeToTimeString);
  const cronSchedule = createScheduleExpression(scheduledTime);
  return cronSchedule;
};

const createCronJob = (todo) => {
  const cronSchedule = createSchedule(todo.date, todo.unix, 600000);
  console.log(cronSchedule);

  const scheduledJob = cron.schedule(
    cronSchedule,
    async () => {
      await client.reminder.update({
        where: {
          id: todo.id,
        },
        data: {
          notificationSent: true,
        },
      });
      await courier.send({
        message: {
          to: {
            email: todo.user.email,
          },
          template: "2D62H8J32V4YWWG1SC4DE07ABJ6H",
          data: {
            recipientName: todo.user.name,
            todoTitle: todo.title,
          },
        },
      });
    },
    {
      timezone: "Europe/Istanbul",
    }
  );
  return scheduledJob;
};

const createCronJobToMarkAsDone = (todo) => {
  const cronSchedule = createSchedule(todo.date, todo.unix);
  console.log(cronSchedule);

  const jobToMarkAsDone = cron.schedule(
    cronSchedule,
    async () => {
      remove_job_crons(todo.id);
      await client.reminder.update({
        where: {
          id: todo.id,
        },
        data: {
          isDone: true,
        },
      });
    },
    {
      timezone: "Europe/Istanbul",
    }
  );
  return jobToMarkAsDone;
};

module.exports = { createCronJob, createCronJobToMarkAsDone };
