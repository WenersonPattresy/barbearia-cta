// frontend/src/EditAppointmentPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditAppointmentPage() {
  // Hooks para pegar o ID da URL e para navegar entre páginas
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados para os campos do formulário
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // useEffect para buscar os dados do agendamento quando a página carrega
  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/appointments/${id}`);
        const result = await response.json();
        if (result.success) {
          const { name, service, date, time } = result.data;
          setName(name);
          setService(service);
          setDate(date);
          setTime(time);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do agendamento:", error);
      }
    };
    fetchAppointmentData();
  }, [id]); // Roda sempre que o ID na URL mudar

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    const updatedData = { name, service, date, time };

    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        navigate('/admin'); // Volta para a página de admin após o sucesso
      } else {
        alert(`Erro ao atualizar: ${result.message}`);
      }
    } catch (error) {
      console.error("Erro de rede:", error);
    }
  };

  return (
    <div className="App">
      <header><h1>Editar Agendamento</h1></header>
      <main>
        <form className="schedule-form" onSubmit={handleUpdateSubmit}>
          {/* Os inputs são os mesmos do formulário de criação */}
          <div className="form-group"> <label htmlFor="name">Seu Nome:</label> <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required /> </div>
          <div className="form-group"> <label htmlFor="service">Serviço Desejado:</label> <select id="service" value={service} onChange={(e) => setService(e.target.value)} required> <option value="">Selecione um serviço</option> <option value="corte-cabelo">Corte de Cabelo</option> <option value="barba">Barba</option> <option value="corte-barba">Corte + Barba</option> </select> </div>
          <div className="form-group"> <label htmlFor="date">Data:</label> <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required /> </div>
          <div className="form-group"> <label htmlFor="time">Hora:</label> <input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} required /> </div>
          <button type="submit">Salvar Alterações</button>
        </form>
      </main>
    </div>
  );
}

export default EditAppointmentPage;