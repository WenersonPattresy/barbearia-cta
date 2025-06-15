// frontend/src/AdminPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Precisamos do Link para o botão de Editar
import './index.css'; // Usamos o index.css para o Tailwind

function AdminPage() {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments`);
      const result = await response.json();
      if (result.success) {
        setAppointments(result.data);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (appointmentId) => {
    if (!window.confirm("Você tem certeza que deseja excluir este agendamento?")) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setAppointments(appointments.filter(app => app.id !== appointmentId));
      } else {
        alert(`Erro ao excluir: ${result.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao excluir:", error);
      alert("Não foi possível conectar ao servidor para excluir.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Painel do Administrador</h1>
        <p className="text-gray-600 mt-2">Lista de todos os agendamentos marcados.</p>
      </header>
      <main className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <section className="appointments-list">
          <ul className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <li key={app.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                  <span className="text-gray-800">
                    <strong>{app.date} às {app.time}</strong> - {app.name} ({app.service})
                  </span>
                  <div className="flex space-x-2">
                    <Link to={`/admin/edit/${app.id}`} className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded">Editar</Link>
                    <button onClick={() => handleDelete(app.id)} className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded">Excluir</button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500">Nenhum agendamento marcado ainda.</p>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

// ESTA É A LINHA CRUCIAL QUE PROVAVELMENTE ESTÁ FALTANDO
export default AdminPage;