const TASKS = [
    "Aileni gururlandırmak",
    "Korkularının üstesinden gelmek",
    "Ailenle tekrar görüşmek",
    "Favori sanatçını canlı izlemek",
    "Tekrar müzik dinlemek",
    "Yeni bir kültür deneyimlemek",
    "Yeni arkadaşlar edinmek",
    "İlham vermek",
    "Kendi çocuklarına sahip olmak",
    "Kendi evcil hayvanını sahiplenmek",
    "Kendinle gurur duymak",
    "İdollerinle tanışmak",
    "Ağlayana kadar gülmek",
    "Mutluluk gözyaşları dökmek",
    "En sevdiğin yemeği yemek",
    "Kardeşlerinin büyüdüğünü görmek",
    "Okulu bitirmek",
    "Fotoğraf çektirmek",
    "Yanakların acıyana kadar gülümsemek",
    "İnternet arkadaşlarınla tanışmak",
    "Seni hak ettiğin gibi seven birini bulmak",
    "Sıcak bir günde dondurma yemek",
    "Soğuk bir günde sıcak çikolata içmek",
    "Sabah el değmemiş karı görmek",
    "Gökyüzünü ateşe veren bir gün batımı izlemek",
    "Gökyüzünü aydınlatan yıldızları görmek",
    "Hayatını değiştiren bir kitap okumak",
    "İlkbaharda çiçekleri görmek",
    "Yaprakların yeşilden kahverengiye dönüşünü görmek",
    "Yurtdışına seyahat etmek",
    "Yeni bir dil öğrenmek",
    "Çizim yapmayı öğrenmek",
    "Başkalarına yardım etmek için hikayeni anlatmak",
    "Yavru köpek öpücükleri",
    "Bebek öpücükleri",
    "Küfür etmek ve söylerken hissettiğin rahatlama",
    "Trambolinler",
    "Dondurma",
    "Yıldızları izlemek",
    "Sabah yürüyüşü",
    "Duş alıp temiz çarşaflarda uyumak",
    "Düşünceli hediyeler almak",
    "Bunu gördüm ve seni düşündüm dediklerinde",
    "Sevdiğin birinin seni seviyorum demesi",
    "Ağladıktan sonra hissettiğin rahatlama",
    "Güneş ışığı",
    "Birisi seni dinlerken/tam dikkatini verirken hissettiğin duygu",
    "Gelecekteki düğünün",
    "En sevdiğin çikolata",
    "Yeni kıyafetler",
    "İlk aşk",
    "Gerçekten güzel ekmek",
    "Çocuğunu ilk kez kucağına almak",
    "Bir dönüm noktasını tamamlamak",
    "Uyanınca gülümsemene sebep olan rüyalar",
    "Yağmurdan önce ve sonraki koku",
    "Yağmurun çatıya vuruş sesi",
    "Dans ederken hissettiğin duygu"
];

let deletedTasks = [];
let undoTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const themeToggle = document.getElementById('themeToggle');
    const newTaskInput = document.getElementById('newTaskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const loadDefaultBtn = document.getElementById('loadDefaultBtn');
    const undoNotification = document.getElementById('undoNotification');
    const undoButton = document.getElementById('undoButton');
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const soundToggle = document.getElementById('soundToggle');
    const meowSound = new Audio('https://www.myinstants.com/media/sounds/m-e-o-w.mp3');
    let tasks = [];
    let isSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';

    const loadTasks = () => {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        } else {
            tasks = TASKS.map((text, index) => ({
                id: index + 1,
                text,
                completed: false
            }));
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
        renderTasks();
        updateStatistics();
    };

    const loadTheme = () => {
        const isDark = localStorage.getItem('darkTheme') === 'true';
        if (isDark) {
            document.body.classList.add('dark-theme');
            themeToggle.textContent = '☀️ Tema Değiştir';
        }
    };

    const renderTasks = () => {
        taskList.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-item-content">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span>${task.text}</span>
                </div>
                <button class="action-button delete" onclick="event.stopPropagation();">Sil</button>
            </div>
        `).join('');

        taskList.querySelectorAll('.task-item').forEach(item => {
            const checkbox = item.querySelector('input');
            const deleteBtn = item.querySelector('.delete');
            
            checkbox.addEventListener('change', () => {
                const taskId = parseInt(item.dataset.id);
                toggleTask(taskId);
            });

            deleteBtn.addEventListener('click', () => {
                const taskId = parseInt(item.dataset.id);
                deleteTask(taskId);
            });
        });
    };

    const toggleTask = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        const wasCompleted = task.completed;
        
        tasks = tasks.map(task => 
            task.id === taskId ? {...task, completed: !task.completed} : task
        );
        
        if (!wasCompleted) {
            playMeow();
        }
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateStatistics();
    };

    const updateStatistics = () => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const remaining = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('remainingTasks').textContent = remaining;
    };

    const createDeleteModal = (message) => {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal">
                    <p>${message}</p>
                    <div class="modal-buttons">
                        <button class="action-button clear-all" id="confirmDelete">Evet, Sil</button>
                        <button class="action-button add" id="cancelDelete">İptal</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.style.display = 'flex';

            const confirmBtn = modal.querySelector('#confirmDelete');
            const cancelBtn = modal.querySelector('#cancelDelete');

            confirmBtn.addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
        });
    };

    const showUndoNotification = () => {
        undoNotification.classList.add('show');
        if (undoTimer) {
            clearTimeout(undoTimer);
        }
        undoTimer = setTimeout(() => {
            hideUndoNotification();
            deletedTasks = [];
        }, 5000);
    };

    const hideUndoNotification = () => {
        undoNotification.classList.remove('show');
    };

    const loadDefaultTasks = async () => {
        if (tasks.length > 0) {
            const shouldLoad = await createDeleteModal(
                'Mevcut liste silinecek ve varsayılan liste yüklenecek. Onaylıyor musunuz?'
            );
            if (!shouldLoad) return;
        }
        
        tasks = TASKS.map((text, index) => ({
            id: index + 1,
            text,
            completed: false
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateStatistics();
    };

    const deleteTask = async (taskId) => {
        const shouldDelete = await createDeleteModal(
            'Bu görevi silmek istediğinizden emin misiniz?'
        );
        
        if (shouldDelete) {
            const deletedTask = tasks.find(task => task.id === taskId);
            deletedTasks = [deletedTask];
            tasks = tasks.filter(task => task.id !== taskId);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
            updateStatistics();
            showUndoNotification();
        }
    };

    const clearCompleted = async () => {
        const completedCount = tasks.filter(task => task.completed).length;
        if (completedCount === 0) return;

        const shouldClear = await createDeleteModal(
            'Tamamlanan görevleri silmek istediğinizden emin misiniz?'
        );
        
        if (shouldClear) {
            deletedTasks = tasks.filter(task => task.completed);
            tasks = tasks.filter(task => !task.completed);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
            updateStatistics();
            showUndoNotification();
        }
    };

    const clearAll = async () => {
        if (tasks.length === 0) return;

        const shouldClear = await createDeleteModal(
            'Tüm görevleri silmek istediğinizden emin misiniz?'
        );
        
        if (shouldClear) {
            deletedTasks = [...tasks];
            tasks = [];
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
            updateStatistics();
            showUndoNotification();
        }
    };

    const undoDelete = () => {
        if (deletedTasks.length > 0) {
            if (undoTimer) {
                clearTimeout(undoTimer);
                undoTimer = null;
            }

            const restoredTasks = [...deletedTasks];
            tasks = [...tasks, ...restoredTasks].sort((a, b) => a.id - b.id);
            
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
            updateStatistics();
            hideUndoNotification();
            deletedTasks = [];
        }
    };

    const checkScroll = () => {
        if (window.pageYOffset > 200) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const addTask = (text) => {
        if (text.trim() === '') return;
        
        const newTask = {
            id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
            text: text.trim(),
            completed: false
        };
        
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateStatistics();
        newTaskInput.value = '';
    };

    const loadSoundPreference = () => {
        if (isSoundEnabled) {
            soundToggle.textContent = '🔊';
            soundToggle.classList.add('sound-on');
            soundToggle.classList.remove('sound-off');
        } else {
            soundToggle.textContent = '🔈';
            soundToggle.classList.add('sound-off');
            soundToggle.classList.remove('sound-on');
        }
    };

    const playMeow = () => {
        if (isSoundEnabled) {
            meowSound.currentTime = 0;
            meowSound.play().catch(error => console.log('Ses çalınamadı'));
        }
    };

    addTaskBtn.addEventListener('click', () => {
        addTask(newTaskInput.value);
    });

    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(newTaskInput.value);
        }
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
    loadDefaultBtn.addEventListener('click', loadDefaultTasks);
    undoButton.addEventListener('click', undoDelete);
    window.addEventListener('scroll', checkScroll);
    scrollToTopBtn.addEventListener('click', scrollToTop);
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('darkTheme', isDark);
        themeToggle.textContent = isDark ? '☀️ Tema Değiştir' : '🌙 Tema Değiştir';
    });

    soundToggle.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        localStorage.setItem('soundEnabled', isSoundEnabled);
        soundToggle.textContent = isSoundEnabled ? '🔊' : '🔈';
        if (isSoundEnabled) {
            soundToggle.classList.add('sound-on');
            soundToggle.classList.remove('sound-off');
        } else {
            soundToggle.classList.add('sound-off');
            soundToggle.classList.remove('sound-on');
        }
    });

    loadTheme();
    loadTasks();
    loadSoundPreference();
}); 