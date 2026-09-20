import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Career {
  _id: string;
  title: string;
  category: string;
  demandLevel: string;
}

const CareerManagement = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('token');

  const fetchCareers = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:5000/api/careers',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCareers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const deleteCareer = async (id: string) => {
    if (!window.confirm('Delete this career?')) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/careers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchCareers();
    } catch (err) {
      console.error(err);
      alert('Unable to delete career.');
    }
  };

  const filteredCareers = careers.filter(
    (career) =>
      career.title.toLowerCase().includes(search.toLowerCase()) ||
      career.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Career Management
        </h1>

        <Button>
          + Add Career
        </Button>

      </div>

      <Input
        placeholder="Search careers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Card>

        <CardHeader>

          <CardTitle>
            Available Careers
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-3">Title</th>
                  <th className="text-left py-3">Category</th>
                  <th className="text-left py-3">Demand</th>
                  <th className="text-center py-3">Actions</th>

                </tr>

              </thead>

              <tbody>

                {filteredCareers.map((career) => (

                  <tr
                    key={career._id}
                    className="border-b"
                  >

                    <td className="py-3">
                      {career.title}
                    </td>

                    <td>
                      {career.category}
                    </td>

                    <td>
                      {career.demandLevel}
                    </td>

                    <td className="text-center space-x-2">

                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCareer(career._id)}
                      >
                        Delete
                      </Button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </CardContent>

      </Card>

    </div>
  );
};

export default CareerManagement;