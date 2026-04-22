const cursorBin = document.getElementById("cursorBin");
const sortingCore = document.getElementById("sortingCore");
const processList = document.getElementById("processList");
const statusTitle = document.getElementById("statusTitle");
const statusText = document.getElementById("statusText");
const scoreChip = document.getElementById("scoreChip");
const leftChip = document.getElementById("leftChip");
const heldChip = document.getElementById("heldChip");
const wasteItems = Array.from(document.querySelectorAll(".waste"));

const processMap = {
  plastic: {
    text: "Plastic enters the full chain. Metal is rejected, the plastic signature is confirmed, then the smart bin stores it efficiently.",
    steps: [
      {
        sensor: "ULTRASONIC SENSOR",
        result: "FILL CHECK",
        detail: "High-frequency sound waves measure how full the bin is."
      },
      {
        sensor: "IMAGE SENSOR",
        result: "OBJECT FOUND",
        detail: "A fast image is captured for computer vision recognition."
      },
      {
        sensor: "INDUCTIVE PROXIMITY SENSOR",
        result: "NO METAL",
        detail: "The metal detector does not trigger, so metal sorting is skipped."
      },
      {
        sensor: "INFRARED SPECTROSCOPY",
        result: "PLASTIC MATCH",
        detail: "The plastic light signature is read to identify the plastic type."
      },
      {
        sensor: "IOT SMART BIN",
        result: "DATA SENT",
        detail: "The system logs the waste and updates the connected dashboard."
      },
      {
        sensor: "SOLAR COMPACTOR",
        result: "SPACE SAVED",
        detail: "The waste is compacted so the bin can hold much more material."
      }
    ]
  },
  organic: {
    text: "Organic waste enters the same chain. Vision recognizes it, metal and plastic checks reject it, then the bin stores it separately.",
    steps: [
      {
        sensor: "ULTRASONIC SENSOR",
        result: "FILL CHECK",
        detail: "Sound waves check the fill level before the item is accepted."
      },
      {
        sensor: "IMAGE SENSOR",
        result: "ORGANIC FOUND",
        detail: "The high-speed image helps computer vision identify food waste."
      },
      {
        sensor: "INDUCTIVE PROXIMITY SENSOR",
        result: "NO METAL",
        detail: "No conductive material is detected in this waste."
      },
      {
        sensor: "INFRARED SPECTROSCOPY",
        result: "NO PLASTIC",
        detail: "No plastic light signature is matched, so plastic routing is skipped."
      },
      {
        sensor: "IOT SMART BIN",
        result: "DATA SENT",
        detail: "The smart bin shares sorting and fill-level data online."
      },
      {
        sensor: "SOLAR COMPACTOR",
        result: "SPACE SAVED",
        detail: "Smart storage helps the bin hold far more waste before collection."
      }
    ]
  },
  metal: {
    text: "Metal enters the full chain too. The inductive proximity sensor gives the key match, then the system logs and stores the waste.",
    steps: [
      {
        sensor: "ULTRASONIC SENSOR",
        result: "FILL CHECK",
        detail: "High-frequency sound waves measure the bin fill level."
      },
      {
        sensor: "IMAGE SENSOR",
        result: "OBJECT FOUND",
        detail: "A fast image is taken so computer vision can recognize the item."
      },
      {
        sensor: "INDUCTIVE PROXIMITY SENSOR",
        result: "METAL MATCH",
        detail: "The sensor detects conductive material and confirms metal."
      },
      {
        sensor: "INFRARED SPECTROSCOPY",
        result: "NOT PLASTIC",
        detail: "No plastic light signature is accepted for this item."
      },
      {
        sensor: "IOT SMART BIN",
        result: "DATA SENT",
        detail: "The connected bin reports sorting and fill-level information."
      },
      {
        sensor: "SOLAR COMPACTOR",
        result: "SPACE SAVED",
        detail: "Compaction helps the bin hold five to eight times more waste."
      }
    ]
  }
};

let heldWaste = null;
let score = 0;

function stateClass(result) {
  if (result === "PLASTIC MATCH" || result === "ORGANIC FOUND" || result === "METAL MATCH") {
    return "match";
  }

  if (result === "NO METAL" || result === "NO PLASTIC" || result === "NOT PLASTIC") {
    return "skip";
  }

  if (result === "DATA SENT") {
    return "flow";
  }

  if (result === "SPACE SAVED") {
    return "store";
  }

  return "check";
}

function updateHud() {
  const left = wasteItems.filter((item) => !item.classList.contains("sorted")).length;
  scoreChip.textContent = `Score: ${score}`;
  leftChip.textContent = `Left: ${left}`;
  heldChip.textContent = `Holding: ${heldWaste ? heldWaste.dataset.name : "none"}`;

  if (left === 0) {
    statusTitle.textContent = "Level cleared";
    statusText.textContent = "Every waste item has passed through the smart dustbin sensors.";
  }
}

function showProcess(type, name) {
  const data = processMap[type];
  statusTitle.textContent = `${name} thrown`;
  statusText.textContent = data.text;
  processList.innerHTML = "";

  data.steps.forEach((step, index) => {
    const card = document.createElement("div");
    card.className = `step ${stateClass(step.result)}`;
    card.style.animationDelay = `${index * 0.06}s`;
    card.innerHTML = `
      <div class="step-top">
        <strong>${step.sensor}</strong>
        <em>${step.result}</em>
      </div>
      <span>${step.detail}</span>
    `;
    processList.appendChild(card);
  });
}

function releaseHeldWaste() {
  if (!heldWaste) {
    return;
  }

  heldWaste.classList.remove("held");
  heldWaste = null;
  cursorBin.classList.remove("holding");
  updateHud();
}

wasteItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (item.classList.contains("sorted")) {
      return;
    }

    if (heldWaste === item) {
      releaseHeldWaste();
      statusTitle.textContent = "Dropped";
      statusText.textContent = "Pick it again or grab another waste item.";
      return;
    }

    if (heldWaste) {
      heldWaste.classList.remove("held");
    }

    heldWaste = item;
    heldWaste.classList.add("held");
    cursorBin.classList.add("holding");
    statusTitle.textContent = `${item.dataset.name} grabbed`;
    statusText.textContent = "Now click the glowing core to throw it into the smart dustbin.";
    updateHud();
  });
});

sortingCore.addEventListener("click", () => {
  if (!heldWaste) {
    statusTitle.textContent = "No waste loaded";
    statusText.textContent = "Catch one scattered waste item first.";
    return;
  }

  const waste = heldWaste;
  const type = waste.dataset.type;
  const name = waste.dataset.name;

  sortingCore.classList.add("hot");
  setTimeout(() => sortingCore.classList.remove("hot"), 260);

  waste.classList.remove("held");
  waste.classList.add("sorted");
  heldWaste = null;
  cursorBin.classList.remove("holding");
  score += 10;

  showProcess(type, name);
  updateHud();
});

window.addEventListener("mousemove", (event) => {
  cursorBin.style.left = `${event.clientX}px`;
  cursorBin.style.top = `${event.clientY}px`;
});

updateHud();
