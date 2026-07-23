document.addEventListener("DOMContentLoaded", fetchJobs);

let countdownInterval;

function fetchJobs() {
    fetch('/api/jobs')
        .then(response => response.json())
        .then(data => {
            renderJobs(data);
            startCountdowns(data);
        })
        .catch(error => console.error('Error fetching jobs:', error));
}

function renderJobs(jobs) {
    const container = document.getElementById('jobs-container');
    container.innerHTML = '';

    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';

        const info = document.createElement('div');
        info.className = 'job-info';
        info.innerHTML = `
            <h3>${job.name}</h3>
            <p>${job.description}</p>
        `;

        const status = document.createElement('div');
        status.className = 'job-status';

        if (job.isActive) {
            const dateStr = new Date(job.nextRun).toLocaleString();
            status.innerHTML = `
                <div class="next-run">Next Run: ${dateStr}</div>
                <div class="countdown" id="countdown-${job.id}">Calculating...</div>
                <!-- Replaced the disabled button with this functional one -->
                <button class="deactivate-btn" onclick="deactivateJob(${job.id})">Deactivate</button>
            `;
        } else {
            const btn = document.createElement('button');
            btn.innerText = 'Activate';
            btn.onclick = () => activateJob(job.id);
            status.appendChild(btn);
        }

        card.appendChild(info);
        card.appendChild(status);
        container.appendChild(card);
    });
}

function activateJob(jobId) {
    fetch(`/api/activate?id=${jobId}`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                fetchJobs();
            }
        })
        .catch(error => console.error('Error activating job:', error));
}

function startCountdowns(jobs) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    const activeJobs = jobs.filter(j => j.isActive);

    countdownInterval = setInterval(() => {
        const now = new Date().getTime();

        activeJobs.forEach(job => {
            const element = document.getElementById(`countdown-${job.id}`);
            if (!element) return;

            const runTime = new Date(job.nextRun).getTime();
            const distance = runTime - now;

            if (distance < 0) {
                element.innerHTML = "Running now...";
                setTimeout(fetchJobs, 2000); 
                return;
            }

            const days = parseInt(distance / (1000 * 60 * 60 * 24));
            const hours = parseInt((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = parseInt((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = parseInt((distance % (1000 * 60)) / 1000);

            element.innerHTML = `T-Minus: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        });
    }, 1000);
}

function deactivateJob(jobId) {
    fetch(`/api/deactivate?id=${jobId}`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                fetchJobs();
            }
        })
        .catch(error => console.error('Error deactivating job:', error));
}