const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const publicVapidKey =
  "BA05iaT4jXt7j46p_UqS1wpIC8qizrdXKI-mZy3fbpWcBGlng1EcCMJI_MGCroPvR8h9YYXHlQjadx083naYwAw";
const privateVapidKey = "qI4hyWodqa3fQysGMySfXpAwljX0MLPd5Yo-3CyMCgE";
webpush.setVapidDetails(
  "mailto:pushuhexi11@hotmail.com",
  publicVapidKey,
  privateVapidKey
);

let subscription = undefined;

// subescribe Route
app.post("/notification/subscribe", (req, res) => {
  //get pushSubcription object
  const sub = req.body;
  subscription = sub;
  // send 201-resource created
  res.status(201).json({});
});

app.get("/notification/send", (req, res) => {
  // Create payload
  const payload = JSON.stringify({ title: "take photo buddy!" });
  // pass object into senNotifcition
  
  if (subscription) {
    webpush.sendNotification(subscription, payload).catch((err) => console.error(err))
  }
  
  res.status(201).json({});
});

const port = 8000;
app.listen(port, () => console.log(`Server started on port${port}`));
