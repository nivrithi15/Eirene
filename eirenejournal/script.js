const DEFAULT_ENTRIES = [
  {
    id: 1,
    week: "Week 1",
    imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=400&h=400&fit=crop",
    mood: 4,
    journal: "Today was incredibly difficult. I barely slept, and everything feels overwhelming right now. Trying to take it one hour at a time."
  },
  {
    id: 2,
    week: "Week 3",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&h=400&fit=crop",
    mood: 6,
    journal: "I finally went outside with my baby for a short walk in the fresh air. The sun felt amazing on my skin. Still tired, but feeling a tiny spark."
  }
];

const MOOD_DATA = {
  1: { emoji: "😢", label: "Very Low", color: "#e07a5f" },
  2: { emoji: "😢", label: "Very Low", color: "#e07a5f" },
  3: { emoji: "😕", label: "Low", color: "#e07a5f" },
  4: { emoji: "😕", label: "Low", color: "#e07a5f" },
  5: { emoji: "😐", label: "Neutral", color: "#f4a261" },
  6: { emoji: "😐", label: "Neutral", color: "#f4a261" },
  7: { emoji: "🙂", label: "Good", color: "#81b29a" },
  8: { emoji: "🙂", label: "Good", color: "#81b29a" },
  9: { emoji: "😄", label: "Excellent", color: "#81b29a" },
  10: { emoji: "😄", label: "Excellent", color: "#81b29a" }
};

// State Variables
let recoveryEntries = (() => {
  const storedEntries = localStorage.getItem('eirene_entries');
  if (storedEntries) {
    try {
      return JSON.parse(storedEntries);
    } catch (error) {
      console.warn('Unable to read saved entries:', error);
    }
  }
  return DEFAULT_ENTRIES;
})();
let journalEntryProgressCount = (() => {
  const storedEntries = localStorage.getItem('eirene_entries');
  if (storedEntries) {
    try {
      return JSON.parse(storedEntries).length;
    } catch (error) {
      console.warn('Unable to count saved entries:', error);
    }
  }
  return Number(localStorage.getItem('eirene_journal_entry_count') || 0);
})();
let cloudinaryConfig = JSON.parse(localStorage.getItem('eirene_cloudinary')) || {
  cloudName: "dmvuzwlxs",
  uploadPreset: "eirene"
};
let currentFilter = 'all';
let currentSort = 'asc'; // 'asc' = oldest first, 'desc' = newest first
let currentImageBase64 = "";
let editedImageUrl = "";
let pendingEditedImageUrl = "";
let cloudinaryAssistantContext = null;
const DEFAULT_MEDIA_IMAGE = "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600&h=600&fit=crop";
const RECOVERY_MILESTONES = [
  {
    id: 1,
    key: 'first-reflection',
    title: 'First Reflection',
    description: 'Capture your first journal entry and begin honoring your healing story.',
    icon: 'fa-solid fa-pen-nib',
    requirement: 'Create your first journal entry.',
    unlocked: false,
    unlockedAt: ''
  },
  {
    id: 2,
    key: 'captured-journey',
    title: 'Captured My Journey',
    description: 'Upload your first recovery photo to preserve a meaningful memory.',
    icon: 'fa-solid fa-camera',
    requirement: 'Upload your first recovery photo.',
    unlocked: false,
    unlockedAt: ''
  },
  {
    id: 3,
    key: 'emotional-checkin',
    title: 'Emotional Check-in',
    description: 'Record your first mood so your healing can be seen clearly.',
    icon: 'fa-solid fa-face-smile',
    requirement: 'Record your first mood.',
    unlocked: false,
    unlockedAt: ''
  },
  {
    id: 4,
    key: 'one-week-strong',
    title: 'One Week Strong',
    description: 'A full week of reflections shows incredible consistency.',
    icon: 'fa-solid fa-calendar-check',
    requirement: 'Complete 7 journal entries.',
    unlocked: false,
    unlockedAt: ''
  },
  {
    id: 5,
    key: 'consistent-care',
    title: 'Consistent Care',
    description: 'Fourteen reflections are a beautiful sign of steady care.',
    icon: 'fa-solid fa-book-open',
    requirement: 'Complete 14 journal entries.',
    unlocked: false,
    unlockedAt: ''
  },
  {
    id: 6,
    key: 'healing-habit',
    title: 'Healing Habit',
    description: 'Seven straight days of mood check-ins build a nurturing routine.',
    icon: 'fa-solid fa-heart-circle-check',
    requirement: 'Complete 7 consecutive daily mood check-ins.',
    unlocked: false,
    unlockedAt: ''
  },
  {
    id: 7,
    key: 'halfway-there',
    title: 'Halfway There',
    description: 'Reaching Week 4 is a meaningful milestone in your journey.',
    icon: 'fa-solid fa-seedling',
    requirement: 'Reach the Recovery Tracker Week 4.',
    unlocked: false,
    unlockedAt: ''
  },
  {
    id: 8,
    key: 'recovery-champion',
    title: 'Recovery Champion',
    description: 'Week 8 reflects deep courage and steady progress.',
    icon: 'fa-solid fa-trophy',
    requirement: 'Reach the Recovery Tracker Week 8.',
    unlocked: false,
    unlockedAt: ''
  },
  {
    id: 9,
    key: 'memory-keeper',
    title: 'Memory Keeper',
    description: 'Ten recovery photos create a cherished archive of your healing.',
    icon: 'fa-solid fa-images',
    requirement: 'Upload 10 recovery photos.',
    unlocked: false,
    unlockedAt: ''
  },
  {
    id: 10,
    key: 'mindful-mom',
    title: 'Mindful Mom',
    description: 'Using the AI Wellness Assistant for the first time is a beautiful act of self-care.',
    icon: 'fa-solid fa-robot',
    requirement: 'Use the AI Wellness Assistant for the first time.',
    unlocked: false,
    unlockedAt: ''
  }
];
const RECOVERY_MILESTONES_STORAGE_KEY = 'eirene_recovery_milestones';
const MOOD_STREAK_STORAGE_KEY = 'eirene_mood_streak';
const PHOTO_UPLOAD_COUNT_STORAGE_KEY = 'eirene_photo_upload_count';

const AFFIRMATIONS = [
  "You are healing one day at a time.",
  "You are stronger than you realize.",
  "Rest is productive.",
  "Every small step counts.",
  "You deserve kindness too.",
  "Your healing matters.",
  "You are doing enough.",
  "Recovery is not a race.",
  "Celebrate every little victory.",
  "You are growing alongside your baby.",
  "Your body is learning and adapting with love.",
  "Softness is strength.",
  "You are allowed to take up space in your own care.",
  "Your energy returns in its own time.",
  "This season is tender, and you are meeting it with courage.",
  "Gentle progress is still progress.",
  "You do not need to earn rest.",
  "Your heart and body are both healing.",
  "You are allowed to ask for help.",
  "Each breath is a reset.",
  "You are becoming whole again, slowly and beautifully.",
  "Your well-being matters as much as your baby’s.",
  "You are worthy of patience and peace.",
  "Small comforts create big healing.",
  "The work you do in quiet moments matters.",
  "Your resilience is already showing.",
  "Tomorrow can begin with one gentle step.",
  "You are more supported than you think.",
  "Your healing deserves tenderness, not pressure.",
  "You are building a new rhythm with grace.",
  "This chapter is hard, and you are still rising.",
  "You are allowed to feel tired and still be doing beautifully.",
  "Your love is enough for this season."
];

// DOM Links
const timelineTrack = document.getElementById('timeline-track');
const memoryForm = document.getElementById('memory-form');
const moodInput = document.getElementById('mood-input');
const moodValDisplay = document.getElementById('mood-val');
const moodEmojiDisplay = document.getElementById('mood-emoji');
const moodLabelDisplay = document.getElementById('mood-label');
const imageInput = document.getElementById('image-input');
const fileChosenDisplay = document.getElementById('file-chosen');
const moodImprovementDisplay = document.getElementById('mood-improvement');
const totalMilestonesDisplay = document.getElementById('total-milestones');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const submitBtn = document.getElementById('submit-btn');
const affirmationText = document.getElementById('affirmation-text');
const affirmationDate = document.getElementById('affirmation-date');

const milestoneForm = document.getElementById('milestone-form');
const milestoneEditIdInput = document.getElementById('milestone-edit-id');
const milestoneTitleInput = document.getElementById('milestone-title');
const milestoneDateInput = document.getElementById('milestone-date');
const milestoneNotesInput = document.getElementById('milestone-notes');
const milestonePhotoInput = document.getElementById('milestone-photo');
const milestonePhotoPreview = document.getElementById('milestone-photo-preview');
const milestoneSubmitBtn = document.getElementById('milestone-submit-btn');
const cancelMilestoneEditBtn = document.getElementById('cancel-milestone-edit-btn');
const milestoneSuggestions = document.getElementById('milestone-suggestions');
const milestonesList = document.getElementById('milestones-list');
const recoveryMilestonesGrid = document.getElementById('recovery-milestones-grid');
const recoveryMilestonesCount = document.getElementById('recovery-milestones-count');
const recoveryMilestonesPercent = document.getElementById('recovery-milestones-percent');
const recoveryMilestonesProgressFill = document.getElementById('recovery-milestones-progress-fill');
const milestoneModal = document.getElementById('milestone-modal');
const celebrationMilestoneName = document.getElementById('celebration-milestone-name');
const celebrationMilestoneDescription = document.getElementById('celebration-milestone-description');
const continueMilestoneBtn = document.getElementById('continue-milestone-btn');

// AI Chat elements
const aiDrawer = document.getElementById('ai-drawer');
const aiFloatingTrigger = document.getElementById('ai-floating-trigger');
const aiMessages = document.getElementById('ai-messages');
const aiInputForm = document.getElementById('ai-input-form');
const aiChatInput = document.getElementById('ai-chat-input');
const btnCloseDrawer = document.getElementById('btn-close-drawer');
const quickReplyButtons = document.querySelectorAll('.quick-reply-btn');

function getRandomAffirmation() {
  const index = Math.floor(Math.random() * AFFIRMATIONS.length);
  return AFFIRMATIONS[index];
}

function updateAffirmationDisplay(text) {
  affirmationText.textContent = text;
  affirmationDate.textContent = `Today • ${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date())}`;
}

function initAffirmationCard() {
  updateAffirmationDisplay(getRandomAffirmation());
}

let milestonePhotoDataUrl = '';
let editingMilestoneId = null;
let milestoneModalTimer = null;
let moodStreakState = JSON.parse(localStorage.getItem(MOOD_STREAK_STORAGE_KEY)) || { streak: 0, lastRecordedDate: '' };

function getDefaultMilestones() {
  return RECOVERY_MILESTONES.map((item) => ({ ...item }));
}

function loadMilestones() {
  const stored = localStorage.getItem(RECOVERY_MILESTONES_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    } catch (error) {
      console.warn('Unable to read saved milestones:', error);
    }
  }
  const defaults = getDefaultMilestones();
  localStorage.setItem(RECOVERY_MILESTONES_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveMilestones(milestones) {
  localStorage.setItem(RECOVERY_MILESTONES_STORAGE_KEY, JSON.stringify(milestones));
}

function getUnlockedMilestones() {
  return loadMilestones().filter((milestone) => milestone.unlocked);
}

function getMilestoneProgress() {
  const milestones = loadMilestones();
  const completedCount = milestones.filter((milestone) => milestone.unlocked).length;
  const totalCount = milestones.length;
  return {
    completedCount,
    totalCount,
    percent: totalCount ? Math.round((completedCount / totalCount) * 100) : 0
  };
}

function updateRecoveryMilestonesSummary() {
  const { completedCount, totalCount, percent } = getMilestoneProgress();
  recoveryMilestonesCount.textContent = `${completedCount} / ${totalCount}`;
  recoveryMilestonesPercent.textContent = `${percent}%`;
  recoveryMilestonesProgressFill.style.width = `${percent}%`;
  recoveryMilestonesProgressFill.setAttribute('aria-valuenow', percent);
}

function formatMilestoneDate(dateValue) {
  if (!dateValue) return '';
  return new Date(dateValue).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateMoodStreak(recordedDate = new Date().toISOString().slice(0, 10)) {
  const lastRecordedDate = moodStreakState.lastRecordedDate;
  const today = recordedDate;
  let nextStreak = moodStreakState.streak || 0;

  if (!lastRecordedDate) {
    nextStreak = 1;
  } else {
    const lastDate = new Date(lastRecordedDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      nextStreak += 1;
    } else if (diffDays !== 0) {
      nextStreak = 1;
    }
  }

  moodStreakState = { streak: nextStreak, lastRecordedDate: today };
  localStorage.setItem(MOOD_STREAK_STORAGE_KEY, JSON.stringify(moodStreakState));
  return moodStreakState.streak;
}

function incrementPhotoUploadCount() {
  const currentCount = Number(localStorage.getItem(PHOTO_UPLOAD_COUNT_STORAGE_KEY) || 0);
  const nextCount = currentCount + 1;
  localStorage.setItem(PHOTO_UPLOAD_COUNT_STORAGE_KEY, String(nextCount));
  return nextCount;
}

function unlockMilestones(reason, details = {}, options = {}) {
  const milestones = loadMilestones();
  let changed = false;
  const shouldCelebrate = options.showCelebration !== false;

  const unlock = (milestoneKey, overrideTitle, overrideDescription) => {
    const target = milestones.find((milestone) => milestone.key === milestoneKey);
    if (!target || target.unlocked) return;

    target.unlocked = true;
    target.unlockedAt = new Date().toISOString();
    changed = true;
    if (shouldCelebrate) {
      showCelebrationModal(overrideTitle || target.title, overrideDescription || target.description);
    }
  };

  if (reason === 'journal-entry') {
    unlock('first-reflection');
  } else if (reason === 'photo-upload') {
    unlock('captured-journey');
  } else if (reason === 'mood-recorded') {
    unlock('emotional-checkin');
  } else if (reason === 'journal-count') {
    if (details.count >= 7) unlock('one-week-strong');
    if (details.count >= 14) unlock('consistent-care');
  } else if (reason === 'mood-streak') {
    if (details.streak >= 7) unlock('healing-habit');
  } else if (reason === 'week-reached') {
    if (details.week >= 4) unlock('halfway-there');
    if (details.week >= 8) unlock('recovery-champion');
  } else if (reason === 'photo-count') {
    if (details.count >= 10) unlock('memory-keeper');
  } else if (reason === 'ai-assistant-used') {
    unlock('mindful-mom');
  }

  if (changed) {
    saveMilestones(milestones);
    renderRecoveryMilestones();
    updateRecoveryMilestonesSummary();
  }
}

function syncRecoveryMilestonesWithHistory() {
  const journalCount = journalEntryProgressCount;
  const photoCount = Number(localStorage.getItem(PHOTO_UPLOAD_COUNT_STORAGE_KEY) || 0);
  const streak = moodStreakState.streak || 0;

  if (journalCount >= 1) {
    unlockMilestones('journal-entry', {}, { showCelebration: false });
  }
  if (journalCount >= 7) {
    unlockMilestones('journal-count', { count: journalCount }, { showCelebration: false });
  }
  if (journalCount >= 14) {
    unlockMilestones('journal-count', { count: journalCount }, { showCelebration: false });
  }
  if (photoCount >= 10) {
    unlockMilestones('photo-count', { count: photoCount }, { showCelebration: false });
  }
  if (streak >= 7) {
    unlockMilestones('mood-streak', { streak }, { showCelebration: false });
  }
}

function resetMilestoneForm() {
  milestoneForm.reset();
  milestoneEditIdInput.value = '';
  editingMilestoneId = null;
  milestonePhotoDataUrl = '';
  milestonePhotoPreview.classList.add('hidden');
  milestonePhotoPreview.innerHTML = '';
  milestoneSubmitBtn.textContent = 'Add milestone';
  cancelMilestoneEditBtn.classList.add('hidden');
}

function renderMilestoneSuggestions() {
  milestoneSuggestions.innerHTML = '';
  getDefaultMilestones().forEach((suggestion) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'milestone-suggestion-chip';
    button.textContent = suggestion.title;
    button.addEventListener('click', () => {
      const milestones = loadMilestones();
      const exists = milestones.some((item) => item.key === suggestion.key);
      if (!exists) {
        milestones.push({ ...suggestion, unlocked: false, unlockedAt: '' });
        saveMilestones(milestones);
        renderRecoveryMilestones();
      }
    });
    milestoneSuggestions.appendChild(button);
  });
}

function renderRecoveryMilestones() {
  const milestones = loadMilestones();
  recoveryMilestonesGrid.innerHTML = '';

  if (!milestones.length) {
    recoveryMilestonesGrid.innerHTML = '<div class="milestone-empty-state">Your recovery milestones will appear here as you care for yourself.</div>';
    updateRecoveryMilestonesSummary();
    return;
  }

  milestones.forEach((milestone) => {
    const card = document.createElement('article');
    card.className = `recovery-milestone-card ${milestone.unlocked ? 'is-unlocked' : 'is-locked'}`;

    card.innerHTML = `
      <div class="recovery-milestone-card__icon">
        <i class="${milestone.icon}"></i>
      </div>
      <div class="recovery-milestone-card__body">
        <div class="recovery-milestone-card__title-row">
          <h4>${milestone.title}</h4>
          ${milestone.unlocked ? '<span class="recovery-milestone-card__badge"><i class="fa-solid fa-check"></i></span>' : '<span class="recovery-milestone-card__badge recovery-milestone-card__badge--locked"><i class="fa-solid fa-lock"></i></span>'}
        </div>
        <p>${milestone.description}</p>
        <div class="recovery-milestone-card__status">
          <span>${milestone.unlocked ? 'Unlocked' : 'Locked'}</span>
          ${milestone.unlocked && milestone.unlockedAt ? `<span>${formatMilestoneDate(milestone.unlockedAt)}</span>` : `<span>${milestone.requirement}</span>`}
        </div>
        <div class="recovery-milestone-card__progress">
          <div class="recovery-milestone-card__progress-bar"></div>
        </div>
      </div>
    `;

    recoveryMilestonesGrid.appendChild(card);
  });

  updateRecoveryMilestonesSummary();
}

function renderMilestones() {
  renderRecoveryMilestones();
}

function handleMilestonePhotoSelection(file) {
  if (!file) {
    milestonePhotoDataUrl = '';
    milestonePhotoPreview.innerHTML = '';
    milestonePhotoPreview.classList.add('hidden');
    clearCloudinaryAssistantContext();
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    milestonePhotoDataUrl = event.target.result;
    milestonePhotoPreview.innerHTML = `<img src="${milestonePhotoDataUrl}" alt="Selected milestone photo">`;
    milestonePhotoPreview.classList.remove('hidden');

    setCloudinaryAssistantContext({
      sourceFile: file,
      sourceBase64: milestonePhotoDataUrl,
      previewElement: milestonePhotoPreview,
      onAccept: (url) => {
        milestonePhotoDataUrl = url;
        milestonePhotoPreview.innerHTML = `<img src="${url}" alt="Milestone photo">`;
        milestonePhotoPreview.classList.remove('hidden');
      },
      onReject: () => {
        milestonePhotoDataUrl = '';
        milestonePhotoPreview.innerHTML = '';
        milestonePhotoPreview.classList.add('hidden');
      }
    });

    window.openCloudinaryAIModal?.();
  };
  reader.readAsDataURL(file);
}

function showCelebrationModal(title, description) {
  celebrationMilestoneName.textContent = title;
  celebrationMilestoneDescription.textContent = description;
  milestoneModal.classList.remove('hidden');
  if (milestoneModalTimer) clearTimeout(milestoneModalTimer);
  milestoneModalTimer = setTimeout(() => {
    milestoneModal.classList.add('hidden');
  }, 4000);
}

function initMilestonesSection() {
  renderMilestoneSuggestions();
  renderRecoveryMilestones();

  continueMilestoneBtn.addEventListener('click', () => {
    milestoneModal.classList.add('hidden');
    if (milestoneModalTimer) clearTimeout(milestoneModalTimer);
  });

  milestoneModal.addEventListener('click', (event) => {
    if (event.target === milestoneModal) {
      milestoneModal.classList.add('hidden');
      if (milestoneModalTimer) clearTimeout(milestoneModalTimer);
    }
  });
}

// --- DYNAMIC MOOD BUTTONS ---
function initMoodSelector() {
  const container = document.getElementById('mood-buttons-container');
  container.innerHTML = '';
  
  const currentMood = parseInt(moodInput.value) || 5;
  
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `mood-btn ${i === currentMood ? 'active' : ''}`;
    btn.dataset.value = i;
    btn.textContent = i;
    
    // Inject dynamic colors into CSS variables for hover effects
    btn.style.setProperty('--mood-color', MOOD_DATA[i].color);
    
    btn.addEventListener('click', () => {
      moodInput.value = i;
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateMoodFeedback(i);
      
      // AI Agent Trigger: Trigger automatically only if mood goes below 5 (i.e., 1-4)
      if (i < 5) {
        triggerAIAgent(i);
      }
    });
    
    container.appendChild(btn);
  }
  updateMoodFeedback(currentMood);
}

function updateMoodFeedback(moodVal) {
  const data = MOOD_DATA[moodVal];
  moodEmojiDisplay.textContent = data.emoji;
  moodValDisplay.textContent = moodVal;
  moodLabelDisplay.textContent = data.label;
  
  // Style feedback text color dynamically
  const feedback = document.querySelector('.mood-feedback');
  feedback.style.color = data.color;
}

function buildCloudinaryPromptTransformation(prompt) {
  const text = (prompt || '').toLowerCase();
  const transforms = [];
  let summary = 'Your photo was polished through Cloudinary.';

  if (/bright|lighter|sunny|warm/i.test(text)) {
    transforms.push('e_brightness:20');
    summary = 'The image was brightened through Cloudinary.';
  } else if (/dim|dark|shadow|moody/i.test(text)) {
    transforms.push('e_brightness:-20');
    summary = 'The image was softened and dimmed through Cloudinary.';
  }

  if (/saturate|vibrant|color|rich/i.test(text)) {
    transforms.push('e_saturation:30');
    summary = 'The colors were saturated through Cloudinary.';
  }

  if (/compress|smaller|lighter|tiny|small/i.test(text)) {
    transforms.push('q_70');
    summary = 'The image was compressed through Cloudinary for a lighter file.';
  }

  if (/soft|blur|gentle/i.test(text)) {
    transforms.push('e_blur:80');
  }

  if (transforms.length === 0) {
    transforms.push('e_brightness:10', 'e_saturation:10');
  }

  return { transformation: transforms.join('/'), summary };
}

function buildCloudinaryTransformationUrl(sourceUrl, transformation) {
  if (!sourceUrl) return DEFAULT_MEDIA_IMAGE;
  if (sourceUrl.includes('/upload/')) {
    return sourceUrl.replace('/upload/', `/upload/${transformation}/`);
  }
  return sourceUrl;
}

// --- IMAGE PREVIEW & COMPRESSION ---
function setCloudinaryAssistantContext(context) {
  cloudinaryAssistantContext = context;
}

function clearCloudinaryAssistantContext() {
  cloudinaryAssistantContext = null;
}

function getCloudinaryAssistantContext() {
  if (cloudinaryAssistantContext) {
    return cloudinaryAssistantContext;
  }

  const imagePreview = document.getElementById('image-preview');
  return {
    sourceFile: imageInput.files[0],
    sourceBase64: currentImageBase64,
    previewElement: imagePreview,
    onAccept: (url) => {
      editedImageUrl = url;
      if (imagePreview) imagePreview.src = editedImageUrl;
    },
    onReject: () => {
      pendingEditedImageUrl = "";
      editedImageUrl = "";
      if (imagePreview) imagePreview.src = currentImageBase64 || '';
    }
  };
}

function initImageUpload() {
  const previewWrapper = document.getElementById('preview-wrapper');
  const imagePreview = document.getElementById('image-preview');
  const btnClearImage = document.getElementById('btn-clear-image');

  imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      fileChosenDisplay.textContent = file.name;

      // Render local preview
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const previewUrl = loadEvent.target.result;
        imagePreview.src = previewUrl;
        previewWrapper.classList.remove('hidden');
      };
      reader.readAsDataURL(file);

      // Compress and store Base64 string for local fallback
      currentImageBase64 = await compressImage(file);
      editedImageUrl = "";
      pendingEditedImageUrl = "";

      setCloudinaryAssistantContext({
        sourceFile: file,
        sourceBase64: currentImageBase64,
        previewElement: imagePreview,
        onAccept: (url) => {
          editedImageUrl = url;
          imagePreview.src = editedImageUrl;
        },
        onReject: () => {
          pendingEditedImageUrl = "";
          editedImageUrl = "";
          imagePreview.src = currentImageBase64 || '';
        }
      });

      // Open the AI transform popup as the next step
      window.openCloudinaryAIModal?.();
    } else {
      clearPreview();
    }
  });

  btnClearImage.addEventListener('click', clearPreview);

  function clearPreview() {
    imageInput.value = "";
    imagePreview.src = "";
    previewWrapper.classList.add('hidden');
    fileChosenDisplay.textContent = "No file chosen";
    currentImageBase64 = "";
    editedImageUrl = "";
  }
}

// Client-side canvas compression (scales long edge to 500px, 0.7 quality)
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(null);
    };
    reader.onerror = () => resolve(null);
  });
}

function getCanvasFilterFromPrompt(prompt) {
  const text = (prompt || '').toLowerCase();
  const filters = [];

  if (/soft|dreamy|gentle|hazy/i.test(text)) {
    filters.push('brightness(1.08)', 'contrast(0.95)', 'saturate(1.1)', 'blur(3px)');
  }
  if (/dark|moody|shadow|dim|night|low light/i.test(text)) {
    filters.push('brightness(0.8)', 'contrast(0.9)', 'saturate(0.85)');
  }
  if (/bright|lighter|sunny|warm/i.test(text)) {
    filters.push('brightness(1.2)', 'contrast(1.05)', 'saturate(1.2)');
  }
  if (/black\s*&\s*white|black\s*and\s*white|grayscale|monochrome|b&w/i.test(text)) {
    filters.push('grayscale(100%)');
  }
  if (/sepia|vintage|retro|old photo|nostalgic/i.test(text)) {
    filters.push('sepia(40%)', 'contrast(1.05)', 'saturate(0.85)');
  }
  if (/sharp|crisp|clear|enhance clarity|define/i.test(text)) {
    filters.push('contrast(1.15)', 'saturate(1.1)', 'brightness(1.05)');
  }
  if (/warm|golden|cozy/i.test(text)) {
    filters.push('brightness(1.12)', 'saturate(1.18)', 'contrast(1.05)');
  }
  if (/cool|cold|icy|blue/i.test(text)) {
    filters.push('brightness(0.92)', 'saturate(0.88)', 'contrast(0.95)');
  }
  if (filters.length === 0) {
    filters.push('brightness(1.05)', 'saturate(1.05)');
  }

  return filters.join(' ');
}

function applyLocalImageTransform(sourceDataUrl, prompt) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceDataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      const filter = getCanvasFilterFromPrompt(prompt);
      if (ctx) {
        ctx.filter = filter;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(sourceDataUrl);
  });
}

// --- CLOUDINARY UPLOAD PIPELINE ---
async function uploadToCloudinary(file) {
  const cloudName = cloudinaryConfig.cloudName?.trim();
  const uploadPreset = cloudinaryConfig.uploadPreset?.trim();

  if (!cloudName || !uploadPreset || !file) {
    console.warn("Cloudinary configuration missing or no file provided.");
    return null;
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Response code: ${response.status}`);
    }

    const data = await response.json();
    if (!data.secure_url || !data.public_id) throw new Error("No upload response from Cloudinary");

    const optimizedUrl = data.secure_url.replace(
      '/upload/',
      '/upload/w_500,h_500,c_fill,g_auto/f_auto,q_auto/'
    );
    return {
      secureUrl: optimizedUrl,
      publicId: data.public_id,
      originalUrl: data.secure_url
    };
  } catch (error) {
    console.error("Cloudinary upload failed, using local fallback:", error);
    return null;
  }
}

// --- COLLAPSIBLE SETTINGS & CONFIG ---
function initSettings() {
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsCard = document.getElementById('settings-card');
  const cloudNameInput = document.getElementById('dmvuzwlxs');
  const uploadPresetInput = document.getElementById('eirene');
  const saveBtn = document.getElementById('save-settings-btn');
  const statusDiv = document.getElementById('settings-status');

  // Prefill fields
  cloudNameInput.value = "dmvuzwlxs";
    uploadPresetInput.value = "eirene";
  updateSettingsStatus();

  settingsToggle.addEventListener('click', () => {
    settingsCard.classList.toggle('expanded');
  });

  saveBtn.addEventListener('click', () => {
    cloudinaryConfig.cloudName = cloudNameInput.value.trim();
    cloudinaryConfig.uploadPreset = uploadPresetInput.value.trim();
    
    localStorage.setItem('eirene_cloudinary', JSON.stringify(cloudinaryConfig));
    updateSettingsStatus();
    
    statusDiv.style.color = "#81b29a"; // Sage Green
    statusDiv.textContent = "✓ Credentials Saved!";
    setTimeout(updateSettingsStatus, 3000);
  });
  
  function updateSettingsStatus() {
    if (cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset) {
      statusDiv.textContent = `Active Cloud: ${cloudinaryConfig.cloudName}`;
      statusDiv.style.color = "var(--text-muted)";
    } else {
      statusDiv.textContent = "Using local storage sandbox fallback.";
      statusDiv.style.color = "#e07a5f"; // Terracotta
    }
  }
}

// --- TIMELINE CONTROLS & RENDER ---
function getMoodClass(mood) {
  if (mood <= 4) return 'mood-low';
  if (mood <= 7) return 'mood-mid';
  return 'mood-high';
}

function updateInsights() {
  if (recoveryEntries.length === 0) {
    moodImprovementDisplay.textContent = "0%";
    totalMilestonesDisplay.textContent = "0";
    return;
  }

  totalMilestonesDisplay.textContent = recoveryEntries.length;

  const weekOrder = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 6", "Week 8"];
  const sorted = [...recoveryEntries].sort((a, b) => weekOrder.indexOf(a.week) - weekOrder.indexOf(b.week));

  const earliestMood = sorted[0].mood;
  const latestMood = sorted[sorted.length - 1].mood;
  
  const rawImprovement = earliestMood > 0 ? ((latestMood - earliestMood) / earliestMood) * 100 : 0;
  const signedImprovement = rawImprovement >= 0 ? `+${Math.round(rawImprovement)}%` : `${Math.round(rawImprovement)}%`;
  
  moodImprovementDisplay.textContent = signedImprovement;
  
  // Color code progress indicator based on positive trend
  if (rawImprovement > 0) {
    moodImprovementDisplay.style.color = "var(--mood-high)";
  } else if (rawImprovement < 0) {
    moodImprovementDisplay.style.color = "var(--mood-low)";
  } else {
    moodImprovementDisplay.style.color = "var(--text-muted)";
  }
}

function renderTimeline() {
  timelineTrack.innerHTML = '';
  const weekOrder = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 6", "Week 8"];

  // Filter entries
  let filtered = [...recoveryEntries];
  if (currentFilter === 'low') {
    filtered = filtered.filter(e => e.mood <= 4);
  } else if (currentFilter === 'mid') {
    filtered = filtered.filter(e => e.mood >= 5 && e.mood <= 7);
  } else if (currentFilter === 'high') {
    filtered = filtered.filter(e => e.mood >= 8);
  }

  // Sort entries
  filtered.sort((a, b) => {
    const diff = weekOrder.indexOf(a.week) - weekOrder.indexOf(b.week);
    return currentSort === 'asc' ? diff : -diff;
  });

  if (filtered.length === 0) {
    timelineTrack.innerHTML = `
      <div class="empty-timeline-state">
        <i class="fa-regular fa-folder-open"></i>
        <p>No entries found for this filter. Tap "Log a New Milestone" to fill your timeline.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'timeline-card entry-fade-in';
    
    card.innerHTML = `
      <div class="card-badge">${entry.week}</div>
      <div class="card-actions">  
        <button class="btn-card-action btn-edit" onclick="editEntry(${entry.id})" title="Edit entry">
          <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="btn-card-action btn-delete" onclick="deleteEntry(${entry.id})" title="Delete entry">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
      <div class="card-image-wrapper">
        <img src="${entry.imageUrl}" alt="${entry.week} memory" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=500';" loading="lazy">
      </div>
      <div class="card-content">
        <div class="card-mood">
          <span class="mood-dot ${getMoodClass(entry.mood)}"></span>
          <span>Mood: <strong>${entry.mood}/10</strong> (${MOOD_DATA[entry.mood].label})</span>
        </div>
        <p class="card-text">"${entry.journal}"</p>
      </div>
    `;
    
    timelineTrack.appendChild(card);
  });

  localStorage.setItem('eirene_entries', JSON.stringify(recoveryEntries));
  updateInsights();
  renderChart();
}

// --- DYNAMIC SVG CHART ---
function renderChart() {
  const chartPath = document.getElementById('chart-path');
  const chartArea = document.getElementById('chart-area');
  const chartPoints = document.getElementById('chart-points');
  const chartEmpty = document.getElementById('chart-empty');

  // Chronological sort for the progress graph
  const weekOrder = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 6", "Week 8"];
  const sorted = [...recoveryEntries].sort((a, b) => weekOrder.indexOf(a.week) - weekOrder.indexOf(b.week));

  if (sorted.length < 2) {
    chartPath.setAttribute('d', '');
    chartArea.setAttribute('d', '');
    chartPoints.innerHTML = '';
    chartEmpty.classList.remove('hidden');
    return;
  }

  chartEmpty.classList.add('hidden');

  const width = 300;
  const height = 120;
  const paddingX = 25;
  const paddingY = 20;
  
  const stepX = (width - paddingX * 2) / (sorted.length - 1);

  let pathD = '';
  let areaD = `M ${paddingX} ${height - paddingY} `;
  chartPoints.innerHTML = '';

  sorted.forEach((entry, index) => {
    const x = paddingX + index * stepX;
    // Map mood (1-10) to y-axis bounds
    const y = paddingY + (height - paddingY * 2) * (1 - (entry.mood - 1) / 9);

    if (index === 0) {
      pathD = `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
    areaD += `L ${x} ${y} `;

    // Build interactive SVG point
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 5);
    circle.setAttribute('class', `chart-point ${getMoodClass(entry.mood)}`);
    
    const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    tooltip.textContent = `${entry.week}: Mood ${entry.mood}/10`;
    circle.appendChild(tooltip);
    
    chartPoints.appendChild(circle);
  });

  areaD += `L ${paddingX + (sorted.length - 1) * stepX} ${height - paddingY} Z`;

  chartPath.setAttribute('d', pathD);
  chartArea.setAttribute('d', areaD);
}

// --- FILTERS & SORT INITIALIZATION ---
function initControls() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      const activeBtn = e.currentTarget;
      activeBtn.classList.add('active');
      
      currentFilter = activeBtn.dataset.filter;
      renderTimeline();
    });
  });

  const sortBtn = document.getElementById('sort-btn');
  sortBtn.addEventListener('click', () => {
    currentSort = currentSort === 'asc' ? 'desc' : 'asc';
    
    const label = sortBtn.querySelector('span');
    const icon = sortBtn.querySelector('i');
    if (currentSort === 'asc') {
      label.textContent = "Oldest First";
      icon.className = "fa-solid fa-arrow-down-short-wide";
    } else {
      label.textContent = "Newest First";
      icon.className = "fa-solid fa-arrow-up-wide-short";
    }
    renderTimeline();
  });

}

// --- FORM HANDLING & EDIT ACTIONS ---
async function handleFormSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('edit-id').value;
  const selectedWeek = document.getElementById('week-select').value;
  const chosenMood = parseInt(moodInput.value) || 5;
  const journalText = document.getElementById('journal-input').value;
  const file = imageInput.files[0];
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

  // Check if journal entry is asking for a diet/health plan
  const isDietPlanRequest = /give me a plan to improve my diet or health|diet|health plan/i.test(journalText);

  // Default placeholder image
  let imageUrl = editedImageUrl || currentImageBase64 || DEFAULT_MEDIA_IMAGE;

  if (isDietPlanRequest) {
    const cloudName = "dmvuzwlxs";
    const encodedBaseUrl = encodeURIComponent("https://images.unsplash.com/photo-1577906096429-f73c2c312435?q=80&w=600");
    imageUrl = `https://res.cloudinary.com/${cloudName}/image/fetch/e_gen_replace:from_plate;to_delicious_healthy_superfood_salad_for_postpartum_recovery/${encodedBaseUrl}`;
  } else if (file && !editedImageUrl) {
    submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Saving Photo...';
    const cloudinaryResult = await uploadToCloudinary(file);
    if (cloudinaryResult) {
      imageUrl = cloudinaryResult.secureUrl || cloudinaryResult.originalUrl || imageUrl;
    } else if (currentImageBase64) {
      imageUrl = currentImageBase64;
    }
  }

  const newEntry = {
    id: editId ? parseInt(editId) : Date.now(),
    week: selectedWeek,
    imageUrl: imageUrl,
    mood: chosenMood,
    journal: journalText
  };
  const isNewEntry = !editId;

  if (editId) {
    const existingIndex = recoveryEntries.findIndex(item => item.id === parseInt(editId));
    if (existingIndex !== -1) {
      recoveryEntries[existingIndex] = newEntry;
    }
  } else {
    // Overwrite double entry for same week
    const existingIndex = recoveryEntries.findIndex(item => item.week === selectedWeek);
    if (existingIndex !== -1) {
      if (confirm(`You already have a milestone logged for ${selectedWeek}. Do you want to update it?`)) {
        recoveryEntries[existingIndex] = newEntry;
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = "Add to Timeline";
        return;
      }
    } else {
      recoveryEntries.push(newEntry);
    }
  }

  // Save changes
  localStorage.setItem('eirene_entries', JSON.stringify(recoveryEntries));
  cancelEdit(); // Reset form states
  renderTimeline();

  if (isNewEntry) {
    journalEntryProgressCount += 1;
    localStorage.setItem('eirene_journal_entry_count', String(journalEntryProgressCount));

    const hasPhotoAttachment = Boolean(file || editedImageUrl || currentImageBase64);
    const weekNumber = Number((selectedWeek || '').replace(/\D/g, '')) || 1;

    if (hasPhotoAttachment) {
      const photoCount = incrementPhotoUploadCount();
      unlockMilestones('photo-count', { count: photoCount });
    }

    unlockMilestones('journal-entry');
    unlockMilestones('journal-count', { count: journalEntryProgressCount });
    unlockMilestones('mood-recorded');
    unlockMilestones('week-reached', { week: weekNumber });

    const streak = updateMoodStreak();
    unlockMilestones('mood-streak', { streak });
  }

  if (chosenMood < 5) {
    triggerAIAgent(chosenMood);
  }
}

function editEntry(id) {
  const entry = recoveryEntries.find(e => e.id === id);
  if (!entry) return;

  document.getElementById('edit-id').value = entry.id;
  document.getElementById('week-select').value = entry.week;
  
  // Set mood value & update selector buttons
  moodInput.value = entry.mood;
  document.querySelectorAll('.mood-btn').forEach(btn => {
    if (parseInt(btn.dataset.value) === entry.mood) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  updateMoodFeedback(entry.mood);

  // Set journal note
  document.getElementById('journal-input').value = entry.journal;

  // Render image preview
  const previewWrapper = document.getElementById('preview-wrapper');
  const imagePreview = document.getElementById('image-preview');
  
  if (entry.imageUrl) {
    imagePreview.src = entry.imageUrl;
    previewWrapper.classList.remove('hidden');
    fileChosenDisplay.textContent = "Existing photo kept";
    currentImageBase64 = entry.imageUrl; 
  } else {
    previewWrapper.classList.add('hidden');
    fileChosenDisplay.textContent = "No file chosen";
    currentImageBase64 = "";
  }

  // Swap to Edit UI
  submitBtn.textContent = "Update Milestone";
  cancelEditBtn.classList.remove('hidden');
  
  // Scroll to form smoothly
  document.querySelector('.control-panel').scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
  document.getElementById('edit-id').value = "";
  memoryForm.reset();
  
  // Reset Mood Selector to default 5
  moodInput.value = "5";
  document.querySelectorAll('.mood-btn').forEach(btn => {
    if (parseInt(btn.dataset.value) === 5) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  updateMoodFeedback(5);
  
  // Clear image previews
  document.getElementById('preview-wrapper').classList.add('hidden');
  document.getElementById('image-preview').src = "";
  fileChosenDisplay.textContent = "No file chosen";
  currentImageBase64 = "";
  editedImageUrl = "";

  // Reset Submit action
  submitBtn.disabled = false;
  submitBtn.textContent = "Add to Timeline";
  cancelEditBtn.classList.add('hidden');
}

function deleteEntry(id) {
  if (confirm("Are you sure you want to delete this milestone entry?")) {
    recoveryEntries = recoveryEntries.filter(e => e.id !== id);
    localStorage.setItem('eirene_entries', JSON.stringify(recoveryEntries));
    journalEntryProgressCount = Math.max(0, journalEntryProgressCount - 1);
    localStorage.setItem('eirene_journal_entry_count', String(journalEntryProgressCount));
    renderTimeline();
    unlockMilestones('journal-count', { count: journalEntryProgressCount });
  }
}

// --- AI MOOD AGENT DIALOGUE PIPELINE ---

let aiGreetingCount = 0;

function triggerAIAgent(mood) {
  // Reveal the floating heart trigger permanently since a low mood was detected
  aiFloatingTrigger.classList.remove('hidden');
  
  // Open the drawer
  aiDrawer.classList.add('open');
  
  // Initialize AI dialogue history
  aiMessages.innerHTML = '';
  
  const text = `Hi there 🌸 I noticed your mood is at **${mood}/10**. 

I'm here to support you. Ask me for a breathing exercise to get started.`;
  
  appendAgentMessage(text);
}

function appendUserMessage(text) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.textContent = text;
  aiMessages.appendChild(bubble);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function appendAgentMessage(text) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble agent';
  
  // Basic markdown-like parser for formatting rules
  const formatted = text
    .replace(/\n/g, '<br>')
    .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
    .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    
  bubble.innerHTML = formatted;
  aiMessages.appendChild(bubble);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function scrollToBottom() {
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function appendBreathingExercise() {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble agent';
  
  bubble.innerHTML = `
    <div class="breathing-exercise-container">
      <div class="breathing-circle" id="breathing-circle">Inhale...</div>
      <p class="breathing-label" id="breathing-timer">Breathe in calm energy</p>
    </div>
  `;
  aiMessages.appendChild(bubble);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  
  // 16-second box breathing interval (matches CSS keyframes animation)
  let breathCount = 1;
  const breathTexts = ["Inhale...", "Hold...", "Exhale...", "Hold..."];
  const breathSub = [
    "Breathe in calming energy",
    "Hold and absorb the stillness",
    "Release tension and heavy thoughts",
    "Rest in this present moment"
  ];
  
  const breathInterval = setInterval(() => {
    const circle = document.getElementById('breathing-circle');
    const label = document.getElementById('breathing-timer');
    if (!circle) {
      clearInterval(breathInterval);
      return;
    }
    circle.textContent = breathTexts[breathCount % 4];
    label.textContent = breathSub[breathCount % 4];
    breathCount++;
  }, 4000);
}

function handleChatMessage(text) {
  if (!text.trim()) return;
  appendUserMessage(text);
  unlockMilestones('ai-assistant-used');
  
  const query = text.toLowerCase().trim();
  
  // Render typing bubble
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'chat-bubble agent typing-indicator';
  typingIndicator.innerHTML = '<i class="fa-solid fa-ellipsis fa-bounce"></i>';
  aiMessages.appendChild(typingIndicator);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  
  setTimeout(() => {
    typingIndicator.remove();
    
    // Diet & Health Plan request (matching prompt requirements)
    if (/give me a plan to improve my diet or health|diet|health plan/i.test(query)) {
      appendAgentMessage(
        `Here is a nourishing postpartum recovery plan to help improve your health and energy:

1. **Hydration**: Drink 2-3 liters of mineralized water daily.
2. **Warm, Nutrient-Dense Meals**: Focus on slow-cooked stews, stocks, and warm porridges.
3. **Recovery Superfoods**: Incorporate healthy fats like avocado, eggs, and wild salmon.
4. **Gentle Movement**: Prioritize pelvic floor breathing and brief, easy walks.`
      );
    }
    // Cloudinary queries matching latest documentation research
    else if (/cloudinary|upload|fail|credential|unsigned|preset/i.test(query)) {
      appendAgentMessage(
        `Here are the simple steps to set up Cloudinary uploads:

1. **Sign Up**: Register for a free account at Cloudinary.com.
2. **Copy Cloud Name**: Copy your **Cloud Name** from your dashboard.
3. **Add Upload Preset**: In console *Settings (gear icon) > Upload*, scroll to *Upload presets*, click *Add upload preset*, set its name, change Signing Mode to **Unsigned**, and click *Save*.
4. **Save in Eirene**: Paste both names in the Eirene *Cloudinary Credentials* form in the sidebar and save!`
      );
    }
    // Breathing exercise request
    else if (/breathe|breathing|relax|anxiety|stress/i.test(query)) {
      appendAgentMessage(`Let's take a moment for box breathing. Follow the rhythm of the pulsing circle below:`);
      appendBreathingExercise();
    }
    // General queries
    else {
      const replies = [
        "I hear you. Postpartum recovery takes time. Be proud of taking it one day at a time.",
        "Your health is a priority. Remember that resting is productive. You do not have to do it all.",
        "Your feelings are valid. Would you like to try a short breathing exercise to help center yourself?",
        "I'm here to support you. Let me know if you want tips on nutrition, how to fix your Cloudinary upload, or just a breathing break."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      appendAgentMessage(randomReply);
    }
  }, 1200);
}

// --- INITIALIZE APPLICATION & BINDINGS ---

// Expose actions to window for index.html inline click events
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;

document.addEventListener('DOMContentLoaded', () => {
  initAffirmationCard();
  initMoodSelector();
  initImageUpload();
  initSettings();
  initControls();
  initMilestonesSection();
  syncRecoveryMilestonesWithHistory();
  renderTimeline(); // Calls renderChart and updateInsights implicitly

  memoryForm.addEventListener('submit', handleFormSubmit);
  cancelEditBtn.addEventListener('click', cancelEdit);
  
  // AI Agent Drawer Toggles
  aiFloatingTrigger.addEventListener('click', () => {
    aiDrawer.classList.toggle('open');
  });
  
  btnCloseDrawer.addEventListener('click', () => {
    aiDrawer.classList.remove('open');
  });
  
  aiInputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = aiChatInput.value;
    handleChatMessage(text);
    aiChatInput.value = '';
  });
  
  // Quick Replies Click Listeners
  quickReplyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const replyText = e.currentTarget.dataset.reply;
      handleChatMessage(replyText);
    });
  });

  // Initialize Cloudinary AI Transformation Assistant
  initCloudinaryAIAssistant();
});

// ═══════════════════════════════════════════════════════════════
// CLOUDINARY AI TRANSFORMATION ASSISTANT
// Uses cloudinary-transformations skill rules to convert natural
// language to valid Cloudinary transformation URL strings.
// ═══════════════════════════════════════════════════════════════

/**
 * Parse a natural-language prompt and return a structured
 * Cloudinary transformation object following the skill's rules:
 *  - Commas separate parameters WITHIN a component
 *  - Slashes separate components BETWEEN transformations
 *  - f_auto and q_auto added as final components (best practice)
 *  - Only one action parameter per component
 *  - Correct gravity compatibility (g_auto only with c_fill/c_thumb/c_crop/c_auto)
 *  - Background as qualifier with pad crop: b_color,c_pad not /b_color/
 *
 * Returns: { components: string[], tags: string[], summary: string, cost: string|null }
 */
function parseNaturalLanguageTransformation(prompt) {
  const text = prompt.toLowerCase();
  const components = [];
  const tags = [];
  let summary = '';
  let cost = null;

  // ── Resize / Crop ────────────────────────────────────────────
  const squareMatch = text.match(/(\d+)\s*[x×]\s*(\d+)/);
  const widthMatch  = text.match(/width[^\d]*(\d+)|(\d+)\s*px\s*wide|resize.*?(\d+)/);
  const heightMatch = text.match(/height[^\d]*(\d+)|(\d+)\s*px\s*tall/);

  if (/square\s*thumb|thumbnail/i.test(text) || (squareMatch && squareMatch[1] === squareMatch[2])) {
    const size = squareMatch ? squareMatch[1] : '400';
    // c_fill with g_auto for smart crop (skill rule: g_auto works with c_fill)
    components.push(`c_fill,g_auto,w_${size},h_${size}`);
    tags.push({ icon: 'fa-crop', label: `Square crop ${size}×${size}px` });
    summary += `Resized to a ${size}×${size}px square thumbnail with smart-crop gravity. `;
  } else if (squareMatch) {
    const w = squareMatch[1], h = squareMatch[2];
    // Use c_fill for both dimensions (skill rule: avoid both dims with c_scale)
    components.push(`c_fill,g_auto,w_${w},h_${h}`);
    tags.push({ icon: 'fa-crop', label: `Crop ${w}×${h}px` });
    summary += `Resized to ${w}×${h}px using smart fill-crop. `;
  } else if (widthMatch) {
    const w = widthMatch[1] || widthMatch[2] || widthMatch[3] || '800';
    // c_scale with single dimension to maintain aspect ratio
    components.push(`c_scale,w_${w}`);
    tags.push({ icon: 'fa-arrows-left-right', label: `Width ${w}px` });
    summary += `Scaled to ${w}px wide (aspect ratio preserved). `;
  } else if (heightMatch) {
    const h = heightMatch[1] || heightMatch[2] || '600';
    components.push(`c_scale,h_${h}`);
    tags.push({ icon: 'fa-arrows-up-down', label: `Height ${h}px` });
    summary += `Scaled to ${h}px tall (aspect ratio preserved). `;
  } else if (/resize|smaller|larger|scale/i.test(text) && !/thumbnail/i.test(text)) {
    // Default sensible resize
    components.push('c_scale,w_800');
    tags.push({ icon: 'fa-arrows-left-right', label: 'Scale to 800px wide' });
    summary += 'Scaled to 800px wide (aspect ratio preserved). ';
  }

  // ── Portrait / Face crop ─────────────────────────────────────
  if (/face|portrait|person|selfie|headshot/i.test(text)) {
    // c_thumb with g_face for face-centred crop (skill rule)
    const existing = components.findIndex(c => c.startsWith('c_'));
    if (existing >= 0) {
      components[existing] = components[existing]
        .replace('g_auto', 'g_face')
        .replace('c_fill', 'c_thumb')
        .replace('c_scale', 'c_thumb,w_400,h_500');
    } else {
      components.push('c_thumb,g_face,w_400,h_500');
    }
    tags.push({ icon: 'fa-user', label: 'Face-centred crop' });
    summary += 'Cropped around detected face. ';
  }

  // ── Brightness ───────────────────────────────────────────────
  if (/bright|lighter|sunni|sunny|warm(?!er\s*pic)/i.test(text) && !/dark/i.test(text)) {
    const level = /very\s*bright|extra\s*bright/i.test(text) ? 40 : 25;
    components.push(`e_brightness:${level}`);
    tags.push({ icon: 'fa-sun', label: `Brightness +${level}` });
    summary += `Increased brightness by ${level}. `;
  } else if (/dimm|dark(?!en)|shadow|moody|lower\s*bright/i.test(text)) {
    const level = /very\s*dark|extra\s*dark/i.test(text) ? -40 : -25;
    components.push(`e_brightness:${level}`);
    tags.push({ icon: 'fa-moon', label: `Brightness ${level}` });
    summary += `Reduced brightness by ${Math.abs(level)} for a moodier look. `;
  }

  // ── Warmth / Cool ────────────────────────────────────────────
  if (/warmer|warm\s*tone|golden|cozy/i.test(text)) {
    components.push('e_vibrance:20');
    components.push('co_rgb:c67b3a,e_colorize:15');
    tags.push({ icon: 'fa-fire', label: 'Warm tones +golden tint' });
    summary += 'Applied warm golden tones. ';
  } else if (/cool|cold|icy|blue\s*tone/i.test(text)) {
    components.push('co_rgb:4a7ab5,e_colorize:15');
    tags.push({ icon: 'fa-snowflake', label: 'Cool blue tones' });
    summary += 'Applied cool blue tones. ';
  }

  // ── Saturation ───────────────────────────────────────────────
  if (/saturate|vibrant|rich\s*color|colorful/i.test(text)) {
    const level = /very|extra|pop/i.test(text) ? 60 : 35;
    components.push(`e_saturation:${level}`);
    tags.push({ icon: 'fa-palette', label: `Saturation +${level}` });
    summary += `Boosted color saturation by ${level}. `;
  } else if (/desatur|muted\s*color|pastel/i.test(text)) {
    components.push('e_saturation:-30');
    tags.push({ icon: 'fa-palette', label: 'Desaturated' });
    summary += 'Desaturated colors for a muted, pastel feel. ';
  }

  // ── Blur / Soft ───────────────────────────────────────────────
  if (/blur|soft|dreamy|gentle|hazy/i.test(text) && !/sharp/i.test(text)) {
    const level = /very\s*soft|very\s*blur|heavy|strong/i.test(text) ? 600 : 250;
    components.push(`e_blur:${level}`);
    tags.push({ icon: 'fa-droplet', label: `Blur :${level}` });
    summary += `Applied soft blur (${level}) for a dreamy effect. `;
  }

  // ── Sharpen ──────────────────────────────────────────────────
  if (/sharp|crisp|clear|enhance\s*clarity|define/i.test(text)) {
    components.push('e_sharpen');
    tags.push({ icon: 'fa-star', label: 'Sharpened' });
    summary += 'Enhanced image sharpness and clarity. ';
  }

  // ── Grayscale / Black & White ─────────────────────────────────
  if (/black\s*&\s*white|black\s*and\s*white|grayscale|monochrome|b&w/i.test(text)) {
    components.push('e_grayscale');
    tags.push({ icon: 'fa-circle-half-stroke', label: 'Grayscale' });
    summary += 'Converted to black & white. ';
  }

  // ── Sepia / Vintage ───────────────────────────────────────────
  if (/sepia|vintage|retro|old\s*photo|nostalgic/i.test(text)) {
    components.push('e_sepia');
    tags.push({ icon: 'fa-camera-retro', label: 'Sepia vintage' });
    summary += 'Applied warm sepia vintage tone. ';
  }

  // ── Rounded Corners ──────────────────────────────────────────
  if (/round(?:ed)?\s*corner|soft\s*edge|circle/i.test(text)) {
    const radiusMatch = text.match(/(\d+)\s*px/);
    const radius = /circle|oval/i.test(text) ? 'max' : (radiusMatch ? radiusMatch[1] : '20');
    components.push(`r_${radius}`);
    tags.push({ icon: 'fa-square', label: `Rounded r_${radius}` });
    summary += `Added ${radius === 'max' ? 'circular' : radius + 'px'} rounded corners. `;
  }

  // ── Border ───────────────────────────────────────────────────
  if (/border|frame/i.test(text)) {
    const colorMatch = text.match(/(?:border|frame).*?(white|black|grey|gray|gold)/i);
    const color = colorMatch ? colorMatch[1].toLowerCase().replace('grey','gray') : 'rgb:c99665';
    components.push(`bo_4px_solid_${color}`);
    tags.push({ icon: 'fa-border-all', label: `Border (${color})` });
    summary += `Added a 4px ${color} border. `;
  }

  // ── Dark Mode Overlay ─────────────────────────────────────────
  if (/dark\s*mode|dark\s*filter|dark\s*tint|dim\s*overlay/i.test(text)) {
    // Semi-transparent dark overlay using layer pattern (skill rules)
    components.push('l_docs:one_black_pixel');
    components.push('c_scale,fl_relative,h_1.0,w_1.0');
    components.push('o_55,fl_layer_apply');
    tags.push({ icon: 'fa-moon', label: 'Dark mode overlay' });
    summary += 'Applied dark mode overlay (55% opacity). ';
  }

  // ── Auto Enhance ─────────────────────────────────────────────
  if (/enhance|improve\s*quality|fix\s*lighting|auto[\s-]?correct/i.test(text)) {
    components.push('e_auto_enhance');
    cost = '⚡ Note: e_auto_enhance uses ~100 transformation credits (AI operation).';
    tags.push({ icon: 'fa-wand-sparkles', label: 'AI Auto-enhance (100tx)' });
    summary += 'Applied AI-powered automatic quality enhancement. ';
  }

  // ── Background Removal ────────────────────────────────────────
  if (/remove\s*(?:the\s*)?background|bg\s*removal|transparent\s*background|cut\s*out/i.test(text)) {
    components.push('e_background_removal');
    // After BG removal use f_png (not f_auto) to preserve transparency
    const urlEnding = 'f_png/q_auto';
    tags.push({ icon: 'fa-scissors', label: 'BG removal (75tx)' });
    summary += 'Removed background — using PNG format to preserve transparency. ';
    cost = '⚡ Note: e_background_removal uses ~75 transformation credits (AI operation).';
    // Return early with custom ending to avoid double f_auto
    return {
      components,
      tags,
      summary: summary.trim() || 'Background removed with transparency preserved.',
      cost,
      urlEnding
    };
  }

  // ── Upscale ───────────────────────────────────────────────────
  if (/upscale|enlarge|high.?res|super.?res/i.test(text)) {
    components.push('e_upscale');
    cost = '⚡ Note: e_upscale uses 10–100 transformation credits depending on output size (AI operation).';
    tags.push({ icon: 'fa-magnifying-glass-plus', label: 'AI Upscale (10-100tx)' });
    summary += 'Applied AI-powered upscaling for higher resolution output. ';
  }

  // ── Generative Background Replace ────────────────────────────
  const bgReplaceMatch = text.match(/(?:replace|change|new|swap)\s*(?:the\s*)?background.*?(?:with|to)\s+(.+)/i);
  if (bgReplaceMatch || /gen(?:erative)?\s*background|ai\s*background/i.test(text)) {
    const bgDesc = bgReplaceMatch
      ? bgReplaceMatch[1].trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '')
      : 'serene_nature_landscape';
    components.push(`e_gen_background_replace:prompt_${bgDesc}`);
    cost = '⚡ Note: e_gen_background_replace uses ~230 transformation credits (high-cost AI operation).';
    tags.push({ icon: 'fa-image', label: 'AI BG Replace (230tx)' });
    summary += `Replaced background using AI generative fill (${bgDesc.replace(/_/g,' ')}). `;
  }

  // ── Generative Remove ─────────────────────────────────────────
  const genRemoveMatch = text.match(/(?:remove|erase|delete)\s+(?:the\s+)?([a-z\s]+?)(?:\s+from|$)/i);
  if (genRemoveMatch && !/background/i.test(genRemoveMatch[1])) {
    const obj = genRemoveMatch[1].trim().replace(/\s+/g, '_');
    components.push(`e_gen_remove:prompt_${obj}`);
    cost = '⚡ Note: e_gen_remove uses ~50 transformation credits (AI operation).';
    tags.push({ icon: 'fa-eraser', label: `AI Remove "${obj}" (50tx)` });
    summary += `Removed "${obj.replace(/_/g,' ')}" from the image using AI. `;
  }

  // ── Compression / Quality ─────────────────────────────────────
  if (/compress|smaller\s*file|reduce\s*size|lightweight|tiny\s*file/i.test(text)) {
    const q = /very\s*small|highly\s*compress/i.test(text) ? 50 : 70;
    // Quality as standalone component (skill rule)
    components.push(`q_${q}`);
    tags.push({ icon: 'fa-file-zipper', label: `Quality q_${q}` });
    summary += `Compressed to quality ${q} for smaller file size. `;
  }

  // ── If nothing matched, apply a tasteful default ──────────────
  if (components.length === 0) {
    components.push('e_brightness:10', 'e_saturation:15');
    tags.push({ icon: 'fa-wand-magic-sparkles', label: 'Auto polish' });
    summary = 'Applied a gentle brightness and saturation boost for a polished look.';
  }

  return {
    components,
    tags,
    summary: summary.trim() || 'Transformation applied.',
    cost,
    urlEnding: 'f_auto/q_auto'
  };
}

/**
 * Build a full Cloudinary delivery URL from parsed components.
 * Follows skill URL structure:
 *   https://res.cloudinary.com/<cloud>/<type>/upload/<transforms>/<public_id>
 */
function buildCloudinaryAIUrl(cloudName, publicId, components, urlEnding = 'f_auto/q_auto') {
  const transformStr = [...components, ...urlEnding.split('/')].join('/');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicId}`;
}

/** Copy text to clipboard with visual feedback on the button */
async function copyToClipboard(text, btnEl, labelEl) {
  try {
    await navigator.clipboard.writeText(text);
    btnEl.classList.add('copied');
    const icon = btnEl.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-check';
    if (labelEl) labelEl.textContent = 'Copied!';
    setTimeout(() => {
      btnEl.classList.remove('copied');
      if (icon) icon.className = 'fa-regular fa-copy';
      if (labelEl) labelEl.textContent = 'Copy';
    }, 2000);
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

/** Show/hide helper */
function cldShow(el) { el?.classList.remove('hidden'); }
function cldHide(el) { el?.classList.add('hidden'); }

/**
 * Main initialiser for the Cloudinary AI Transformation Assistant
 */
function initCloudinaryAIAssistant() {
  const overlay   = document.getElementById('cld-ai-overlay');
  const closeBtn  = document.getElementById('cld-ai-close');
  const genBtn    = document.getElementById('cld-ai-generate-btn');
  const promptEl  = document.getElementById('cld-ai-prompt');
  const loadingEl = document.getElementById('cld-ai-loading');
  const resultsEl = document.getElementById('cld-ai-results');

  // Output elements
  const summaryTagsEl  = document.getElementById('cld-ai-summary-tags');
  const summaryTextEl  = document.getElementById('cld-ai-summary-text');
  const urlCodeEl      = document.getElementById('cld-ai-url-code');
  const transCodeEl    = document.getElementById('cld-ai-trans-code');
  const copyUrlBtn     = document.getElementById('cld-ai-copy-btn');
  const copyUrlLabel   = document.getElementById('cld-ai-copy-label');
  const copyTransBtn   = document.getElementById('cld-ai-copy-trans-btn');
  const copyTransLabel = document.getElementById('cld-ai-copy-trans-label');
  const previewLoader  = document.getElementById('cld-ai-preview-loader');
  const previewImg     = document.getElementById('cld-ai-preview-img');
  const previewError   = document.getElementById('cld-ai-preview-error');
  const previewPholder = document.getElementById('cld-ai-preview-placeholder');
  const openLink       = document.getElementById('cld-ai-open-link');
  const costNotice     = document.getElementById('cld-ai-cost-notice');
  const costText       = document.getElementById('cld-ai-cost-text');
  const previewNote    = document.getElementById('cld-ai-preview-note');
  const actionRow      = document.getElementById('cld-ai-action-row');
  const acceptBtn      = document.getElementById('cld-ai-accept-btn');
  const rejectBtn      = document.getElementById('cld-ai-reject-btn');
  const downloadLink   = document.getElementById('cld-ai-download-link');

  if (!overlay) return;

  // ── Open / Close ─────────────────────────────────────────────
  function openModal() { overlay.classList.add('open'); promptEl?.focus(); }
  function closeModal() { overlay.classList.remove('open'); clearCloudinaryAssistantContext(); }

  // Expose the assistant modal API so upload can trigger it directly
  window.openCloudinaryAIModal = openModal;
  window.closeCloudinaryAIModal = closeModal;

  closeBtn?.addEventListener('click', () => {
    resetActionRow();
    closeModal();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      resetActionRow();
      closeModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      resetActionRow();
      closeModal();
    }
  });

  // ── Example Chips ─────────────────────────────────────────────
  document.querySelectorAll('.cld-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (promptEl) promptEl.value = chip.dataset.prompt || '';
      // Highlight active chip
      document.querySelectorAll('.cld-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      promptEl?.focus();
    });
  });

  // ── Generate ─────────────────────────────────────────────────
  genBtn?.addEventListener('click', runGeneration);
  promptEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      runGeneration();
    }
  });

  function runGeneration() {
    const prompt = promptEl?.value?.trim();
    const context = getCloudinaryAssistantContext();
    const file = context.sourceFile || imageInput.files[0];
    const imagePreview = context.previewElement;

    if (!prompt) {
      promptEl?.focus();
      promptEl?.classList.add('cld-shake');
      setTimeout(() => promptEl?.classList.remove('cld-shake'), 600);
      return;
    }

    if (!file) {
      cldHide(resultsEl);
      cldShow(previewError);
      previewError.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span>Please upload a photo first to transform it.</span>';
      return;
    }

    const cloudName = cloudinaryConfig.cloudName?.trim();
    pendingEditedImageUrl = "";
    let usingLocalFallback = false;
    let localTransformUrl = null;
    let fullUrl = null;

    // Show loading, hide results
    cldShow(loadingEl);
    cldHide(resultsEl);
    cldHide(previewError);
    genBtn.disabled = true;
    genBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Generating…</span>';

    // Simulate a tiny deliberate delay for UX (real NLP runs synchronously)
    setTimeout(async () => {
      try {
        const { components, tags, summary, cost, urlEnding } =
          parseNaturalLanguageTransformation(prompt);

        const uploadResult = await uploadToCloudinary(file);
        const finalEnding = urlEnding || 'f_auto/q_auto';
        const transformStr = [...components, ...finalEnding.split('/')].join('/');
        let fullUrl;
        const base64Source = context.sourceBase64 || currentImageBase64;

        if (uploadResult && uploadResult.publicId) {
          fullUrl = buildCloudinaryAIUrl(cloudName || cloudinaryConfig.cloudName, uploadResult.publicId, components, finalEnding);
          pendingEditedImageUrl = fullUrl;
          previewNote.textContent = 'Transformed uploaded photo';
        } else if (base64Source) {
          usingLocalFallback = true;
          localTransformUrl = await applyLocalImageTransform(base64Source, prompt);
          fullUrl = localTransformUrl;
          pendingEditedImageUrl = fullUrl;
          previewNote.textContent = 'Local transform preview applied.';
          if (imagePreview && imagePreview.tagName === 'IMG') {
            imagePreview.src = fullUrl;
          }
        } else {
          fullUrl = base64Source || DEFAULT_MEDIA_IMAGE;
          pendingEditedImageUrl = fullUrl;
          previewNote.textContent = 'Original preview preserved.';
        }

        // ── Populate Summary ──────────────────────────────────
        summaryTagsEl.innerHTML = tags.map(t =>
          `<span class="cld-summary-tag"><i class="fa-solid ${t.icon}"></i>${t.label}</span>`
        ).join('');
        summaryTextEl.textContent = summary;

        // ── Populate URL / transformation string ──────────────
        if (usingLocalFallback) {
          urlCodeEl.textContent = 'Cloudinary upload unavailable. Using local preview instead.';
          transCodeEl.textContent = 'local_preview';
          cldHide(costNotice);
        } else {
          urlCodeEl.textContent = fullUrl;
          transCodeEl.textContent = transformStr;
          if (cost) {
            costText.textContent = cost;
            cldShow(costNotice);
          } else {
            cldHide(costNotice);
          }
        }

        copyUrlBtn.onclick   = () => copyToClipboard(urlCodeEl?.textContent || '', copyUrlBtn, copyUrlLabel);
        copyTransBtn.onclick = () => copyToClipboard(transCodeEl?.textContent || '', copyTransBtn, copyTransLabel);

        // ── Preview ───────────────────────────────────────────
        cldHide(previewPholder);
        cldHide(previewError);
        cldHide(previewImg);

        if (!usingLocalFallback && cloudName && cloudName !== 'YOUR_CLOUD_NAME') {
          cldShow(previewLoader);
          previewNote.textContent = 'via Cloudinary CDN';

          const imgTest = new Image();
          imgTest.onload = () => {
            cldHide(previewLoader);
            previewImg.src = fullUrl;
            cldShow(previewImg);
            openLink.href = fullUrl;
            cldShow(openLink);
          };
          imgTest.onerror = () => {
            cldHide(previewLoader);
            cldShow(previewError);
            cldHide(openLink);
            previewNote.textContent = 'Check Cloud Name & Public ID';
          };
          imgTest.src = fullUrl;
        } else {
          cldHide(previewLoader);
          cldShow(previewImg);
          previewImg.src = fullUrl;
          if (usingLocalFallback) {
            cldHide(openLink);
            previewNote.textContent = 'Local transform preview applied.';
          } else {
            cldShow(openLink);
            openLink.href = fullUrl;
          }
        }

        // ── Show results ──────────────────────────────────────
        cldHide(loadingEl);
        cldShow(resultsEl);
        cldShow(actionRow);
        downloadLink.href = fullUrl;
        downloadLink.classList.remove('hidden');
        downloadLink.setAttribute('download', 'eirene-transformed.jpg');

        acceptBtn.onclick = () => {
          const acceptedUrl = pendingEditedImageUrl || fullUrl;
          context.onAccept?.(acceptedUrl);
          clearCloudinaryAssistantContext();
          closeModal();
        };

        rejectBtn.onclick = () => {
          pendingEditedImageUrl = "";
          context.onReject?.();
          clearCloudinaryAssistantContext();
          closeModal();
        };
      } catch (err) {
        console.error('CLD AI Assistant error:', err);
        cldHide(loadingEl);
        previewError.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i><span>${err.message}</span>`;
        cldShow(previewError);
        cldHide(resultsEl);
      } finally {
        genBtn.disabled = false;
        genBtn.innerHTML = '<i class="fa-solid fa-bolt"></i><span>Generate</span>';
      }
    }, 600);
  }

  // ── Copy URL + Trans buttons (also wired on generate) ────────
  copyUrlBtn?.addEventListener('click', () => {
    copyToClipboard(urlCodeEl?.textContent || '', copyUrlBtn, copyUrlLabel);
  });
  copyTransBtn?.addEventListener('click', () => {
    copyToClipboard(transCodeEl?.textContent || '', copyTransBtn, copyTransLabel);
  });

  function resetActionRow() {
    cldHide(actionRow);
    downloadLink?.classList.add('hidden');
    if (acceptBtn) acceptBtn.onclick = null;
    if (rejectBtn) rejectBtn.onclick = null;
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      resetActionRow();
      closeModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      resetActionRow();
      closeModal();
    }
  });
}
