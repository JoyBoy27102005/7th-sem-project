import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Briefcase, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalRecommendations: number;
  totalResumes: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalRecommendations: 0,
    totalResumes: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');

        const { data } = await axios.get(
          'http://localhost:5000/api/users/admin/stats',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    {
      title: 'Total Students',
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: 'Admins',
      value: stats.totalAdmins,
      icon: Users,
    },
    {
      title: 'Career Recommendations',
      value: stats.totalRecommendations,
      icon: Sparkles,
    },
    {
      title: 'Resume Analyses',
      value: stats.totalResumes,
      icon: FileText,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {user?.name}
        </h1>

        <p className="text-muted-foreground">
          NextStep.ai Administration Panel
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row justify-between items-center pb-2">

                <CardTitle className="text-sm">
                  {card.title}
                </CardTitle>

                <Icon className="w-5 h-5 text-primary" />

              </CardHeader>

              <CardContent>

                <div className="text-4xl font-bold">
                  {card.value}
                </div>

              </CardContent>
            </Card>
          );
        })}

      </div>

      <Card>

        <CardHeader>

          <CardTitle>
            Project Status
          </CardTitle>

        </CardHeader>

        <CardContent>

          <ul className="space-y-2">

            <li> Authentication Completed</li>

            <li> Career Recommendation Completed</li>

            <li> Resume Analyzer Completed</li>

            <li> Learning Roadmap Completed</li>

            <li> Admin Dashboard Completed</li>

            <li> Analytics Module (Project-II)</li>

            <li> Company Recommendation (Project-II)</li>

            <li> Mock Interview (Project-II)</li>

          </ul>

        </CardContent>

      </Card>

    </div>
  );
};

export default AdminDashboard;