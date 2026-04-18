/* ────────────────────────────────────────────────────────
   Fusion Dashboard — script.js
   ──────────────────────────────────────────────────────── */

// ── Hardcoded marker data ───────────────────────────────
const MARKERS_DATA = [
  {
    id: 1,
    lat: 22.5726,
    lng: 88.3639,
    title: "Suspicious Activity",
    description:
      "Unusual movement detected near Howrah Bridge corridor. Multiple unidentified individuals observed at 02:34 IST.",
    image: "images/sample1.jpg",
    severity: "high",
    status: "estimated",
    timestamp: "2026-04-18T02:34:00",
  },
  {
    id: 2,
    lat: 28.7041,
    lng: 77.1025,
    title: "Vehicle Tracking",
    description:
      "Unmarked black SUV spotted entering restricted zone near Delhi cantonment. License plate does not match any registered database.",
    image: "images/sample2.jpg",
    severity: "critical",
    status: "verified",
    timestamp: "2026-04-18T05:12:00",
  },
  {
    id: 3,
    lat: 19.076,
    lng: 72.8777,
    title: "Harbor Surveillance",
    description:
      "Unscheduled cargo vessel detected at Mumbai port. Manifests do not match port authority records.",
    image: "images/sample3.jpg",
    severity: "medium",
    status: "estimated",
    timestamp: "2026-04-17T22:15:00",
  },
  {
    id: 4,
    lat: 13.0827,
    lng: 80.2707,
    title: "Crowd Monitoring",
    description:
      "Large unauthorized gathering detected in southern Chennai via thermal imaging. Estimated 400+ individuals.",
    image: "images/sample4.jpg",
    severity: "low",
    status: "verified",
    timestamp: "2026-04-18T18:45:00",
  },
  {
    id: 5,
    lat: 26.9124,
    lng: 75.7873,
    title: "Perimeter Breach",
    description:
      "Fence breach detected at Jaipur military installation sector 7-G. Motion sensors triggered at 03:08 IST.",
    image: "images/sample5.jpg",
    severity: "critical",
    status: "verified",
    timestamp: "2026-04-18T03:08:00",
  },
  {
    id: 6,
    lat: 15.3173,
    lng: 75.7139,
    title: "Airstrip Recon",
    description:
      "Satellite imagery reveals unreported aircraft activity at remote airstrip near Hubli. Two light aircraft identified.",
    image: "images/sample6.jpg",
    severity: "high",
    status: "estimated",
    timestamp: "2026-04-17T14:22:00",
  },
];

// ── Severity icon map ───────────────────────────────────
const SEVERITY_ICONS = {
  critical: "⚠",
  high: "🔶",
  medium: "🔸",
  low: "✅",
};

// ── Helpers ─────────────────────────────────────────────
function formatTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function relativeTime(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Map Initialization ─────────────────────────────────
const map = L.map("map", {
  center: [22.0, 78.0],
  zoom: 5,
  zoomControl: true,
  attributionControl: true,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// ── Create custom marker icon ──────────────────────────
function createMarkerIcon(severity, status) {
  const estimatedClass = status === "estimated" ? "estimated" : "";
  return L.divIcon({
    className: `custom-marker ${estimatedClass}`,
    html: `
      <div class="marker-pulse ${severity} ${estimatedClass}"></div>
      <div class="marker-pin ${severity} ${estimatedClass}">${SEVERITY_ICONS[severity]}</div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -44],
  });
}

// ── Create popup HTML ──────────────────────────────────
function createPopupHTML(item) {
  const statusIcon = item.status === "verified" ? "✔" : "◎";
  const statusLabel = item.status === "verified" ? "Verified" : "Estimated";
  return `
    <div class="popup-content">
      <img class="popup-image" src="${item.image}" alt="${item.title}" loading="lazy" />
      <div class="popup-body">
        <div class="popup-title-row">
          <span class="popup-title">${item.title}</span>
          <div class="popup-badges">
            <span class="status-badge ${item.status}">${statusIcon} ${statusLabel}</span>
            <span class="severity-badge ${item.severity}">${item.severity}</span>
          </div>
        </div>
        <p class="popup-desc">${item.description}</p>
        <div class="popup-footer">
          <span>📍 ${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}</span>
          <span style="margin-left:auto">🕐 ${formatTime(item.timestamp)}</span>
        </div>
      </div>
    </div>
  `;
}

// ── Add markers to map ─────────────────────────────────
const markersMap = {};

MARKERS_DATA.forEach((item) => {
  const marker = L.marker([item.lat, item.lng], {
    icon: createMarkerIcon(item.severity, item.status),
    title: item.title,
  }).addTo(map);

  marker.bindPopup(createPopupHTML(item), {
    maxWidth: 320,
    minWidth: 300,
    closeButton: true,
    className: "",
  });

  // Show popup on hover
  marker.on("mouseover", function () {
    this.openPopup();
  });

  markersMap[item.id] = marker;
});

// ── Build Stats Bar ────────────────────────────────────
function buildStatsBar() {
  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  const statusCounts = { verified: 0, estimated: 0 };
  MARKERS_DATA.forEach((d) => {
    severityCounts[d.severity]++;
    statusCounts[d.status]++;
  });

  const statsBar = document.getElementById("stats-bar");
  const severityChips = Object.entries(severityCounts)
    .map(
      ([key, val]) => `
      <div class="stat-chip ${key}">
        <div class="stat-count">${val}</div>
        <div class="stat-label">${key}</div>
      </div>
    `
    )
    .join("");

  const statusChips = `
    <div class="stat-chip verified-chip">
      <div class="stat-count" style="color: #22c55e">✔ ${statusCounts.verified}</div>
      <div class="stat-label">Verified</div>
    </div>
    <div class="stat-chip estimated-chip">
      <div class="stat-count" style="color: #a78bfa">◎ ${statusCounts.estimated}</div>
      <div class="stat-label">Estimated</div>
    </div>
  `;

  statsBar.innerHTML = severityChips;

  // Inject status stats into the dedicated container
  const statusBar = document.getElementById("status-bar");
  if (statusBar) statusBar.innerHTML = statusChips;
}

// ── Build Feed Cards ───────────────────────────────────
function buildFeed() {
  const feed = document.getElementById("feed");

  // sort: critical first, then high, medium, low
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...MARKERS_DATA].sort(
    (a, b) => order[a.severity] - order[b.severity]
  );

  feed.innerHTML = sorted
    .map(
      (item) => {
        const statusIcon = item.status === "verified" ? "✔" : "◎";
        const statusLabel = item.status === "verified" ? "Verified" : "Estimated";
        return `
    <div class="feed-card ${item.severity} ${item.status}" data-id="${item.id}" id="feed-card-${item.id}">
      <div class="feed-card-top">
        <span class="feed-card-title">${item.title}</span>
        <div class="feed-card-badges">
          <span class="status-badge-sm ${item.status}">${statusIcon}</span>
          <span class="severity-badge ${item.severity}">${item.severity}</span>
        </div>
      </div>
      <p class="feed-card-desc">${item.description}</p>
      <div class="feed-card-meta">
        <span class="meta-item">${statusIcon} ${statusLabel}</span>
        <span class="meta-item">📍 ${item.lat.toFixed(2)}°, ${item.lng.toFixed(2)}°</span>
        <span class="meta-item">🕐 ${relativeTime(item.timestamp)}</span>
      </div>
    </div>
  `;
      }
    )
    .join("");

  // Attach click listeners
  feed.querySelectorAll(".feed-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = parseInt(card.dataset.id, 10);
      const item = MARKERS_DATA.find((d) => d.id === id);
      if (!item) return;

      // Fly to marker
      map.flyTo([item.lat, item.lng], 10, { duration: 1.2 });

      // Open popup
      setTimeout(() => {
        markersMap[id].openPopup();
      }, 600);

      // Highlight active card
      feed
        .querySelectorAll(".feed-card")
        .forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });
}

// ── Init ────────────────────────────────────────────────
buildStatsBar();
buildFeed();
