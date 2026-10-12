
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { listings: [], hostingRequests: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

if (!fs.existsSync(DATA_FILE)) {
  saveData({ listings: [], hostingRequests: [] });
}

function clean(value, max = 200) {
  return typeof value === "string"
    ? value.trim().slice(0, max)
    : "";
}

app.get("/api/listings", (req, res) => {
  res.json(loadData().listings);
});

app.post("/api/listings", (req, res) => {
  const business = clean(req.body.business, 80);
  const title = clean(req.body.title, 100);
  const category = clean(req.body.category, 50);
  const description = clean(req.body.description, 500);
  const contact = clean(req.body.contact, 100);
  const price = Number(req.body.price);

  if (!business || !title || !category || !description || !contact) {
    return res.status(400).json({
      error: "Please complete all listing fields."
    });
  }

  if (!Number.isFinite(price) || price < 0 || price > 100000000) {
    return res.status(400).json({
      error: "Enter a valid price."
    });
  }

  const data = loadData();

  const listing = {
    id: Date.now().toString(),
    business,
    title,
    category,
    description,
    contact,
    price,
    currency: "KES",
    createdAt: new Date().toISOString()
  };

  data.listings.unshift(listing);
  saveData(data);

  res.status(201).json({
    message: "Listing published!",
    listing
  });
});

app.post("/api/hosting", (req, res) => {
  const name = clean(req.body.name, 80);
  const email = clean(req.body.email, 120);
  const plan = clean(req.body.plan, 50);
  const domain = clean(req.body.domain, 120);

  if (!name || !email || !plan) {
    return res.status(400).json({
      error: "Name, email and hosting plan are required."
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: "Please enter a valid email address."
    });
  }

  const data = loadData();

  data.hostingRequests.unshift({
    id: Date.now().toString(),
    name,
    email,
    plan,
    domain,
    createdAt: new Date().toISOString(),
    status: "Pending"
  });

  saveData(data);

  app.listen(PORT, "0.0.0.0", () => {
  console.log(`Garang Business Company running on port ${PORT}`);
});

