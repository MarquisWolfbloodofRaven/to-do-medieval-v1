// To-Do List da Torre do Alquimista
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const taskForm = document.getElementById('task-form');
    const taskTitle = document.getElementById('task-title');
    const taskDesc = document.getElementById('task-desc');
    const codexContainer = document.getElementById('codex-container');
    const totalTasksElement = document.getElementById('total-tasks');
    const completedTasksElement = document.getElementById('completed-tasks');
    const pendingTasksElement = document.getElementById('pending-tasks');
    const currentTaskElement = document.getElementById('current-task');
    const timerDisplay = document.getElementById('timer-display');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const hourglass = document.querySelector('.hourglass');
    const sandAudio = document.getElementById('sand-audio');
    
    // Variáveis do timer
    let timerInterval = null;
    let timerSeconds = 0;
    let timerRunning = false;
    let currentTaskId = null;
    
    // Carregar tarefas do localStorage
    let tasks = JSON.parse(localStorage.getItem('alchemistTasks')) || [];
    
    // Inicializar
    updateStats();
    renderTasks();
    updateCurrentYear();
    
    // Atualizar ano no rodapé
    function updateCurrentYear() {
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }
    
    // Formatar tempo (segundos para HH:MM:SS)
    function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Atualizar estatísticas
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        totalTasksElement.textContent = `Total: ${total}`;
        completedTasksElement.textContent = `Concluídos: ${completed}`;
        pendingTasksElement.textContent = `Pendentes: ${pending}`;
    }
    
    // Salvar tarefas no localStorage
    function saveTasks() {
        localStorage.setItem('alchemistTasks', JSON.stringify(tasks));
        updateStats();
    }
    
    // Renderizar todas as tarefas
    function renderTasks() {
        // Limpar container (exceto o estado vazio se não houver tarefas)
        if (tasks.length === 0) {
            codexContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-dead"></i>
                    <p>A torre está vazia... Crie seu primeiro codex para começar!</p>
                </div>
            `;
            return;
        }
        
        codexContainer.innerHTML = '';
        
        // Adicionar cada tarefa
        tasks.forEach(task => {
            const codexElement = createCodexElement(task);
            codexContainer.appendChild(codexElement);
        });
    }
    
    // Criar elemento HTML para uma tarefa
    function createCodexElement(task) {
        const codex = document.createElement('div');
        codex.className = `codex ${task.completed ? 'completed' : ''} ${task.expanded ? 'expanded' : ''}`;
        codex.dataset.id = task.id;
        
        // Tempo formatado para esta tarefa
        const timeSpent = formatTime(task.timeSpent || 0);
        
        codex.innerHTML = `
            ${task.completed ? '<div class="completed-badge"><i class="fas fa-seal"></i></div>' : ''}
            <div class="codex-header-row">
                <h3 class="codex-title">${escapeHtml(task.title)}</h3>
                <span class="codex-status ${task.completed ? 'status-completed' : 'status-pending'}">
                    ${task.completed ? 'Concluído' : 'Pendente'}
                </span>
            </div>
            <p class="codex-desc">${escapeHtml(task.description || 'Sem descrição...')}</p>
            <div class="codex-meta">
                <div class="codex-time">
                    <i class="fas fa-hourglass"></i> Tempo: ${timeSpent}
                </div>
                <div class="codex-controls">
                    ${!task.completed ? `
                    <button class="btn-codex btn-start" title="Iniciar timer para esta tarefa">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn-codex btn-complete" title="Marcar como concluída">
                        <i class="fas fa-check-circle"></i>
                    </button>
                    ` : ''}
                    <button class="btn-codex btn-edit" title="Editar tarefa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-codex btn-delete" title="Excluir tarefa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar event listeners
        const startBtn = codex.querySelector('.btn-start');
        const completeBtn = codex.querySelector('.btn-complete');
        const editBtn = codex.querySelector('.btn-edit');
        const deleteBtn = codex.querySelector('.btn-delete');
        const codexTitle = codex.querySelector('.codex-title');
        
        // Expandir/recolher ao clicar no título
        codexTitle.addEventListener('click', function(e) {
            if (!e.target.closest('button')) {
                toggleCodexExpansion(task.id);
            }
        });
        
        // Iniciar timer para esta tarefa
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                startTimerForTask(task.id);
            });
        }
        
        // Marcar como concluída
        if (completeBtn) {
            completeBtn.addEventListener('click', function() {
                toggleTaskCompletion(task.id);
            });
        }
        
        // Editar tarefa
        editBtn.addEventListener('click', function() {
            editTask(task.id);
        });
        
        // Excluir tarefa
        deleteBtn.addEventListener('click', function() {
            deleteTask(task.id);
        });
        
        return codex;
    }
    
    // Alternar expansão do codex
    function toggleCodexExpansion(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        tasks[taskIndex].expanded = !tasks[taskIndex].expanded;
        saveTasks();
        renderTasks();
    }
    
    // Adicionar nova tarefa
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = taskTitle.value.trim();
        const description = taskDesc.value.trim();
        
        if (!title) {
            alert('Por favor, insira um título para o codex!');
            return;
        }
        
        const newTask = {
            id: Date.now().toString(),
            title: title,
            description: description,
            completed: false,
            expanded: true,
            timeSpent: 0,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        
        // Limpar formulário
        taskForm.reset();
        taskTitle.focus();
        
        // Feedback visual
        const addBtn = document.querySelector('.btn-add');
        const originalText = addBtn.innerHTML;
        addBtn.innerHTML = '<i class="fas fa-check"></i> Codex Conjurado!';
        addBtn.style.background = 'linear-gradient(to bottom, var(--potion-green), #1e5a2a)';
        
        setTimeout(() => {
            addBtn.innerHTML = originalText;
            addBtn.style.background = '';
        }, 2000);
    });
    
    // Iniciar timer para uma tarefa específica
    function startTimerForTask(taskId) {
        // Se já estiver rodando para esta tarefa, pausar
        if (timerRunning && currentTaskId === taskId) {
            pauseTimer();
            return;
        }
        
        // Se estiver rodando para outra tarefa, pausar primeiro
        if (timerRunning) {
            pauseTimer();
        }
        
        // Encontrar a tarefa
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Definir tarefa atual
        currentTaskId = taskId;
        currentTaskElement.textContent = `Ativo: ${task.title}`;
        
        // Iniciar timer
        timerRunning = true;
        timerSeconds = task.timeSpent || 0;
        
        // Atualizar display
        timerDisplay.textContent = formatTime(timerSeconds);
        
        // Ativar controles do timer
        pauseTimerBtn.disabled = false;
        resetTimerBtn.disabled = false;
        
        // Iniciar animação da ampulheta
        hourglass.classList.add('sand-falling');
        
        // Iniciar áudio da areia (opcional)
        if (sandAudio) {
            sandAudio.currentTime = 0;
            sandAudio.play().catch(e => console.log("Áudio não pode ser reproduzido: ", e));
        }
        
        // Iniciar intervalo do timer
        timerInterval = setInterval(() => {
            timerSeconds++;
            timerDisplay.textContent = formatTime(timerSeconds);
            
            // Atualizar tempo gasto na tarefa
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].timeSpent = timerSeconds;
                saveTasks();
                
                // Atualizar display do tempo na tarefa
                const timeElement = document.querySelector(`.codex[data-id="${taskId}"] .codex-time`);
                if (timeElement) {
                    timeElement.innerHTML = `<i class="fas fa-hourglass"></i> Tempo: ${formatTime(timerSeconds)}`;
                }
            }
        }, 1000);
    }
    
    // Pausar timer
    function pauseTimer() {
        if (!timerRunning) return;
        
        timerRunning = false;
        clearInterval(timerInterval);
        hourglass.classList.remove('sand-falling');
        
        // Pausar áudio
        if (sandAudio) {
            sandAudio.pause();
        }
        
        // Atualizar botão
        pauseTimerBtn.innerHTML = '<i class="fas fa-play"></i> Retomar';
    }
    
    // Retomar timer
    function resumeTimer() {
        if (timerRunning || !currentTaskId) return;
        
        timerRunning = true;
        
        // Reiniciar intervalo
        timerInterval = setInterval(() => {
            timerSeconds++;
            timerDisplay.textContent = formatTime(timerSeconds);
            
            // Atualizar tempo gasto na tarefa
            const taskIndex = tasks.findIndex(t => t.id === currentTaskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].timeSpent = timerSeconds;
                saveTasks();
                
                // Atualizar display do tempo na tarefa
                const timeElement = document.querySelector(`.codex[data-id="${currentTaskId}"] .codex-time`);
                if (timeElement) {
                    timeElement.innerHTML = `<i class="fas fa-hourglass"></i> Tempo: ${formatTime(timerSeconds)}`;
                }
            }
        }, 1000);
        
        // Retomar animação
        hourglass.classList.add('sand-falling');
        
        // Retomar áudio
        if (sandAudio) {
            sandAudio.play().catch(e => console.log("Áudio não pode ser reproduzido: ", e));
        }
        
        // Atualizar botão
        pauseTimerBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
    }
    
    // Resetar timer
    function resetTimer() {
        // Parar timer
        if (timerRunning) {
            clearInterval(timerInterval);
            timerRunning = false;
        }
        
        // Resetar variáveis
        timerSeconds = 0;
        timerDisplay.textContent = formatTime(0);
        
        // Remover animação
        hourglass.classList.remove('sand-falling');
        
        // Parar áudio
        if (sandAudio) {
            sandAudio.pause();
            sandAudio.currentTime = 0;
        }
        
        // Resetar tarefa atual
        if (currentTaskId) {
            const taskIndex = tasks.findIndex(t => t.id === currentTaskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].timeSpent = 0;
                saveTasks();
                
                // Atualizar display do tempo na tarefa
                const timeElement = document.querySelector(`.codex[data-id="${currentTaskId}"] .codex-time`);
                if (timeElement) {
                    timeElement.innerHTML = `<i class="fas fa-hourglass"></i> Tempo: 00:00:00`;
                }
            }
            
            currentTaskElement.textContent = 'Nenhuma tarefa ativa';
            currentTaskId = null;
        }
        
        // Desativar controles
        pauseTimerBtn.disabled = true;
        resetTimerBtn.disabled = true;
        pauseTimerBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
    }
    
    // Alternar conclusão da tarefa
    function toggleTaskCompletion(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        
        // Se estiver completando e o timer estiver rodando para esta tarefa, parar o timer
        if (tasks[taskIndex].completed && timerRunning && currentTaskId === taskId) {
            resetTimer();
        }
        
        saveTasks();
        renderTasks();
    }
    
    // Editar tarefa
    function editTask(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        const task = tasks[taskIndex];
        
        // Preencher formulário com dados da tarefa
        taskTitle.value = task.title;
        taskDesc.value = task.description || '';
        
        // Focar no título
        taskTitle.focus();
        
        // Remover tarefa da lista (será readicionada ao submeter)
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
        
        // Atualizar texto do botão
        const addBtn = document.querySelector('.btn-add');
        addBtn.innerHTML = '<i class="fas fa-edit"></i> Atualizar Codex';
        addBtn.style.background = 'linear-gradient(to bottom, var(--gold), var(--gold-dark))';
        
        // Restaurar botão após submit (se não for submetido)
        const restoreButton = function() {
            addBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Conjurar Codex';
            addBtn.style.background = '';
            taskForm.removeEventListener('submit', restoreButton);
        };
        
        taskForm.addEventListener('submit', restoreButton, { once: true });
    }
    
    // Excluir tarefa
    function deleteTask(taskId) {
        if (!confirm('Tem certeza que deseja banir este codex para sempre?')) {
            return;
        }
        
        // Se o timer estiver rodando para esta tarefa, parar
        if (timerRunning && currentTaskId === taskId) {
            resetTimer();
        }
        
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;
        
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
    }
    
    // Utilitário para escapar HTML (prevenir XSS)
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Event listeners para controles do timer
    pauseTimerBtn.addEventListener('click', function() {
        if (!timerRunning) {
            resumeTimer();
        } else {
            pauseTimer();
        }
    });
    
    resetTimerBtn.addEventListener('click', resetTimer);
    
    // Inicializar controles do timer
    pauseTimerBtn.disabled = true;
    resetTimerBtn.disabled = true;
});
