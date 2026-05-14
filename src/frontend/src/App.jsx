import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { Layout, PlusCircle } from 'lucide-react';

const API_URL = window.env?.API_URL || 'http://localhost:5000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`);
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (task) => {
    try {
      const res = await axios.post(`${API_URL}/tasks`, task);
      setTasks([...tasks, res.data]);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await axios.put(`${API_URL}/tasks/${id}`, updates);
      setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="header-content">
          <h1><Layout size={32} /> TaskFlow</h1>
          <p>Production-Grade Task Management</p>
        </div>
      </header>

      <main>
        <div className="dashboard">
          <section className="task-input-section">
            <div className="section-header">
              <PlusCircle size={20} />
              <h2>New Task</h2>
            </div>
            <TaskForm onAdd={addTask} />
          </section>

          <section className="task-list-section">
            <div className="section-header">
              <h2>My Tasks</h2>
              <span className="badge">{tasks.length}</span>
            </div>
            {loading ? (
              <p className="loading">Loading tasks...</p>
            ) : (
              <TaskList 
                tasks={tasks} 
                onUpdate={updateTask} 
                onDelete={deleteTask} 
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
