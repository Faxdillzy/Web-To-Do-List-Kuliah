// ==================== LOCAL STORAGE FUNCTIONS ====================
        
        // Simpan data ke Local Storage
        function saveToLocalStorage() {
            const data = {
                tasks: tasks,
                schedules: schedules,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem('edutrack_data', JSON.stringify(data));
            showSaveNotification();
        }

        // Load data dari Local Storage
        function loadFromLocalStorage() {
            const savedData = localStorage.getItem('edutrack_data');
            
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    tasks = data.tasks || [];
                    schedules = data.schedules || [];
                    
                    console.log('Data berhasil dimuat dari Local Storage');
                } catch (error) {
                    console.error('Error loading data from localStorage:', error);
                    tasks = [];
                    schedules = [];
                }
            }
        }

        // ==================== NOTIFICATION ====================
        
        function showSaveNotification() {
            const notification = document.getElementById('saveNotification');
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        }

        // ==================== DATA MANAGEMENT ====================
        
        let tasks = [];
        let schedules = [];

        // Elemen DOM
        const taskForm = document.getElementById('task-form');
        const taskList = document.getElementById('task-list');
        const scheduleForm = document.getElementById('schedule-form');
        const scheduleList = document.getElementById('schedule-list');
        const totalTasksEl = document.getElementById('total-tasks');
        const completedTasksEl = document.getElementById('completed-tasks');
        const currentDateEl = document.getElementById('current-date');

        // Format tanggal Indonesia
        function formatDate(date) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('id-ID', options);
        }

        // Format waktu
        function formatTime(timeStr) {
            const [hours, minutes] = timeStr.split(':');
            return `${hours}:${minutes}`;
        }

        // Format datetime untuk deadline
        function formatDateTime(datetimeStr) {
            const date = new Date(datetimeStr);
            const options = { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return date.toLocaleDateString('id-ID', options);
        }

        // Tampilkan tanggal terkini
        currentDateEl.textContent = formatDate(new Date());

        // Render daftar tugas
        function renderTasks() {
            taskList.innerHTML = '';
            
            if (tasks.length === 0) {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>Belum ada tugas. Gaskeun tambahin tugas barunya!</p>
                    </div>
                `;
                return;
            }
            
            // Urutkan tugas: belum selesai dulu, lalu berdasarkan deadline
            const sortedTasks = [...tasks].sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                return new Date(a.due) - new Date(b.due);
            });
            
            sortedTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = `task-item fade-in ${task.completed ? 'completed' : ''}`;
                
                taskItem.innerHTML = `
                    <div class="task-info">
                        <h3>${task.title}</h3>
                        <p><i class="far fa-clock"></i> Deadline: ${formatDateTime(task.due)}</p>
                        ${task.desc ? `<p><i class="far fa-sticky-note"></i> ${task.desc}</p>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="task-btn complete" onclick="toggleTask(${task.id})">
                            <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                        <button class="task-btn delete" onclick="deleteTask(${task.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                taskList.appendChild(taskItem);
            });
            
            updateStats();
        }

        // Render daftar jadwal
        function renderSchedules() {
            scheduleList.innerHTML = '';
            
            if (schedules.length === 0) {
                scheduleList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <p>Belum ada jadwal. Gaskeun tambahin jadwal barunya!</p>
                    </div>
                `;
                return;
            }
            
            // Urutkan jadwal berdasarkan hari dan waktu
            const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7 };
            const sortedSchedules = [...schedules].sort((a, b) => {
                if (a.day !== b.day) {
                    return dayOrder[a.day] - dayOrder[b.day];
                }
                return a.time.localeCompare(b.time);
            });
            
            sortedSchedules.forEach(schedule => {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = 'schedule-item fade-in';
                
                scheduleItem.innerHTML = `
                    <h3>${schedule.title} 
                        <button class="task-btn delete" onclick="deleteSchedule(${schedule.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </h3>
                    <p><i class="far fa-calendar"></i> ${schedule.day}, ${schedule.time}</p>
                `;
                
                scheduleList.appendChild(scheduleItem);
            });
        }

        // Update statistik
        function updateStats() {
            const total = tasks.length;
            const completed = tasks.filter(task => task.completed).length;
            
            totalTasksEl.textContent = total;
            completedTasksEl.textContent = completed;
            
            renderChart(total, completed);
        }

        // Render chart
        function renderChart(total, completed) {
            const ctx = document.getElementById('task-chart').getContext('2d');
            
            if (window.taskChart) {
                window.taskChart.destroy();
            }
            
            window.taskChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Selesai', 'Belum Selesai'],
                    datasets: [{
                        data: [completed, total - completed],
                        backgroundColor: [
                            '#10b981',
                            '#6366f1'
                        ],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#f3f4f6',
                                font: {
                                    size: 12
                                }
                            }
                        }
                    },
                    cutout: '70%'
                }
            });
        }

        // ==================== TASK FUNCTIONS ====================
        
        function addTask(title, due, desc) {
            const newTask = {
                id: Date.now(),
                title,
                due,
                desc,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            renderTasks();
            saveToLocalStorage(); // Simpan ke Local Storage
        }

        function toggleTask(id) {
            tasks = tasks.map(task => {
                if (task.id === id) {
                    return { ...task, completed: !task.completed };
                }
                return task;
            });
            
            renderTasks();
            saveToLocalStorage(); // Simpan ke Local Storage
        }

        function deleteTask(id) {
            if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
                tasks = tasks.filter(task => task.id !== id);
                renderTasks();
                saveToLocalStorage(); // Simpan ke Local Storage
            }
        }

        function clearCompletedTasks() {
            if (confirm('Hapus semua tugas yang sudah selesai?')) {
                tasks = tasks.filter(task => !task.completed);
                renderTasks();
                saveToLocalStorage(); // Simpan ke Local Storage
            }
        }

        function clearAllTasks() {
            if (confirm('Hapus SEMUA tugas? Tindakan ini tidak dapat dibatalkan!')) {
                tasks = [];
                renderTasks();
                saveToLocalStorage(); // Simpan ke Local Storage
            }
        }

        // ==================== SCHEDULE FUNCTIONS ====================
        
        function addSchedule(title, day, time) {
            const newSchedule = {
                id: Date.now(),
                title,
                day,
                time,
                createdAt: new Date().toISOString()
            };
            
            schedules.push(newSchedule);
            renderSchedules();
            saveToLocalStorage(); // Simpan ke Local Storage
        }

        function deleteSchedule(id) {
            if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
                schedules = schedules.filter(schedule => schedule.id !== id);
                renderSchedules();
                saveToLocalStorage(); // Simpan ke Local Storage
            }
        }

        function clearAllSchedules() {
            if (confirm('Hapus SEMUA jadwal? Tindakan ini tidak dapat dibatalkan!')) {
                schedules = [];
                renderSchedules();
                saveToLocalStorage(); // Simpan ke Local Storage
            }
        }

        // ==================== EVENT LISTENERS ====================
        
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('task-title').value;
            const due = document.getElementById('task-due').value;
            const desc = document.getElementById('task-desc').value;
            
            addTask(title, due, desc);
            this.reset();
        });

        scheduleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('schedule-title').value;
            const day = document.getElementById('schedule-day').value;
            const time = document.getElementById('schedule-time').value;
            
            addSchedule(title, day, time);
            this.reset();
        });

        // ==================== AUTO-SAVE FEATURE ====================
        
        // Simpan otomatis setiap 30 detik (fallback)
        setInterval(() => {
            if (tasks.length > 0 || schedules.length > 0) {
                saveToLocalStorage();
            }
        }, 30000);

        // Simpan saat user meninggalkan halaman
        window.addEventListener('beforeunload', () => {
            if (tasks.length > 0 || schedules.length > 0) {
                saveToLocalStorage();
            }
        });

        // ==================== INITIALIZATION ====================
        
        document.addEventListener('DOMContentLoaded', function() {
            // Load data dari Local Storage saat halaman dimuat
            loadFromLocalStorage();
            
            // Render data yang telah diload
            renderTasks();
            renderSchedules();
            updateStats();
            
            console.log('Aplikasi EduTrack siap digunakan!');
            console.log('Data akan disimpan otomatis di browser Anda');
        });
