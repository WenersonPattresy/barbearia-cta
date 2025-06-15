// frontend/src/AppointmentForm.jsx

import { useState, useEffect } from 'react';

function AppointmentForm() {
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState([]);
  
  const availableTimeSlots = [ '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00' ];

  useEffect(() => {
    if (date) {
      setTime(''); 
      const fetchBookedTimes = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/booked-times/${date}`);
          const result = await response.json();
          if (result.success) {
            setBookedTimes(result.data);
          }
        } catch (error) {
          console.error("Erro ao buscar horários ocupados:", error);
        }
      };
      fetchBookedTimes();
    }
  }, [date]);

  const handleScheduleSubmit = async (event) => {
    event.preventDefault();
    const appointmentData = { name, service, date, time };
    try {
      const response = await fetch('http://localhost:3001/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      const result = await response.json();
      if (response.ok) {
        alert(`Agendamento confirmado!`);
        setName(''); setService(''); setDate(''); setTime('');
        setBookedTimes([...bookedTimes, time]);
      } else {
        alert(`Erro: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      alert('Não foi possível conectar ao servidor.');
    }
  };

  return (
    // Aplicando classes de container, cor de fundo, e centralização
    <div className="min-h-screen flex flex-col items-center p-4 font-sans">
      {/* Container principal do formulário com sombra e bordas arredondadas */}
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8 mt-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agende seu Horário</h1>
          <p className="text-gray-600 mt-2">Preencha as informações abaixo para marcar seu compromisso.</p>
        </header>

        <main>
          {/* Formulário com espaçamento entre os grupos de campos */}
          <form className="space-y-6" onSubmit={handleScheduleSubmit}>
            
            {/* Grupo de campo (Label + Input) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Seu Nome:</label>
              <input
                type="text"
                id="name"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Digite seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Serviço Desejado:</label>
              <select
                id="service"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={service}
                onChange={(e) => setService(e.target.value)}
                required
              >
                <option value="">Selecione um serviço</option>
                <option value="corte-cabelo">Corte de Cabelo</option>
                <option value="barba">Barba</option>
                <option value="corte-barba">Corte + Barba</option>
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Data:</label>
              <input
                type="date"
                id="date"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Hora:</label>
              <select
                id="time"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={!date}
              >
                <option value="">Selecione um horário</option>
                {availableTimeSlots.map(slot => (
                  <option 
                    key={slot} 
                    value={slot}
                    disabled={bookedTimes.includes(slot)}
                    className="disabled:text-gray-400"
                  >
                    {slot} {bookedTimes.includes(slot) ? '(Ocupado)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Botão com estilo de fundo, texto, e efeito hover */}
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Agendar Agora
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AppointmentForm;