// Data contoh untuk demonstrasi
        let tasks = [
            { id: 1, title: 'Tugas Matematika Diskrit', due: '2023-08-22T23:59', desc: 'Kerjakan soal halaman 45-50', completed: false },
            { id: 2, title: 'Proyek Pemrograman Web', due: '2023-08-25T23:59', desc: 'Buat website to-do list', completed: false },
            { id: 3, title: 'Laporan Fisika', due: '2023-08-21T10:00', desc: 'Praktikum hukum Ohm', completed: false }
        ];

        let schedules = [
            { id: 1, title: 'Pemrograman Web', day: 'Senin', time: '08:00' },
            { id: 2, title: 'Matematika Diskrit', day: 'Selasa', time: '10:00' },
            { id: 3, title: 'Basis Data', day: 'Rabu', time: '13:00' },
            { id: 4, title: 'Jaringan Komputer', day: 'Kamis', time: '15:00' }
        ];

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
                        <p>Belum ada tugas. Yuk tambahkan tugas baru!</p>
                    </div>
                `;
                return;
            }
            
            tasks.forEach(task => {
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
                        <p>Belum ada jadwal. Tambahkan jadwal kuliahmu!</p>
                    </div>
                `;
                return;
            }
            
            schedules.forEach(schedule => {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = 'schedule-item fade-in';
                
                scheduleItem.innerHTML = `
                    <h3>${schedule.title} <button class="task-btn delete" onclick="deleteSchedule(${schedule.id})"><i class="fas fa-trash"></i></button></h3>
                    <p><i class="far fa-calendar"></i> ${schedule.day}, ${formatTime(schedule.time)}</p>
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
            alert('Tugas berhasil ditambahkan!');
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
            alert('Jadwal berhasil ditambahkan!');
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
        }

        // Hapus tugas
        function deleteTask(id) {
            if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
                tasks = tasks.filter(task => task.id !== id);
                renderTasks();
            }
        }

        // Hapus jadwal
        function deleteSchedule(id) {
            if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
                schedules = schedules.filter(schedule => schedule.id !== id);
                renderSchedules();
            }
        }

        // Inisialisasi
        document.addEventListener('DOMContentLoaded', function() {
            renderTasks();
            renderSchedules();
            updateStats();
        });
