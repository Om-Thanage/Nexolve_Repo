import React, { useState, useEffect } from 'react';
import api from '../api';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeDrivers: 0,
        totalTrips: 0,
        totalCarbonSaved: 0,
        totalRevenue: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [driversList, setDriversList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Overview Stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard');
                const { totalUsers, activeDrivers, totalTrips, totalCarbonSaved, totalRevenue, activity, graphData } = res.data;

                setStats({ totalUsers, activeDrivers, totalTrips, totalCarbonSaved, totalRevenue: totalRevenue || 0 });
                setRecentActivity(activity || []);
                setChartData(graphData || []);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'overview') {
            fetchStats();
        }
    }, [activeTab]);

    // Fetch Users List
    useEffect(() => {
        const fetchUsers = async () => {
            if (activeTab === 'users') {
                try {
                    const res = await api.get('/admin/users');
                    setUsersList(res.data);
                } catch (error) {
                    console.error("Failed to fetch users", error);
                }
            }
        };
        fetchUsers();
    }, [activeTab]);

    // Fetch Drivers List
    useEffect(() => {
        const fetchDrivers = async () => {
            if (activeTab === 'drivers') {
                try {
                    const res = await api.get('/admin/drivers');
                    setDriversList(res.data);
                } catch (error) {
                    console.error("Failed to fetch drivers", error);
                }
            }
        };
        fetchDrivers();
    }, [activeTab]);

    const kpiData = [
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()} `, change: '+20%', color: 'border-l-4 border-l-yellow-500' },
        // { label: 'Active Drivers', value: stats.activeDrivers.toLocaleString(), change: '+5%', color: 'border-l-4 border-l-green-500' },
        { label: 'Total Trips', value: stats.totalTrips.toLocaleString(), change: '+23%', color: 'border-l-4 border-l-purple-500' },
        { label: 'Carbon Saved (kg)', value: stats.totalCarbonSaved.toLocaleString(), change: '+18%', color: 'border-l-4 border-l-teal-500' },
    ];

    // Helper function to render the specific content based on active tab
    const renderContent = () => {
        if (loading && activeTab === 'overview') {
            return <div className="flex h-full items-center justify-center">Loading Dashboard...</div>;
        }

        switch (activeTab) {
            case 'overview':
                return (
                    <>
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                                <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-background border border-border rounded-md text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                                    Download Report
                                </button>
                            </div>
                        </header>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {kpiData.map((kpi, index) => (
                                <div key={index} className={`bg-card p-6 rounded-xl border border-border shadow-sm ${kpi.color}`}>
                                    <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                                    <div className="flex items-baseline mt-2">
                                        <span className="text-2xl font-bold">{kpi.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Charts */}
                            <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4">Weekly Engagement</h3>
                                <div className="flex items-end justify-between h-48 gap-2 mt-4 px-4">
                                    {chartData.map((bar, i) => (
                                        <div key={i} className="flex flex-col items-center flex-1 group">
                                            <div className={`w-full bg-primary rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity relative`} style={{ height: `${bar.value * 10}px` }}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {bar.value}
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground mt-2">{bar.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                                                {activity.user ? activity.user.charAt(0) : '?'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium leading-none">Om Thanage</p>
                                                <p className="text-xs text-muted-foreground mt-1">{activity.action}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs px-2 py-1 rounded-full ${activity.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400' :
                                                    activity.status === 'Active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400' :
                                                        activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                                                    }`}>
                                                    {activity.status}
                                                </span>
                                                <p className="text-xs text-muted-foreground mt-1">{new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {recentActivity.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'users':
            case 'drivers':
                const list = activeTab === 'users' ? usersList : driversList;
                return (
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold capitalize">{activeTab} List</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Joined</th>
                                        <th className="px-6 py-3">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {list.map((item) => (
                                        <tr key={item._id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{item.name}</td>
                                            <td className="px-6 py-4">{item.email}</td>
                                            <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 capitalize">{item.role || 'User'}</td>
                                        </tr>
                                    ))}
                                    {list.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return <div>Coming Soon</div>;
        }
    };

    // Main Layout Return
    return (
        <div className="flex h-screen bg-background font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r-2 border-border bg-card hidden md:block">
                <div className="p-6">
                    <nav className="space-y-3">
                        {['Overview', 'Users'].map((item) => (
                            <button
                                key={item}
                                onClick={() => setActiveTab(item.toLowerCase())}
                                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 font-bold ${activeTab === item.toLowerCase()
                                    ? 'bg-primary text-primary-foreground border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] translate-x-[-2px] translate-y-[-2px]'
                                    : 'bg-card text-muted-foreground border-transparent hover:border-foreground hover:shadow-[4px_4px_0px_0px_var(--foreground)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:text-foreground'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8">
                {renderContent()}
            </main>
        </div>
    );
}