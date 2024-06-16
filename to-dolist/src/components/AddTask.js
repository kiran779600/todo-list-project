import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddTask.css';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import { Toolbar, Typography, Menu, MenuItem } from '@mui/material';

function AddTask() {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', date: '', timestamp: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios.get('http://localhost:3005/tasks')
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the tasks!', error);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentTimestamp = new Date().toLocaleTimeString();

    if (isEditing) {
      axios.put(`http://localhost:3005/updateTask/${tasks[currentIndex].id}`, formData)
        .then(response => {
          const updatedTasks = tasks.map((task, index) =>
            index === currentIndex ? response.data : task
          );
          setTasks(updatedTasks);
          setIsEditing(false);
          setFormData({ name: '', description: '', date: '', timestamp: '' });
          setSuccessMessage('Task updated successfully!');
          setTimeout(() => setSuccessMessage(''), 3000); 
        })
        .catch(error => console.error('There was an error updating the task!', error));
    } else {
      axios.post('http://localhost:3005/addTask', { ...formData, timestamp: currentTimestamp })
        .then(response => {
          setTasks([...tasks, response.data]);
          setFormData({ name: '', description: '', date: '', timestamp: '' });
          setSuccessMessage('Task added successfully!');
          setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
        })
        .catch(error => console.error('There was an error adding the task!', error));
    }
  };

  const handleEdit = (index) => {
    setCurrentIndex(index);
    setFormData(tasks[index]);
    setIsEditing(true);
  };

  const handleDelete = (index) => {
    axios.delete(`http://localhost:3005/deleteTask/${tasks[index].id}`)
      .then(() => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
        setSuccessMessage('Task deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
      })
      .catch(error => console.error('There was an error deleting the task!', error));
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuClick}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
            Todo List
          </Typography>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
          
          </Menu>
        </Toolbar>
      </AppBar>
      <div className="container">
        <form className='form2' onSubmit={handleSubmit}>
          <input name="name" placeholder="Task Name" value={formData.name} onChange={handleChange} required />
          <input name="description" placeholder="Task Description" value={formData.description} onChange={handleChange} required />
          <input name="date" type="date" value={formData.date} onChange={handleChange} required />
          <button type="submit" className="action-button">{isEditing ? <EditIcon /> : <AddCircleOutlineIcon />} {isEditing ? 'Update Task' : 'Add Task'}</button>
        </form>
        {successMessage && (
          <div className="success-message">
            <CheckCircleIcon style={{ color: 'green', marginRight: '5px' }} />
            <span>{successMessage}</span>
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Task Description</th>
              <th>Task Date</th>
              <th>Task Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={index}>
                <td>{task.name}</td>
                <td>{task.description}</td>
                <td>{task.date}</td>
                <td>{task.timestamp}</td>
                <td>
                  <IconButton onClick={() => handleEdit(index)} aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(index)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AddTask;
