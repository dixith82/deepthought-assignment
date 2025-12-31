// Main Application Data
const appData = {
    tasks: []
};

// DOM Elements
const tasksContainer = document.getElementById('tasksContainer');
const assetsContainer = document.getElementById('assetsContainer');
const expandAllBtn = document.getElementById('expandAllBtn');
const currentTaskTitle = document.getElementById('currentTaskTitle');
const currentTaskStatus = document.getElementById('currentTaskStatus');

// Asset Type Configuration
const assetConfig = {
    article: { icon: 'fa-file-alt', color: '#4f46e5' },
    video: { icon: 'fa-video', color: '#dc2626' },
    quiz: { icon: 'fa-question-circle', color: '#059669' },
    reflection: { icon: 'fa-brain', color: '#7c3aed' },
    threadbuilder: { icon: 'fa-sitemap', color: '#ea580c' },
    eagbuilder: { icon: 'fa-eye', color: '#0d9488' }
};

// Initialize the Application
async function initApp() {
    try {
        // Load JSON data
        const response = await fetch('data.json');
        const data = await response.json();
        appData.tasks = data.tasks;
        
        // Render all tasks
        renderAllTasks();
        
        // Set first task as active by default
        if (appData.tasks.length > 0) {
            selectTask(appData.tasks[0]);
        }
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to sample data if JSON fails
        appData.tasks = getSampleData();
        renderAllTasks();
    }
}

// Get sample data if JSON fails
function getSampleData() {
    return [
        {
            id: "task1",
            name: "Webpage Creation",
            status: "in_progress",
            assets: [
                { id: "asset1", name: "Figma Design Review", type: "article", duration: "10 min", 
                  description: "Study the Figma design carefully and understand the specifications.", 
                  content_url: "https://www.figma.com/file/hrBbLgcBWyoomChuEKFmpn/Untitled" },
                { id: "asset2", name: "HTML Structure Setup", type: "video", duration: "15 min", 
                  description: "Watch tutorial on creating semantic HTML structure.", 
                  content_url: null },
                { id: "asset3", name: "CSS Styling", type: "article", duration: "20 min", 
                  description: "Implement CSS styles matching the Figma design.", 
                  content_url: null }
            ]
        }
    ];
}

// Render all tasks in the journey board
function renderAllTasks() {
    tasksContainer.innerHTML = '';
    
    appData.tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksContainer.appendChild(taskElement);
    });
}

// Create a single task element
function createTaskElement(task) {
    const template = document.getElementById('taskTemplate');
    const clone = document.importNode(template.content, true);
    
    const taskEl = clone.querySelector('.task-item');
    const title = clone.querySelector('.task-title');
    const assetCount = clone.querySelector('.task-assets');
    const statusText = clone.querySelector('.task-status-text');
    const checkbox = clone.querySelector('.checkbox');
    const toggleBtn = clone.querySelector('.task-toggle-btn');
    const assetsList = clone.querySelector('.task-assets-list');
    
    // Set task data
    taskEl.dataset.taskId = task.id;
    title.textContent = task.name;
    assetCount.textContent = `${task.assets.length} asset${task.assets.length !== 1 ? 's' : ''}`;
    
    // Set status styling
    if (task.status === 'in_progress') {
        statusText.textContent = 'In Progress';
        statusText.style.color = '#92400e';
    } else if (task.status === 'completed') {
        statusText.textContent = 'Completed';
        statusText.style.color = '#065f46';
        checkbox.checked = true;
    } else {
        statusText.textContent = 'Pending';
        statusText.style.color = '#6b7280';
    }
    
    // Add assets to the task's asset list
    task.assets.forEach(asset => {
        const assetItem = document.createElement('div');
        assetItem.className = 'task-asset-item';
        const config = assetConfig[asset.type] || assetConfig.article;
        assetItem.innerHTML = `
            <div class="task-asset-icon">
                <i class="fas ${config.icon}" style="color: ${config.color}"></i>
            </div>
            <span class="task-asset-name">${asset.name}</span>
        `;
        assetsList.appendChild(assetItem);
    });
    
    // Task click event (select task)
    taskEl.addEventListener('click', (e) => {
        if (!e.target.classList.contains('task-toggle-btn') && 
            !e.target.closest('.task-toggle-btn') &&
            !e.target.classList.contains('checkbox')) {
            selectTask(task);
        }
    });
    
    // Toggle assets list visibility
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        assetsList.classList.toggle('expanded');
        toggleBtn.classList.toggle('rotated');
    });
    
    // Checkbox change event
    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        task.status = checkbox.checked ? 'completed' : 'pending';
        statusText.textContent = checkbox.checked ? 'Completed' : 'Pending';
        statusText.style.color = checkbox.checked ? '#065f46' : '#6b7280';
    });
    
    return taskEl;
}

// Select a task and display its details
function selectTask(task) {
    // Update task title
    currentTaskTitle.textContent = task.name;
    
    // Update status badge
    if (task.status === 'in_progress') {
        currentTaskStatus.textContent = 'In Progress';
        currentTaskStatus.className = 'status-badge status-pending';
    } else if (task.status === 'completed') {
        currentTaskStatus.textContent = 'Completed';
        currentTaskStatus.className = 'status-badge status-completed';
    } else {
        currentTaskStatus.textContent = 'Pending';
        currentTaskStatus.className = 'status-badge status-pending';
    }
    
    // Render the task's assets
    renderAssets(task.assets);
    
    // Update visual selection
    document.querySelectorAll('.task-item').forEach(item => {
        item.style.backgroundColor = '';
    });
    const activeTask = document.querySelector(`[data-task-id="${task.id}"]`);
    if (activeTask) {
        activeTask.style.backgroundColor = '#f0f9ff';
    }
}

// Render assets for the selected task
function renderAssets(assets) {
    assetsContainer.innerHTML = '';
    
    assets.forEach(asset => {
        const assetElement = createAssetElement(asset);
        assetsContainer.appendChild(assetElement);
    });
}

// Create a single asset element
function createAssetElement(asset) {
    const template = document.getElementById('assetTemplate');
    const clone = document.importNode(template.content, true);
    
    const assetEl = clone.querySelector('.asset-container');
    const title = clone.querySelector('.asset-title');
    const type = clone.querySelector('.asset-type');
    const duration = clone.querySelector('.asset-duration');
    const description = clone.querySelector('.description-text');
    const expandBtn = clone.querySelector('.expand-btn');
    const assetDesc = clone.querySelector('.asset-description');
    const icon = clone.querySelector('.asset-type-icon i');
    const startBtn = clone.querySelector('.btn-primary');
    const previewBtn = clone.querySelector('.btn-secondary');
    
    // Set asset data
    assetEl.dataset.assetId = asset.id;
    title.textContent = asset.name;
    type.textContent = asset.type.charAt(0).toUpperCase() + asset.type.slice(1);
    duration.textContent = asset.duration;
    description.textContent = asset.description;
    
    // Set icon and color based on asset type
    const config = assetConfig[asset.type] || assetConfig.article;
    icon.className = `fas ${config.icon}`;
    const iconContainer = clone.querySelector('.asset-type-icon');
    iconContainer.style.backgroundColor = `${config.color}15`;
    iconContainer.style.color = config.color;
    
    // Expand/collapse functionality
    expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        assetDesc.classList.toggle('expanded');
        expandBtn.classList.toggle('rotated');
    });
    
    // Click header to expand
    const header = clone.querySelector('.asset-header');
    header.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn')) {
            assetDesc.classList.toggle('expanded');
            expandBtn.classList.toggle('rotated');
        }
    });
    
    // Start Task button action
    startBtn.addEventListener('click', () => {
        alert(`Starting: ${asset.name}`);
        if (asset.content_url) {
            window.open(asset.content_url, '_blank');
        }
    });
    
    // Preview button action
    previewBtn.addEventListener('click', () => {
        alert(`Preview: ${asset.name}\n\n${asset.description}`);
    });
    
    return assetEl;
}

// Setup event listeners
function setupEventListeners() {
    // Expand/Collapse All button
    expandAllBtn.addEventListener('click', () => {
        const isExpanding = !expandAllBtn.classList.contains('expanded');
        
        const allAssets = document.querySelectorAll('.task-assets-list');
        const allButtons = document.querySelectorAll('.task-toggle-btn, .expand-btn');
        const allDescriptions = document.querySelectorAll('.asset-description');
        
        if (isExpanding) {
            // Expand everything
            allAssets.forEach(el => el.classList.add('expanded'));
            allButtons.forEach(el => el.classList.add('rotated'));
            allDescriptions.forEach(el => el.classList.add('expanded'));
            expandAllBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Collapse All';
            expandAllBtn.classList.add('expanded');
        } else {
            // Collapse everything
            allAssets.forEach(el => el.classList.remove('expanded'));
            allButtons.forEach(el => el.classList.remove('rotated'));
            allDescriptions.forEach(el => el.classList.remove('expanded'));
            expandAllBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Expand All';
            expandAllBtn.classList.remove('expanded');
        }
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);