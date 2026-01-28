"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    user_id: number;
    user?: {
        name: string;
    };
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [usersList, setUsersList] = useState<User[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Task Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // User Creation Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('user');
    
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            router.push('/login');
            return;
        }

        try {
            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);
            const adminStatus = parsedUser.role?.toLowerCase().trim() === 'admin';
            setIsAdmin(adminStatus);

            fetchTasks();
            if (adminStatus) {
                fetchUsers();
            }
        } catch (error) {
            router.push('/login');
        }
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tasks');
            const data = Array.isArray(response.data) ? response.data : response.data.tasks;
            setTasks(data || []);
        } catch (error) {
            console.error("Error fetching tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsersList(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tasks', { title, description });
            setTitle('');
            setDescription('');
            fetchTasks();
        } catch (error) {
            alert("Failed to add task");
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users', { 
                name: newName, 
                email: newEmail, 
                password: newPassword, 
                role: newRole 
            });
            alert("User created successfully");
            setNewName('');
            setNewEmail('');
            setNewPassword('');
            fetchUsers();
        } catch (error) {
            alert("Failed to create user");
        }
    };

    const handleUpdateStatus = async (taskId: number, newStatus: string) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            alert("Update failed");
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            fetchTasks();
        } catch (error) {
            alert("Delete failed");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading System...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
                    <p className="text-gray-600 font-medium">
                        Welcome, {user?.name} | <span className="text-blue-600 uppercase font-bold">{user?.role}</span>
                    </p>
                </div>
                <button onClick={handleLogout} className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition font-bold">
                    Logout
                </button>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Create New Task</h2>
                        <form onSubmit={handleAddTask} className="space-y-3">
                            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded text-black bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" required />
                            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded text-black bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" rows={3} />
                            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">Add Task</button>
                        </form>
                    </div>

                    {isAdmin && (
                        <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-t-green-500 border border-gray-200">
                            <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Register New User</h2>
                            <form onSubmit={handleCreateUser} className="space-y-3">
                                <input type="text" placeholder="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border p-2 rounded text-black bg-gray-50 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
                                <input type="email" placeholder="Email Address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full border p-2 rounded text-black bg-gray-50 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
                                <input type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border p-2 rounded text-black bg-gray-50 text-sm focus:ring-2 focus:ring-green-500 outline-none" required />
                                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full border p-2 rounded text-black bg-gray-50 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                                    <option value="user">User</option>
                                    <option value="admin">Administrator</option>
                                </select>
                                <button className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition">Create User</button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3 space-y-6">
                    {isAdmin && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">System Users</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="pb-3">Name</th>
                                            <th className="pb-3">Email</th>
                                            <th className="pb-3 text-right">Role</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        {usersList.map((u) => (
                                            <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                                <td className="py-3 text-sm font-semibold">{u.name}</td>
                                                <td className="py-3 text-sm">{u.email}</td>
                                                <td className="py-3 text-right">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 px-2">{isAdmin ? "All Tasks" : "Your Tasks"}</h2>
                        {tasks.length === 0 ? (
                            <div className="bg-white p-10 rounded-xl text-center text-gray-400 border border-dashed border-gray-300 italic">No tasks available in the system.</div>
                        ) : (
                            tasks.map((task) => (
                                <div key={task.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                                        <p className="text-gray-500 text-sm mb-2">{task.description}</p>
                                        {isAdmin && (
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold uppercase">
                                                Owner: {task.user?.name || "Unknown"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <select 
                                            value={task.status}
                                            onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                            className="border rounded px-2 py-1 text-xs font-bold bg-white text-black"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        <button 
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="text-red-500 hover:text-red-700 text-xs font-bold uppercase transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}