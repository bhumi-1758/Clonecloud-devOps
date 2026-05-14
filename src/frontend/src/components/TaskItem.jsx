import { Trash2, CheckCircle, Circle } from 'lucide-react';

function TaskItem({ task, onUpdate, onDelete }) {
  const toggleComplete = () => {
    onUpdate(task._id, { 
      status: task.status === 'completed' ? 'todo' : 'completed' 
    });
  };

  return (
    <div className={`task-item ${task.status}`}>
      <div className="task-content">
        <button className="btn-icon status-toggle" onClick={toggleComplete}>
          {task.status === 'completed' ? (
            <CheckCircle className="icon-success" size={24} />
          ) : (
            <Circle size={24} />
          )}
        </button>
        <div className="task-text">
          <h3>{task.title}</h3>
          {task.description && <p>{task.description}</p>}
        </div>
      </div>
      <button 
        className="btn-icon btn-delete" 
        onClick={() => onDelete(task._id)}
        aria-label="Delete task"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}

export default TaskItem;
