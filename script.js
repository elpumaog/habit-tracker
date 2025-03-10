document.addEventListener('DOMContentLoaded', () => {
    const habitInput = document.getElementById('habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitTable = document.getElementById('habit-table').getElementsByTagName('tbody')[0];
    const completedCount = document.getElementById('completed-count');
    const missedCount = document.getElementById('missed-count');
    const successRate = document.getElementById('success-rate');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
  
    let habits = JSON.parse(localStorage.getItem('habits')) || [];
    let notes = JSON.parse(localStorage.getItem('notes')) || {
      'daily-comments': '',
      'monthly-objectives': '',
      'achievements': '',
      'learnings': ''
    };
  
    // Initialize table and notes
    renderTable();
    loadNotes();
  
    // Add habit
    addHabitBtn.addEventListener('click', () => {
      const habitName = habitInput.value.trim();
      if (habitName) {
        habits.push({ name: habitName, days: new Array(31).fill(false) });
        habitInput.value = '';
        saveData();
        renderTable();
      }
    });
  
    // Render table
    function renderTable() {
      habitTable.innerHTML = '';
      const daysInMonth = 31;
  
      // Create header row (only once)
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = '<th>Day</th>'; // Add the "Day" column
      habits.forEach(habit => {
        headerRow.innerHTML += `<th>${habit.name}</th>`; // Add habit columns
      });
      habitTable.appendChild(headerRow);
  
      // Create rows for each day
      for (let day = 1; day <= daysInMonth; day++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${day}</td>`; // Add day number
        habits.forEach((habit, habitIndex) => {
          row.innerHTML += `<td><input type="checkbox" data-habit-index="${habitIndex}" data-day="${day - 1}" ${habit.days[day - 1] ? 'checked' : ''}></td>`;
        });
        habitTable.appendChild(row);
      }
  
      // Add event listeners to checkboxes
      document.querySelectorAll('#habit-table input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          const habitIndex = checkbox.dataset.habitIndex;
          const dayIndex = checkbox.dataset.day;
          habits[habitIndex].days[dayIndex] = checkbox.checked;
          saveData();
          updateStats();
        });
      });
  
      updateStats();
    }
  
    // Save data to localStorage
    function saveData() {
      localStorage.setItem('habits', JSON.stringify(habits));
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  
    // Load notes
    function loadNotes() {
      document.getElementById('daily-comments').value = notes['daily-comments'];
      document.getElementById('monthly-objectives').value = notes['monthly-objectives'];
      document.getElementById('achievements').value = notes['achievements'];
      document.getElementById('learnings').value = notes['learnings'];
  
      // Save notes on input change
      document.querySelectorAll('.notes-section textarea').forEach(textarea => {
        textarea.addEventListener('input', () => {
          notes[textarea.id] = textarea.value; // Update the notes object
          saveData(); // Save to localStorage
        });
      });
    }
  
    // Update statistics
    function updateStats() {
      let completed = 0;
      let missed = 0;
  
      habits.forEach(habit => {
        habit.days.forEach(day => {
          if (day) completed++;
          else missed++;
        });
      });
  
      const total = completed + missed;
      const rate = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;
  
      completedCount.textContent = completed;
      missedCount.textContent = missed;
      successRate.textContent = `${rate}%`;
    }
  
    // Export to PDF
    exportPdfBtn.addEventListener('click', () => {
      const { jsPDF } = window.jspdf; // Access jsPDF from the global scope
      const doc = new jsPDF();
  
      // Add table data
      let tableData = habits.map(habit => [habit.name, ...habit.days.map(day => day ? '✓' : '✗')]);
      doc.autoTable({
        head: [['Habit', ...Array.from({ length: 31 }, (_, i) => i + 1)]],
        body: tableData
      });
  
      // Add notes
      doc.text('Daily Comments: ' + notes['daily-comments'], 10, doc.autoTable.previous.finalY + 10);
      doc.text('Monthly Objectives: ' + notes['monthly-objectives'], 10, doc.autoTable.previous.finalY + 20);
      doc.text('Achievements: ' + notes['achievements'], 10, doc.autoTable.previous.finalY + 30);
      doc.text('Learnings: ' + notes['learnings'], 10, doc.autoTable.previous.finalY + 40);
  
      doc.save('habit-tracker.pdf');
    });
  });