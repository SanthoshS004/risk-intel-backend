const API_BASE_URL = 'http://localhost:8000';

// DOM Elements
const tabs = document.querySelectorAll('.tab-btn');
const scanContainers = document.querySelectorAll('.scan-container');
const scanMessageBtn = document.getElementById('scan-message-btn');
const scanUrlBtn = document.getElementById('scan-url-btn');
const messageInput = document.getElementById('message-input');
const urlInput = document.getElementById('url-input');
const channelSelect = document.getElementById('channel-select');
const scanLoader = document.getElementById('scan-loader');
const scanResult = document.getElementById('scan-result');
const riskGauge = document.getElementById('risk-gauge');
const riskScoreEl = document.getElementById('risk-score');
const riskLevelTextEl = document.getElementById('risk-level-text');
const explanationList = document.getElementById('explanation-list');
const recentFeed = document.getElementById('recent-feed');

// Stats Elements
const statHighRisk = document.getElementById('stat-high-risk');
const statMedRisk = document.getElementById('stat-med-risk');
const statSafe = document.getElementById('stat-safe');

// State
let stats = {
    high: 24,
    medium: 12,
    safe: 1240
};

// Tab Switching logic
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        scanContainers.forEach(c => c.style.display = 'none');
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.target).style.display = 'block';
        scanResult.style.display = 'none'; // Hide previous results
    });
});

// Update Dashboard Stats
function updateStats(riskLevel) {
    if (riskLevel === 'High') stats.high++;
    else if (riskLevel === 'Medium') stats.medium++;
    else stats.safe++;

    statHighRisk.textContent = stats.high;
    statMedRisk.textContent = stats.medium;
    statSafe.textContent = stats.safe.toLocaleString();
}

// Add to Live Feed
function addToFeed(text, source, riskLevel, score) {
    const iconClass = source === 'url' ? 'fa-link' : 'fa-message';
    
    const feedItem = document.createElement('div');
    feedItem.className = `feed-item ${riskLevel}`;
    feedItem.innerHTML = `
        <div class="feed-icon"><i class="fa-solid ${iconClass}"></i></div>
        <div class="feed-content">
            <p>${text}</p>
            <div class="feed-meta">
                <span><i class="fa-solid fa-clock"></i> Just now</span>
                <span><i class="fa-solid fa-satellite-dish"></i> ${source.toUpperCase()}</span>
                <span class="feed-score">Score: ${score}/100</span>
            </div>
        </div>
    `;
    
    recentFeed.prepend(feedItem);
    if (recentFeed.children.length > 10) {
        recentFeed.lastChild.remove();
    }
}

// Show Results
function displayResult(data, inputText, source) {
    scanLoader.style.display = 'none';
    scanResult.style.display = 'flex';
    
    // Update Gauge
    riskGauge.className = `risk-gauge risk-${data.risk_level}`;
    riskScoreEl.textContent = data.score;
    riskLevelTextEl.textContent = `${data.risk_level} Risk`;
    
    // Update Explanations
    explanationList.innerHTML = '';
    if (data.explanations && data.explanations.length > 0) {
        data.explanations.forEach(exp => {
            const li = document.createElement('li');
            const icon = exp.type === 'nlp' ? 'fa-robot' : (exp.type === 'url' ? 'fa-link' : 'fa-shield-halved');
            li.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${exp.description}</span>`;
            explanationList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fa-solid fa-check"></i> <span>No malicious indicators detected.</span>`;
        explanationList.appendChild(li);
    }
    
    updateStats(data.risk_level);
    addToFeed(inputText, source, data.risk_level, data.score);
}

// Handle API Errors
function handleError(error) {
    scanLoader.style.display = 'none';
    alert('Analysis failed: ' + error.message);
    console.error(error);
}

// Event Listeners
scanMessageBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) return;

    scanResult.style.display = 'none';
    scanLoader.style.display = 'block';

    try {
        const res = await fetch(`${API_BASE_URL}/scan-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                channel: channelSelect.value
            })
        });
        
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        displayResult(data, text, channelSelect.value);
    } catch (err) {
        handleError(err);
    }
});

scanUrlBtn.addEventListener('click', async () => {
    let url = urlInput.value.trim();
    if (!url) return;
    
    // Auto-prepend http if missing for valid Pydantic HttpUrl parsing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }

    scanResult.style.display = 'none';
    scanLoader.style.display = 'block';

    try {
        const res = await fetch(`${API_BASE_URL}/scan-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        displayResult(data, url, 'url');
    } catch (err) {
        handleError(err);
    }
});

// Initial mock data to populate feed
setTimeout(() => {
    addToFeed("URGENT: Your account is locked. Verify here: http://bit.ly/login", "sms", "High", 85);
    addToFeed("Hey, what time are we meeting tomorrow?", "whatsapp", "Low", 0);
    addToFeed("Your delivery package is pending. Click track-my-pkg.com", "sms", "Medium", 65);
}, 500);
