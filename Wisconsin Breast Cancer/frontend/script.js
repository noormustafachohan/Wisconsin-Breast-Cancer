// List of 30 features (exact names/order your model expects)
const featureNames = [
 "radius_mean","texture_mean","perimeter_mean","area_mean","smoothness_mean",
 "compactness_mean","concavity_mean","concave points_mean","symmetry_mean",
 "fractal_dimension_mean","radius_se","texture_se","perimeter_se","area_se",
 "smoothness_se","compactness_se","concavity_se","concave points_se","symmetry_se",
 "fractal_dimension_se","radius_worst","texture_worst","perimeter_worst","area_worst",
 "smoothness_worst","compactness_worst","concavity_worst","concave points_worst",
 "symmetry_worst","fractal_dimension_worst"
];

const BASE_URL = "http://127.0.0.1:5000";   // change if backend hosted elsewhere
const inputsGrid = document.getElementById("inputsGrid");
const form = document.getElementById("predictForm");
const predictionText = document.getElementById("predictionText");
const predictionScore = document.getElementById("predictionScore");
const historyTbody = document.querySelector("#historyTable tbody");

// create input fields
featureNames.forEach((name, idx) => {
  const wrapper = document.createElement("div");
  wrapper.className = "input-group";
  const label = document.createElement("label");
  label.innerText = name;
  const input = document.createElement("input");
  input.type = "number";
  input.step = "any";
  input.id = `f${idx}`;
  input.placeholder = name;
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  inputsGrid.appendChild(wrapper);
});

function getFeatureArray() {
  return featureNames.map((_, i) => {
    const v = document.getElementById(`f${i}`).value;
    return v === "" ? null : parseFloat(v);
  });
}

function clearForm() {
  featureNames.forEach((_, i) => document.getElementById(`f${i}`).value = "");
  predictionText.innerText = "—";
  predictionScore.innerText = "—";
}

// local saved entries
const savedEntries = [];

// form submit -> Predict
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const features = getFeatureArray();

  // validation: require all features (you can change if want partial)
  if (features.some(v => v === null || Number.isNaN(v))) {
    alert("Please fill all feature fields with numeric values.");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features: features })
    });
    const data = await res.json();
    // backend should return {"prediction": "...", "score": ...} OR {"prediction": "..."}
    const pred = data.prediction ?? data.pred ?? "Unknown";
    const score = data.score ?? data.probability ?? "—";

    predictionText.innerText = pred;
    predictionScore.innerText = score;

  } catch (err) {
    alert("Error connecting to backend. Is it running on http://127.0.0.1:5000 ?");
    console.error(err);
  }
});

// Save current entry to local history table (does not save to backend)
document.getElementById("saveBtn").addEventListener("click", () => {
  const features = getFeatureArray();
  if (features.some(v => v === null || Number.isNaN(v))) {
    alert("Please complete all fields before saving.");
    return;
  }
  const pred = predictionText.innerText || "—";
  const score = predictionScore.innerText || "—";

  const entry = {
    id: savedEntries.length + 1,
    patient: `Patient ${savedEntries.length + 1}`,
    prediction: pred,
    score: score
  };
  savedEntries.push(entry);
  renderHistory();
  alert("Entry saved locally in the browser table below.");
});

document.getElementById("clearBtn").addEventListener("click", clearForm);

function renderHistory() {
  historyTbody.innerHTML = "";
  savedEntries.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${e.id}</td><td>${e.patient}</td><td>${e.prediction}</td><td>${e.score}</td>`;
    historyTbody.appendChild(tr);
  });
}
