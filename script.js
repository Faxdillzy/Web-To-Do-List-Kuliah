// Fungsi Local Storage
        const Storage = {
            // Simpan data ke Local Storage
            save: function(key, data) {
                localStorage.setItem(key, JSON.stringify(data));
            },
            
            // Ambil data dari Local Storage
            load: function(key) {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            },
            
            // Hapus data dari Local Storage
            remove: function(key) {
                localStorage.removeItem(key);
            }
        };

        // Data aplikasi
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

        // Render daftar tugas dengan fitur edit
        function renderTasks() {
            taskList.innerHTML = '';
            
            if (tasks.length === 0) {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>Belum ada tugas. Yuk tambahkan tugas baru!</p>
                    </div>
                `;
                return;
            }
            
            tasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = `task-item fade-in ${task.completed ? 'completed' : ''}`;
                taskItem.id = `task-${task.id}`;
                
                taskItem.innerHTML = `
                    <div class="task-info">
                        <h3>${task.title}</h3>
                        <p><i class="far fa-clock"></i> Deadline: ${formatDateTime(task.due)}</p>
                        ${task.desc ? `<p><i class="far fa-sticky-note"></i> ${task.desc}</p>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="task-btn complete" onclick="toggleTask(${task.id})" title="${task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}">
                            <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                        <button class="task-btn edit" onclick="editTask(${task.id})" title="Edit tugas">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-btn delete" onclick="deleteTask(${task.id})" title="Hapus tugas">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="edit-form" id="edit-form-${task.id}">
                        <h4>Edit Tugas</h4>
                        <form onsubmit="updateTask(${task.id}); return false;">
                            <div class="form-group">
                                <input type="text" id="edit-title-${task.id}" class="form-control" value="${task.title}" required>
                            </div>
                            <div class="form-group">
                                <input type="datetime-local" id="edit-due-${task.id}" class="form-control" value="${task.due.replace(' ', 'T')}" required>
                            </div>
                            <div class="form-group">
                                <textarea id="edit-desc-${task.id}" class="form-control" rows="2">${task.desc || ''}</textarea>
                            </div>
                            <button type="submit" class="btn btn-success">Simpan Perubahan</button>
                            <button type="button" class="btn btn-danger" onclick="cancelEdit(${task.id})">Batal</button>
                        </form>
                    </div>
                `;
                
                taskList.appendChild(taskItem);
            });
            
            updateStats();
            saveData(); // Simpan perubahan ke Local Storage
        }

        // Render daftar jadwal dengan fitur edit
        function renderSchedules() {
            scheduleList.innerHTML = '';
            
            if (schedules.length === 0) {
                scheduleList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <p>Belum ada jadwal. Tambahkan jadwal kuliahmu!</p>
                    </div>
                `;
                return;
            }
            
            schedules.forEach(schedule => {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = 'schedule-item fade-in';
                scheduleItem.id = `schedule-${schedule.id}`;
                
                scheduleItem.innerHTML = `
                    <h3>${schedule.title} 
                        <div>
                            <button class="task-btn edit" onclick="editSchedule(${schedule.id})" title="Edit jadwal">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="task-btn delete" onclick="deleteSchedule(${schedule.id})" title="Hapus jadwal">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </h3>
                    <p><i class="far fa-calendar"></i> ${schedule.day}, ${formatTime(schedule.time)}</p>
                    <div class="edit-form" id="edit-schedule-form-${schedule.id}">
                        <h4>Edit Jadwal</h4>
                        <form onsubmit="updateSchedule(${schedule.id}); return false;">
                            <div class="form-group">
                                <input type="text" id="edit-schedule-title-${schedule.id}" class="form-control" value="${schedule.title}" required>
                            </div>
                            <div class="form-group">
                                <select id="edit-schedule-day-${schedule.id}" class="form-control" required>
                                    <option value="Senin" ${schedule.day === 'Senin' ? 'selected' : ''}>Senin</option>
                                    <option value="Selasa" ${schedule.day === 'Selasa' ? 'selected' : ''}>Selasa</option>
                                    <option value="Rabu" ${schedule.day === 'Rabu' ? 'selected' : ''}>Rabu</option>
                                    <option value="Kamis" ${schedule.day === 'Kamis' ? 'selected' : ''}>Kamis</option>
                                    <option value="Jumat" ${schedule.day === 'Jumat' ? 'selected' : ''}>Jumat</option>
                                    <option value="Sabtu" ${schedule.day === 'Sabtu' ? 'selected' : ''}>Sabtu</option>
                                    <option value="Minggu" ${schedule.day === 'Minggu' ? 'selected' : ''}>Minggu</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <input type="time" id="edit-schedule-time-${schedule.id}" class="form-control" value="${schedule.time}" required>
                            </div>
                            <button type="submit" class="btn btn-success">Simpan Perubahan</button>
                            <button type="button" class="btn btn-danger" onclick="cancelScheduleEdit(${schedule.id})">Batal</button>
                        </form>
                    </div>
                `;
                
                scheduleList.appendChild(scheduleItem);
            });
            
            saveData(); // Simpan perubahan ke Local Storage
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

        // Simpan data ke Local Storage
        function saveData() {
            Storage.save('kuliahkuy-tasks', tasks);
            Storage.save('kuliahkuy-schedules', schedules);
        }

        // Load data dari Local Storage
        function loadData() {
            const savedTasks = Storage.load('kuliahkuy-tasks');
            const savedSchedules = Storage.load('kuliahkuy-schedules');
            
            if (savedTasks) tasks = savedTasks;
            if (savedSchedules) schedules = savedSchedules;
        }

        // Tambah tugas baru
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('task-title').value;
            const due = document.getElementById('task-due').value;
            const desc = document.getElementById('task-desc').value;
            
            const newTask = {
                id: Date.now(),
                title,
                due,
                desc,
                completed: false
            };
            
            tasks.push(newTask);
            renderTasks();
            
            // Reset form
            taskForm.reset();
            
            // Notifikasi
            showNotification('Tugas berhasil ditambahkan!', 'success');
        });

        // Tambah jadwal baru
        scheduleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('schedule-title').value;
            const day = document.getElementById('schedule-day').value;
            const time = document.getElementById('schedule-time').value;
            
            const newSchedule = {
                id: Date.now(),
                title,
                day,
                time
            };
            
            schedules.push(newSchedule);
            renderSchedules();
            
            // Reset form
            scheduleForm.reset();
            
            // Notifikasi
            showNotification('Jadwal berhasil ditambahkan!', 'success');
        });

        // Toggle status tugas
        function toggleTask(id) {
            tasks = tasks.map(task => {
                if (task.id === id) {
                    return { ...task, completed: !task.completed };
                }
                return task;
            });
            
            renderTasks();
            showNotification('Status tugas diperbarui!', 'info');
        }

        // Edit tugas
        function editTask(id) {
            // Sembunyikan semua form edit lainnya
            document.querySelectorAll('.edit-form').forEach(form => {
                form.style.display = 'none';
            });
            
            // Tampilkan form edit untuk tugas ini
            const editForm = document.getElementById(`edit-form-${id}`);
            editForm.style.display = 'block';
        }

        // Update tugas
        function updateTask(id) {
            const title = document.getElementById(`edit-title-${id}`).value;
            const due = document.getElementById(`edit-due-${id}`).value;
            const desc = document.getElementById(`edit-desc-${id}`).value;
            
            tasks = tasks.map(task => {
                if (task.id === id) {
                    return { ...task, title, due, desc };
                }
                return task;
            });
            
            renderTasks();
            showNotification('Tugas berhasil diperbarui!', 'success');
        }

        // Batal edit tugas
        function cancelEdit(id) {
            const editForm = document.getElementById(`edit-form-${id}`);
            editForm.style.display = 'none';
        }

        // Hapus tugas
        function deleteTask(id) {
            if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
                tasks = tasks.filter(task => task.id !== id);
                renderTasks();
                showNotification('Tugas berhasil dihapus!', 'warning');
            }
        }

        // Edit jadwal
        function editSchedule(id) {
            // Sembunyikan semua form edit lainnya
            document.querySelectorAll('.edit-form').forEach(form => {
                form.style.display = 'none';
            });
            
            // Tampilkan form edit untuk jadwal ini
            const editForm = document.getElementById(`edit-schedule-form-${id}`);
            editForm.style.display = 'block';
        }

        // Update jadwal
        function updateSchedule(id) {
            const title = document.getElementById(`edit-schedule-title-${id}`).value;
            const day = document.getElementById(`edit-schedule-day-${id}`).value;
            const time = document.getElementById(`edit-schedule-time-${id}`).value;
            
            schedules = schedules.map(schedule => {
                if (schedule.id === id) {
                    return { ...schedule, title, day, time };
                }
                return schedule;
            });
            
            renderSchedules();
            showNotification('Jadwal berhasil diperbarui!', 'success');
        }

        // Batal edit jadwal
        function cancelScheduleEdit(id) {
            const editForm = document.getElementById(`edit-schedule-form-${id}`);
            editForm.style.display = 'none';
        }

        // Hapus jadwal
        function deleteSchedule(id) {
            if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
                schedules = schedules.filter(schedule => schedule.id !== id);
                renderSchedules();
                showNotification('Jadwal berhasil dihapus!', 'warning');
            }
        }

        // Notifikasi
        function showNotification(message, type) {
            // Buat elemen notifikasi
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
            `;
            
            // Set warna berdasarkan type
            if (type === 'success') {
                notification.style.backgroundColor = '#10b981';
            } else if (type === 'warning') {
                notification.style.backgroundColor = '#f59e0b';
            } else if (type === 'info') {
                notification.style.backgroundColor = '#3b82f6';
            } else {
                notification.style.backgroundColor = '#6b7280';
            }
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Hapus notifikasi setelah 3 detik
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Inisialisasi
        document.addEventListener('DOMContentLoaded', function() {
            // Load data dari Local Storage
            loadData();
            
            // Render data
            renderTasks();
            renderSchedules();
            updateStats();
            
            // Tambahkan style untuk animasi notifikasi
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            console.log('Aplikasi KuliahKuy dimuat! Data tersimpan di Local Storage.');
        });
