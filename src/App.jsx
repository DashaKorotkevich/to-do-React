import React, { useState, useEffect } from 'react'; // Импортируем библиотеку React и хуки useState, useEffect
import './App.css'; // Подключаем стили приложения
import ToDoForm from "./AddTask"; // Импорт компонента формы добавления задач
import ToDo from "./Task"; // Импорт компонента отображения одной задачи
import axios from 'axios'; // Библиотека для выполнения HTTP запросов

const weatherApiKey = 'c7616da4b68205c2f3ae73df2c31d177';

// Основной компонент приложения
function App() {
  const [rates, setRates] = useState({}); // Состояния для хранения валютных курсов (объект и функция)
  const [weatherData, setWeatherData] = useState(null); // Состояние для хранения данных о погоде
  const [loading, setLoading] = useState(true); // Состояние для отображения загрузки
  const [error, setError] = useState(''); // Состояние для сообщений об ошибках
  const [todos, setTodos] = useState([]); // Состояние для хранения списка задач


  useEffect(() => {
    async function fetchAllData() {
      try {

        const currencyResponse = await axios.get('https://www.cbr-xml-daily.ru/daily_json.js');
        if (!currencyResponse.data || !currencyResponse.data.Valute) {
          throw new Error('Нет данных о валюте.');
        }

        const USDrate = currencyResponse.data.Valute.USD.Value.toFixed(4).replace('.', ',');
        const EURrate = currencyResponse.data.Valute.EUR.Value.toFixed(4).replace('.', ','); 

        setRates({ USDrate, EURrate }); 

        navigator.geolocation.getCurrentPosition(async position => {
          const lat = position.coords.latitude; 
          const lon = position.coords.longitude; 

          const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`
          );

          if (!weatherResponse.data.main) {
            throw new Error('Нет данных о погоде.');
          }

          setWeatherData(weatherResponse.data);
        });
      } catch (err) {
        console.error(err);
        setError('Ошибка загрузки данных.');
      } finally {

        setLoading(false);
      }
    }
    fetchAllData(); // Запускаем процедуру загрузки данных
  }, []); // Пустой массив зависимостей гарантирует однократный запуск эффекта

  
  const addTask = (userInput) => {
    if (userInput) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9), 
        task: userInput, 
        complete: false 
      };
      setTodos(prevTodos => [...prevTodos, newItem]); 
    }
  };

  const removeTask = (id) => {
    setTodos(prevTodos => prevTodos.filter((todo) => todo.id !== id)); // Оставляет задачи с id, не равным выбранному
  };

  // Функция для смены статуса задачи 
  const handleToggle = (id) => {
    setTodos(prevTodos =>
      prevTodos.map((task) =>
        task.id === id ? { ...task, complete: !task.complete } : task
      )
    ); // Меняем свойство complete для нужной задачи
  };

  // Возвращаемое представление компонента
  return (
    <>
      <div className="App">
        {loading && <p>Загрузка...</p>} {/* Индикатор загрузки */}
        {!loading && error && <p style={{ color: 'red' }}>{error}</p>} {/* Вывод ошибки, если она произошла */}
        {!loading && !error && ( // Если нет загрузки и ошибок, отображаем главное содержимое
          <>
            <div className='info'>
              <div className='money'> {/* Отображение курса евро и доллара*/}
                <div id="USD">Доллар США $ — {rates.USDrate} руб.</div> 
                <div id="EUR">Евро € — {rates.EURrate} руб.</div>              
              </div>
              {weatherData && ( // Отображение данных о погоде, если есть
                <div className="weather-info">
                  <div>
                    Погода сегодня: <br />
                    🌡️ {(weatherData.main.temp - 273.15).toFixed(1)}°C {" "}
                    🌬️ {weatherData.wind.speed} м/с{" "}
                    ☁️ {weatherData.clouds.all}%{" "}
                    <img
                      className='weather-icon'
                      src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`}
                      alt="Иконка погоды"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        <header>
          <h1 className='list-header'>Список задач: {todos.length}</h1>
        </header>
        <ToDoForm addTask={addTask} /> {/* Форма для добавления задач */}
        {todos.map((todo) => { // Цикл для отображения задач
          return (
            <ToDo
              todo={todo}
              key={todo.id}
              toggleTask={handleToggle}
              removeTask={removeTask}
            />
          );
        })}
      </div>
    </>
  );
}

// Экспорт компонента App
export default App;



