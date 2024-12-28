const tableBody = document.getElementById('table-body');
const dayHeaders = {
    0: document.getElementById('domingo'),
    1: document.getElementById('segunda'),
    2: document.getElementById('terca'),
    3: document.getElementById('quarta'),
    4: document.getElementById('quinta'),
    5: document.getElementById('sexta'),
    6: document.getElementById('sabado')
};

let currentDate = new Date();
const id_profissional = localStorage.getItem('profissionalId');

function formatDate(date) {
    return date.getDate().toString().padStart(2, '0') + '/' + (date.getMonth() + 1).toString().padStart(2, '0');
}

function updateWeekDays(date) {
    const currentDay = date.getDay();
    const currentWeekStart = new Date(date);
    currentWeekStart.setDate(date.getDate() - currentDay);

    for (let i = 0; i < 7; i++) {
        const weekDay = new Date(currentWeekStart);
        weekDay.setDate(currentWeekStart.getDate() + i);
        dayHeaders[i].textContent = dayHeaders[i].textContent.split(' ')[0] + ' ' + formatDate(weekDay);
    }
}

function fetchConsultas(callback) {
    if (!id_profissional) {
        console.error('Erro: ID do profissional não está definido.');
        callback([]);
        return;
    }

    $.ajax({
        url: `/api/consulta/profissional/${id_profissional}`,
        method: 'GET',
        success: function (response) {
            callback(response || []); 
        },
        error: function (error) {
            console.error('Erro ao buscar consultas:', error);
            callback([]); 
        }
    });
}

function fetchDisponibilidade(date, diaSemana, callback) {
    const formattedDate = date.toISOString().split('T')[0];
    $.ajax({
        url: `/api/agenda/disponibilidade/${id_profissional}?data=${formattedDate}&dia_semana=${diaSemana}`,
        method: 'GET',
        success: function (response) {
            callback(response.horariosDisponiveis || [], diaSemana);
        },
        error: function (error) {
            console.error('Erro ao buscar horários disponíveis:', error);
            callback([], diaSemana); 
        }
    });
}

function createTable(horariosDisponiveisPorDia, consultas) {
    tableBody.innerHTML = '';

    for (let hour = 0; hour < 24; hour++) {
        const row = document.createElement('tr');

        const hourCell = document.createElement('td');
        hourCell.classList.add('hour-column');
        hourCell.textContent = `${hour.toString().padStart(2, '0')}:00`;
        row.appendChild(hourCell);

        for (let day = 0; day < 7; day++) {
            const dayCell = document.createElement('td');
            dayCell.classList.add('day-column');

            const horario = `${hour.toString().padStart(2, '0')}:00`;

            const currentDayDate = new Date(currentDate);
            currentDayDate.setDate(currentDate.getDate() - currentDate.getDay() + day);
            const formattedDate = currentDayDate.toISOString().split('T')[0];

            dayCell.id = `cell-${formattedDate}-${horario}`;

            const consultaMarcada = consultas.find(consulta => {
                const consultaDateFormatted = new Date(consulta.data).toISOString().split('T')[0];
                
                const consultaHoraFormatted = consulta.hora.padStart(4, '0');
                const formattedHora = consultaHoraFormatted.slice(0, 5);

                return consultaDateFormatted === formattedDate && formattedHora === horario;
            });

            if (consultaMarcada) {
                dayCell.style.backgroundColor = 'var(--cor-principal)';
                dayCell.style.color = 'white';
                dayCell.innerHTML = `<span id="nome-paciente">${consultaMarcada.paciente_nome}</span><br>${consultaMarcada.motivo}`;
            } else if (horariosDisponiveisPorDia[day] && horariosDisponiveisPorDia[day].includes(horario)) {
                dayCell.style.backgroundColor = 'var(--cor-nav)';
                dayCell.innerHTML = '<span>Disponível</span>'; 
                dayCell.innerHTML = '<span>Disponível</span>'; 
                
                dayCell.innerHTML = '<span>Disponível</span>';
                
            } else {
                dayCell.style.backgroundColor = 'var(--cor-indisponivel)';
            }

            row.appendChild(dayCell);
        }

        tableBody.appendChild(row);
    }
}

function loadWeekDisponibility(date) {
    const horariosDisponiveisPorDia = {};
    let remainingDays = 7;

    fetchConsultas((consultas) => {
        for (let day = 0; day < 7; day++) {
            const currentDayDate = new Date(date);
            currentDayDate.setDate(date.getDate() - date.getDay() + day);

            const diaSemanaBanco = (day === 0) ? 7 : day; 

            fetchDisponibilidade(currentDayDate, diaSemanaBanco, (horariosDisponiveis, diaSemana) => {
                horariosDisponiveisPorDia[diaSemana === 7 ? 0 : diaSemana] = horariosDisponiveis;

                remainingDays--;
                if (remainingDays === 0) {
                    createTable(horariosDisponiveisPorDia, consultas);
                }
            });
        }
    });
}

function changeWeek(offset) {
    currentDate.setDate(currentDate.getDate() + offset * 7);
    updateWeekDays(currentDate);

    loadWeekDisponibility(currentDate);
}

document.getElementById('prev-week').addEventListener('click', () => changeWeek(-1));
document.getElementById('next-week').addEventListener('click', () => changeWeek(1));

updateWeekDays(currentDate);
loadWeekDisponibility(currentDate);
