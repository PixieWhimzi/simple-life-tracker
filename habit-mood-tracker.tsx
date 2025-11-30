import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, RotateCcw, Palette } from 'lucide-react';
import * as Chart from 'chart.js';

// ============================================================================
// DATA SCHEMA (stored in localStorage):
// - habits: Array<{ id: string, name: string, completions: { [date: string]: boolean } }>
// - moods: { [date: string]: number } where number is 1-5
// - theme: string (pink | blue | mono | purple | gold)
// ============================================================================

const HabitMoodTracker = () => {
  const [habits, setHabits] = useState([]);
  const [moods, setMoods] = useState({});
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTheme, setCurrentTheme] = useState('pink');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    const savedMoods = localStorage.getItem('moods');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (e) {
        console.error('Error loading habits:', e);
      }
    }
    
    if (savedMoods) {
      try {
        setMoods(JSON.parse(savedMoods));
      } catch (e) {
        console.error('Error loading moods:', e);
      }
    }

    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  // Save moods to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('moods', JSON.stringify(moods));
  }, [moods]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  // Update mood chart whenever moods or theme change
  useEffect(() => {
    updateMoodChart();
  }, [moods, currentTheme]);

  // Get last 7 days array
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  // Add new habit
  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        completions: {}
      };
      setHabits([...habits, newHabit]);
      setNewHabitName('');
    }
  };

  // Toggle habit completion for a specific day
  const toggleHabitDay = (habitId, date) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = { ...habit.completions };
        newCompletions[date] = !newCompletions[date];
        return { ...habit, completions: newCompletions };
      }
      return habit;
    }));
  };

  // Delete habit
  const deleteHabit = (habitId) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
  };

  // Set mood for selected date
  const setMood = (moodValue) => {
    setMoods({ ...moods, [selectedDate]: moodValue });
  };

  // Update mood chart using Chart.js
  const updateMoodChart = () => {
    if (!chartRef.current) return;

    // Get last 30 days of mood data
    const last30Days = [];
    const moodData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push(dateStr);
      moodData.push(moods[dateStr] || null);
    }

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart.Chart(ctx, {
      type: 'line',
      data: {
        labels: last30Days.map(date => {
          const d = new Date(date + 'T00:00:00');
          return `${d.getMonth() + 1}/${d.getDate()}`;
        }),
        datasets: [{
          label: 'Mood',
          data: moodData,
          borderColor: theme.chartColor,
          backgroundColor: theme.chartBg,
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: theme.chartColor,
          pointBorderColor: theme.inputBg,
          pointBorderWidth: 2,
          spanGaps: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            min: 0,
            max: 6,
            ticks: {
              stepSize: 1,
              color: theme.textSecondary,
              callback: function(value) {
                const moodEmojis = ['', '😢', '😕', '😐', '😊', '😄'];
                return moodEmojis[value] || '';
              }
            },
            grid: {
              color: theme.inputBorder
            }
          },
          x: {
            ticks: {
              color: theme.textSecondary
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all habits and mood data? This cannot be undone.')) {
      setHabits([]);
      setMoods({});
      localStorage.removeItem('habits');
      localStorage.removeItem('moods');
    }
  };

  const last7Days = getLast7Days();
  
  // Theme-specific penguin images
  const penguinSets = {
    pink: {
      logo: 'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/pink-logo',
      moods: [
        'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/1.png',
        'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/2.png',
        'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/3.png',
        'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/4.png',
        'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/5.png'
      ]
    },
    blue: {
      logo: 'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/blue%20logo.png',
      moods: [
        'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/blue-1.png',
        'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/blue-2.png',
        'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/blue-3.png',
        'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/blue-4.png',
        'https://raw.githubusercontent.com/PixieWhimzi/simple-life-tracker/main/blue-5.png'
      ]
    }
  };

  // Get current penguin set (fallback to pink if theme doesn't have penguins yet)
  const currentPenguinSet = penguinSets[currentTheme] || penguinSets.pink;

  // Mood images - penguin emoticons from GitHub
  const moodEmojis = [
    { value: 5, emoji: currentPenguinSet.moods[0], label: 'Amazing', isImage: true },
    { value: 4, emoji: currentPenguinSet.moods[1], label: 'Good', isImage: true },
    { value: 3, emoji: currentPenguinSet.moods[2], label: 'Okay', isImage: true },
    { value: 2, emoji: currentPenguinSet.moods[3], label: 'Bad', isImage: true },
    { value: 1, emoji: currentPenguinSet.moods[4], label: 'Awful', isImage: true }
  ];

  // Available themes
  const themes = {
    pink: {
      name: 'Pink Panda',
      bg: '#0a0a0a',
      cardBg: 'rgba(26, 26, 26, 0.8)',
      cardShadow: '0 10px 40px rgba(255, 105, 180, 0.15)',
      primaryColor: '#FF69B4',
      secondaryColor: '#FF1493',
      accentColor: '#FF1493',
      textPrimary: '#e0e0e0',
      textSecondary: '#999',
      textTertiary: '#666',
      inputBg: '#1a1a1a',
      inputBorder: '#333',
      habitBg: 'linear-gradient(135deg, #1a1a1a, #2a1a2a)',
      habitShadow: '0 4px 15px rgba(255, 105, 180, 0.2)',
      buttonBg: 'linear-gradient(135deg, #FF1493, #FF69B4)',
      dayBorderActive: '#FF69B4',
      dayBorderInactive: '#333',
      dayBgActive: '#FF69B4',
      dayBgInactive: '#1a1a1a',
      moodBorder: '#FF69B4',
      moodBg: 'rgba(255, 105, 180, 0.1)',
      chartColor: '#FF69B4',
      chartBg: 'rgba(255, 105, 180, 0.1)',
      deleteColor: '#FF6B9D',
      pandaEar: '#FF69B4',
      pandaEye: '#FF1493',
      pandaNose: '#FF69B4'
    },
    blue: {
      name: 'Ocean Blue',
      bg: '#0a0e1a',
      cardBg: 'rgba(15, 23, 42, 0.8)',
      cardShadow: '0 10px 40px rgba(59, 130, 246, 0.15)',
      primaryColor: '#60A5FA',
      secondaryColor: '#3B82F6',
      accentColor: '#3B82F6',
      textPrimary: '#e0e7ff',
      textSecondary: '#94a3b8',
      textTertiary: '#64748b',
      inputBg: '#1e293b',
      inputBorder: '#334155',
      habitBg: 'linear-gradient(135deg, #1e293b, #1e3a5f)',
      habitShadow: '0 4px 15px rgba(59, 130, 246, 0.2)',
      buttonBg: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
      dayBorderActive: '#60A5FA',
      dayBorderInactive: '#334155',
      dayBgActive: '#60A5FA',
      dayBgInactive: '#1e293b',
      moodBorder: '#60A5FA',
      moodBg: 'rgba(96, 165, 250, 0.1)',
      chartColor: '#60A5FA',
      chartBg: 'rgba(96, 165, 250, 0.1)',
      deleteColor: '#F87171',
      pandaEar: '#60A5FA',
      pandaEye: '#3B82F6',
      pandaNose: '#60A5FA'
    },
    mono: {
      name: 'Monochrome',
      bg: '#0a0a0a',
      cardBg: 'rgba(23, 23, 23, 0.8)',
      cardShadow: '0 10px 40px rgba(255, 255, 255, 0.05)',
      primaryColor: '#d4d4d4',
      secondaryColor: '#a3a3a3',
      accentColor: '#fafafa',
      textPrimary: '#fafafa',
      textSecondary: '#a3a3a3',
      textTertiary: '#737373',
      inputBg: '#171717',
      inputBorder: '#404040',
      habitBg: 'linear-gradient(135deg, #171717, #262626)',
      habitShadow: '0 4px 15px rgba(255, 255, 255, 0.05)',
      buttonBg: 'linear-gradient(135deg, #525252, #737373)',
      dayBorderActive: '#d4d4d4',
      dayBorderInactive: '#404040',
      dayBgActive: '#d4d4d4',
      dayBgInactive: '#171717',
      moodBorder: '#d4d4d4',
      moodBg: 'rgba(212, 212, 212, 0.1)',
      chartColor: '#d4d4d4',
      chartBg: 'rgba(212, 212, 212, 0.1)',
      deleteColor: '#a3a3a3',
      pandaEar: '#d4d4d4',
      pandaEye: '#a3a3a3',
      pandaNose: '#d4d4d4'
    },
    purple: {
      name: 'Royal Purple',
      bg: '#0f0a1a',
      cardBg: 'rgba(24, 15, 42, 0.8)',
      cardShadow: '0 10px 40px rgba(168, 85, 247, 0.15)',
      primaryColor: '#C084FC',
      secondaryColor: '#A855F7',
      accentColor: '#A855F7',
      textPrimary: '#f3e8ff',
      textSecondary: '#c4b5fd',
      textTertiary: '#7c3aed',
      inputBg: '#1e1533',
      inputBorder: '#4c1d95',
      habitBg: 'linear-gradient(135deg, #1e1533, #2e1a47)',
      habitShadow: '0 4px 15px rgba(168, 85, 247, 0.2)',
      buttonBg: 'linear-gradient(135deg, #A855F7, #C084FC)',
      dayBorderActive: '#C084FC',
      dayBorderInactive: '#4c1d95',
      dayBgActive: '#C084FC',
      dayBgInactive: '#1e1533',
      moodBorder: '#C084FC',
      moodBg: 'rgba(192, 132, 252, 0.1)',
      chartColor: '#C084FC',
      chartBg: 'rgba(192, 132, 252, 0.1)',
      deleteColor: '#E879F9',
      pandaEar: '#C084FC',
      pandaEye: '#A855F7',
      pandaNose: '#C084FC'
    },
    gold: {
      name: 'Golden Luxury',
      bg: '#0a0a0a',
      cardBg: 'rgba(26, 24, 20, 0.8)',
      cardShadow: '0 10px 40px rgba(234, 179, 8, 0.15)',
      primaryColor: '#FCD34D',
      secondaryColor: '#EAB308',
      accentColor: '#EAB308',
      textPrimary: '#fef3c7',
      textSecondary: '#fde047',
      textTertiary: '#ca8a04',
      inputBg: '#1c1917',
      inputBorder: '#44403c',
      habitBg: 'linear-gradient(135deg, #1c1917, #292524)',
      habitShadow: '0 4px 15px rgba(234, 179, 8, 0.2)',
      buttonBg: 'linear-gradient(135deg, #EAB308, #FCD34D)',
      dayBorderActive: '#FCD34D',
      dayBorderInactive: '#44403c',
      dayBgActive: '#FCD34D',
      dayBgInactive: '#1c1917',
      moodBorder: '#FCD34D',
      moodBg: 'rgba(252, 211, 77, 0.1)',
      chartColor: '#FCD34D',
      chartBg: 'rgba(252, 211, 77, 0.1)',
      deleteColor: '#F59E0B',
      pandaEar: '#FCD34D',
      pandaEye: '#EAB308',
      pandaNose: '#FCD34D'
    },
    green: {
      name: 'Forest Green',
      bg: '#0a120a',
      cardBg: 'rgba(20, 30, 20, 0.8)',
      cardShadow: '0 10px 40px rgba(34, 197, 94, 0.15)',
      primaryColor: '#4ADE80',
      secondaryColor: '#22C55E',
      accentColor: '#22C55E',
      textPrimary: '#d1fae5',
      textSecondary: '#86efac',
      textTertiary: '#15803d',
      inputBg: '#1a2e1a',
      inputBorder: '#2d4a2d',
      habitBg: 'linear-gradient(135deg, #1a2e1a, #1e3a1e)',
      habitShadow: '0 4px 15px rgba(34, 197, 94, 0.2)',
      buttonBg: 'linear-gradient(135deg, #22C55E, #4ADE80)',
      dayBorderActive: '#4ADE80',
      dayBorderInactive: '#2d4a2d',
      dayBgActive: '#4ADE80',
      dayBgInactive: '#1a2e1a',
      moodBorder: '#4ADE80',
      moodBg: 'rgba(74, 222, 128, 0.1)',
      chartColor: '#4ADE80',
      chartBg: 'rgba(74, 222, 128, 0.1)',
      deleteColor: '#F87171',
      pandaEar: '#4ADE80',
      pandaEye: '#22C55E',
      pandaNose: '#4ADE80'
    }
  };

  const theme = themes[currentTheme];

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '20px',
      transition: 'background 0.3s ease'
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        marginBottom: '40px',
        padding: '20px',
        position: 'relative'
      }}>
        {/* Theme Selector */}
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            style={{
              background: theme.cardBg,
              border: `2px solid ${theme.primaryColor}`,
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: theme.primaryColor,
              boxShadow: theme.cardShadow,
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            }}
            title="Change Theme"
          >
            <Palette size={24} />
          </button>

          {/* Theme Menu */}
          {showThemeMenu && (
            <div style={{
              position: 'absolute',
              top: '60px',
              right: '0',
              background: theme.cardBg,
              borderRadius: '15px',
              padding: '15px',
              boxShadow: theme.cardShadow,
              border: `1px solid ${theme.inputBorder}`,
              backdropFilter: 'blur(10px)',
              minWidth: '200px',
              zIndex: 1000
            }}>
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentTheme(key);
                    setShowThemeMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 15px',
                    background: currentTheme === key ? t.primaryColor : 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    color: currentTheme === key ? '#000' : theme.textPrimary,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: currentTheme === key ? '600' : '400',
                    transition: 'all 0.2s',
                    marginBottom: '5px'
                  }}
                  onMouseOver={(e) => {
                    if (currentTheme !== key) {
                      e.currentTarget.style.background = theme.inputBg;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentTheme !== key) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: t.primaryColor,
                    border: `2px solid ${t.secondaryColor}`
                  }}></div>
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Penguin Logo */}
        <img 
          src={currentPenguinSet.logo} 
          alt="Penguin Logo" 
          style={{ 
            width: '100px', 
            height: '100px', 
            marginBottom: '10px',
            filter: `drop-shadow(0 0 15px ${theme.primaryColor}80)`
          }} 
        />

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: theme.primaryColor,
          margin: '10px 0',
          textShadow: `0 0 20px ${theme.primaryColor}80`
        }}>
          Penguin Habit & Mood Tracker
        </h1>
        <p style={{ color: theme.textSecondary, fontSize: '1rem' }}>
          Track your daily habits and moods 🌸
        </p>
      </header>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        marginBottom: '30px'
      }}>
        {/* Habits Column */}
        <div style={{
          background: theme.cardBg,
          borderRadius: '20px',
          padding: '30px',
          boxShadow: theme.cardShadow,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 105, 180, 0.2)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: theme.accentColor,
            marginBottom: '20px'
          }}>
            📋 Habits
          </h2>

          {/* Add Habit Form */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                placeholder="Add a new habit..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: `2px solid ${theme.inputBorder}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s',
                  background: theme.inputBg,
                  color: theme.textPrimary
                }}
              />
              <button
                onClick={addHabit}
                style={{
                  background: theme.buttonBg,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: '600',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 15px rgba(255, 105, 180, 0.3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Plus size={18} /> Add
              </button>
            </div>
          </div>

          {/* Habits List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {habits.length === 0 ? (
              <p style={{ textAlign: 'center', color: theme.textTertiary, padding: '20px' }}>
                No habits yet. Add one to get started! 🌱
              </p>
            ) : (
              habits.map(habit => (
                <div key={habit.id} style={{
                  background: theme.habitBg,
                  borderRadius: '15px',
                  padding: '15px',
                  boxShadow: theme.habitShadow,
                  border: '1px solid rgba(255, 105, 180, 0.15)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontWeight: '600', color: theme.textPrimary }}>
                      {habit.name}
                    </span>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.deleteColor,
                        cursor: 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.2s'
                      }}
                      title="Delete habit"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Last 7 Days */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {last7Days.map(date => {
                      const isCompleted = habit.completions[date];
                      const dateObj = new Date(date + 'T00:00:00');
                      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];
                      const dayNum = dateObj.getDate();
                      
                      return (
                        <button
                          key={date}
                          onClick={() => toggleHabitDay(habit.id, date)}
                          style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: isCompleted ? theme.dayBorderActive : theme.dayBorderInactive,
                            background: isCompleted ? theme.dayBgActive : theme.dayBgInactive,
                            color: isCompleted ? 'white' : theme.textSecondary,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            transition: 'all 0.3s',
                            lineHeight: '1'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 105, 180, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          title={`${dayName}, ${date}`}
                        >
                          <span style={{ fontSize: '0.65rem' }}>{dayName}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mood Column */}
        <div style={{
          background: theme.cardBg,
          borderRadius: '20px',
          padding: '30px',
          boxShadow: theme.cardShadow,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 105, 180, 0.2)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: theme.secondaryColor,
            marginBottom: '20px'
          }}>
            😊 Mood Tracker
          </h2>

          {/* Date Picker */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.textSecondary,
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${theme.inputBorder}`,
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                background: theme.inputBg,
                color: theme.textPrimary,
                colorScheme: 'dark'
              }}
            />
          </div>

          {/* Mood Buttons */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              color: theme.textSecondary,
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              How was your day?
            </label>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'space-between'
            }}>
              {moodEmojis.map(({ value, emoji, label, isImage }) => {
                const isSelected = moods[selectedDate] === value;
                return (
                  <button
                    key={value}
                    onClick={() => setMood(value)}
                    style={{
                      flex: 1,
                      aspectRatio: '1',
                      minWidth: '55px',
                      borderRadius: '15px',
                      border: '3px solid',
                      borderColor: isSelected ? theme.moodBorder : theme.inputBorder,
                      background: isSelected ? theme.moodBg : theme.inputBg,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '8px',
                      fontSize: isImage ? 'inherit' : '2rem'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 105, 180, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title={label}
                  >
                    {isImage ? (
                      <img src={emoji} alt={label} style={{ width: '100%', height: 'auto', maxWidth: '45px' }} />
                    ) : (
                      <span>{emoji}</span>
                    )}
                    <span style={{ fontSize: '0.6rem', color: theme.textTertiary }}>{label}</span>
                  </button>
                );
              })}
            </div>
            {moods[selectedDate] && (
              <p style={{
                marginTop: '12px',
                textAlign: 'center',
                color: theme.textSecondary,
                fontSize: '0.9rem'
              }}>
                ✨ Mood saved for {selectedDate}
              </p>
            )}
          </div>

          {/* Mood Chart */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: theme.textSecondary,
              marginBottom: '15px'
            }}>
              📈 Last 30 Days
            </h3>
            <div style={{
              background: theme.inputBg,
              borderRadius: '15px',
              padding: '20px',
              height: '250px',
              boxShadow: theme.habitShadow,
              border: '1px solid rgba(255, 105, 180, 0.1)'
            }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <button
          onClick={clearAllData}
          style={{
            background: 'linear-gradient(135deg, #8B0000, #DC143C)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 30px',
            color: 'white',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(139, 0, 0, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 0, 0, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 0, 0, 0.3)';
          }}
        >
          <RotateCcw size={18} />
          Clear All Data
        </button>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        color: theme.textTertiary,
        fontSize: '0.85rem'
      }}>
        Made with 💖 by Penguin • All data stored locally in your browser
      </footer>
    </div>
  );
};

export default HabitMoodTracker;