// DOM Elements
const repoUrlInput = document.getElementById('repoUrl');
const checkButton = document.getElementById('checkButton');
const loadingElement = document.getElementById('loading');
const resultElement = document.getElementById('result');
const errorElement = document.getElementById('error');
const errorMessageElement = document.getElementById('errorMessage');
const repoSizeElement = document.getElementById('repoSize');
const repoNameElement = document.getElementById('repoName');
const repoStarsElement = document.getElementById('repoStars');
const repoForksElement = document.getElementById('repoForks');
const repoUpdatedElement = document.getElementById('repoUpdated');
const repoLanguageElement = document.getElementById('repoLanguage');
const repoOwnerElement = document.getElementById('repoOwner');
const ownerAvatarElement = document.getElementById('ownerAvatar');
const repoLinkElement = document.getElementById('repoLink');
const darkModeToggle = document.getElementById('darkModeToggle');

// Check if user prefers dark mode
const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Apply the initial theme based on system preference
if (prefersDarkMode) {
    document.body.classList.add('dark-theme');
    darkModeToggle.textContent = '☀️';
} else {
    darkModeToggle.textContent = '🌙';
}

// Toggle dark/light mode
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDarkMode = document.body.classList.contains('dark-theme');
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
});

// Function to extract owner and repo from URL
function extractRepoInfo(url) {
    try {
        // Remove trailing slash if present
        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }

        // Parse the URL
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(part => part.length > 0);

        if (pathParts.length < 2) {
            throw new Error('Invalid GitHub repository URL');
        }

        return {
            owner: pathParts[0],
            repo: pathParts[1]
        };
    } catch (error) {
        throw new Error('Invalid URL format. Please enter a valid GitHub repository URL.');
    }
}

// Format file size in human-readable format
function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Show error message
function showError(message) {
    errorMessageElement.textContent = message;
    errorElement.style.display = 'block';
    resultElement.style.display = 'none';
    loadingElement.style.display = 'none';
}

// Fetch repository data from GitHub API
async function fetchRepoData(owner, repo) {
    try {
        // Fetch main repository information
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Repository not found. Please check the URL and try again.');
            } else if (response.status === 403) {
                throw new Error('API rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// Handle form submission
async function checkRepositorySize() {
    const repoUrl = repoUrlInput.value.trim();

    if (!repoUrl) {
        showError('Please enter a GitHub repository URL');
        return;
    }

    // Show loading state
    loadingElement.style.display = 'block';
    resultElement.style.display = 'none';
    errorElement.style.display = 'none';

    try {
        // Extract owner and repo name from URL
        const { owner, repo } = extractRepoInfo(repoUrl);

        // Fetch repository data
        const repoData = await fetchRepoData(owner, repo);

        // Update UI with repository data
        repoSizeElement.textContent = formatSize(repoData.size * 1024); // GitHub API reports size in KB
        repoNameElement.textContent = `${owner}/${repo}`;
        repoStarsElement.textContent = repoData.stargazers_count.toLocaleString();
        repoForksElement.textContent = repoData.forks_count.toLocaleString();
        repoUpdatedElement.textContent = formatDate(repoData.updated_at);
        repoLanguageElement.textContent = repoData.language || 'Not specified';
        repoOwnerElement.textContent = repoData.owner.login;
        ownerAvatarElement.src = repoData.owner.avatar_url;
        repoLinkElement.href = repoData.html_url;

        // Show result
        resultElement.style.display = 'block';

    } catch (error) {
        showError(error.message);
    } finally {
        loadingElement.style.display = 'none';
    }
}

// Set up event listeners
checkButton.addEventListener('click', checkRepositorySize);

repoUrlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        checkRepositorySize();
    }
});

// Pre-fill the repo URL input if one exists in the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const repoParam = urlParams.get('repo');
if (repoParam) {
    repoUrlInput.value = repoParam;
    checkRepositorySize();
}