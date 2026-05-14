import TaskItem from './TaskItem';

function TaskList({ tasks, onUpdate, onDelete }) {
  if (tasks.length === 0) {
    return <div className="empty-state">No tasks yet. Enjoy your day!</div>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem 
          key={task._id} 
          task={task} 
          onUpdate={onUpdate} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}

export default TaskList;
