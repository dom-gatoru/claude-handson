// ローカルストレージのキー
const STORAGE_KEY = 'todos';

// データ管理関数

/**
 * localStorageからタスクを読み込む
 * @returns {Array} タスクの配列
 */
function loadTasks() {
    try {
        const tasksJson = localStorage.getItem(STORAGE_KEY);
        if (!tasksJson) {
            return [];
        }
        const tasks = JSON.parse(tasksJson);
        return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
        console.error('タスクの読み込みに失敗しました:', error);
        return [];
    }
}

/**
 * タスクをlocalStorageに保存
 * @param {Array} tasks - 保存するタスクの配列
 */
function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            alert('ストレージの容量が不足しています。一部のタスクを削除してください。');
        } else {
            console.error('タスクの保存に失敗しました:', error);
        }
    }
}

/**
 * ユニークなIDを生成
 * @returns {string} ユニークID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// タスク操作関数

/**
 * 新しいタスクを追加
 * @param {string} taskText - タスクのテキスト
 */
function addTask(taskText) {
    // バリデーション
    const trimmedText = taskText.trim();
    if (!trimmedText) {
        alert('タスクを入力してください。');
        return;
    }

    if (trimmedText.length > 200) {
        alert('タスクは200文字以内で入力してください。');
        return;
    }

    // 新しいタスクを作成
    const newTask = {
        id: generateId(),
        text: trimmedText,
        completed: false,
        createdAt: Date.now()
    };

    // タスクを保存して再描画
    const tasks = loadTasks();
    tasks.push(newTask);
    saveTasks(tasks);
    renderTasks();

    // 入力フィールドをクリア
    document.getElementById('taskInput').value = '';
}

/**
 * タスクの完了状態を切り替え
 * @param {string} taskId - タスクのID
 */
function toggleTask(taskId) {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
        renderTasks();
    }
}

/**
 * タスクを削除
 * @param {string} taskId - タスクのID
 */
function deleteTask(taskId) {
    const tasks = loadTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    saveTasks(filteredTasks);
    renderTasks();
}

// UI更新関数

/**
 * タスクリスト全体を再描画
 */
function renderTasks() {
    const tasks = loadTasks();
    const taskList = document.getElementById('taskList');

    // リストをクリア
    taskList.innerHTML = '';

    // タスクがない場合
    if (tasks.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'タスクがありません。新しいタスクを追加してください。';
        taskList.appendChild(emptyState);
    } else {
        // 各タスクを描画（新しい順）
        tasks.forEach(task => {
            const taskElement = renderTaskItem(task);
            taskList.appendChild(taskElement);
        });
    }

    // 統計を更新
    updateStats();
}

/**
 * 個別のタスクアイテムを描画
 * @param {Object} task - タスクオブジェクト
 * @returns {HTMLElement} タスク要素
 */
function renderTaskItem(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) {
        li.classList.add('completed');
    }

    // チェックボックス
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    // タスクテキスト
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text; // XSS対策: textContentを使用

    // 削除ボタン
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = '削除';
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    // 要素を組み立て
    li.appendChild(checkbox);
    li.appendChild(taskText);
    li.appendChild(deleteButton);

    return li;
}

/**
 * 統計情報を更新
 */
function updateStats() {
    const tasks = loadTasks();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
}

// 初期化

/**
 * アプリケーションの初期化
 */
function init() {
    // localStorage対応チェック
    if (typeof Storage === 'undefined') {
        alert('お使いのブラウザはlocalStorageに対応していません。データの保存ができません。');
    }

    // 初期レンダリング
    renderTasks();

    // イベントリスナーの設定
    const addButton = document.getElementById('addButton');
    const taskInput = document.getElementById('taskInput');

    // 追加ボタンのクリックイベント
    addButton.addEventListener('click', () => {
        const taskText = taskInput.value;
        addTask(taskText);
    });

    // Enterキーでタスク追加
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const taskText = taskInput.value;
            addTask(taskText);
        }
    });
}

// DOMの読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', init);
