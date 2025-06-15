import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditAppointmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${id}`);
        const result = await response.json();
        if (result.success) {
          const { name, service, date, time } = result.data;
          setName(name);
          setService(service);
          setDate(date);
          setTime(time);
        } else {
            alert(result.message);
            navigate('/admin');
        }
      } catch (error) {
        console.error("Erro ao buscar dados do agendamento:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointmentData();
  }, [id, navigate]);

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    const updatedData = { name, service, date, time };
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        navigate('/admin');
      } else {
        alert(`Erro ao atualizar: ${result.message}`);
      }
    } catch (error) {
      console.error("Erro de rede:", error);
    }
  };

  if (isLoading) {
    return <div className="App"><h1>Carregando dados do agendamento...</h1></div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8 mt-6">
        <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Editar Agendamento</h1>
            <p className="text-gray-600 mt-2">Altere as informações necessárias e salve.</p>
        </header>
        <main>
          <form className="space-y-6" onSubmit={handleUpdateSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente:</label>
              <input type="text" id="name" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Serviço Desejado:</label>
              <select id="service" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={service} onChange={(e) => setService(e.target.value)} required>
                <option value="">Selecione um serviço</option>
                <option value="corte-cabelo">Corte de Cabelo</option>
                <option value="barba">Barba</option>
                <option value="corte-barba">Corte + Barba</option>
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Data:</label>
              <input type="date" id="date" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Hora:</label>
              <input type="time" id="time" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
              Salvar Alterações
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default EditAppointmentPage;