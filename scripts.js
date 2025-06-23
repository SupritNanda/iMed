const symptomDiagnosisMap = {
  'Fever': ['Viral Fever', 'Influenza', 'Common cold', 'Strep Throat'],
  'Cough': ['Common cold', 'Influenza', 'Bronchitis', 'Pneumonia'],
  'Headache': ['Migraine', 'Tension Headache', 'Sinusitis'],
  'Sore throat': ['Strep Throat', 'Common cold', 'Influenza'],
  'Fatigue': ['Anemia', 'Hypothyroidism', 'Chronic Fatigue Syndrome'],
  'Runny nose': ['Common cold', 'Allergic Rhinitis', 'Sinusitis'],
  'Nausea': ['Gastroenteritis', 'Food Poisoning', 'Migraine']
};

const medicineRecommendations = {
  'Viral Fever': ['Paracetamol', 'Ibuprofen'],
  'Influenza': ['Oseltamivir', 'Paracetamol'],
  'Common cold': ['Cetirizine', 'Cough Syrup'],
  'Strep Throat': ['Amoxicillin', 'Penicillin'],
  'Bronchitis': ['Amoxicillin', 'Cough Syrup'],
  'Pneumonia': ['Amoxicillin', 'Azithromycin'],
  'Migraine': ['Ibuprofen', 'Sumatriptan'],
  'Tension Headache': ['Paracetamol', 'Ibuprofen'],
  'Sinusitis': ['Amoxicillin', 'Cetirizine'],
  'Anemia': ['Iron Supplements', 'Vitamin B12'],
  'Hypothyroidism': ['Levothyroxine'],
  'Chronic Fatigue Syndrome': ['Multivitamins'],
  'Allergic Rhinitis': ['Cetirizine', 'Loratadine'],
  'Gastroenteritis': ['Oral Rehydration Salts'],
  'Food Poisoning': ['Loperamide']
};

const allSymptoms = Object.keys(symptomDiagnosisMap);
const symptomsInput = document.getElementById('symptoms');
const symptomsBox = document.getElementById('symptoms-suggestions');
const diagnosisInput = document.getElementById('diagnosis');
const diagnosisBox = document.getElementById('diagnosis-suggestions');
const medList = document.getElementById('med-list');

function init() {
  window.addEventListener('DOMContentLoaded', () => symptomsInput.focus());
  setupEventListeners();
  addMedicineRow();
}

function setupEventListeners() {
  symptomsInput.addEventListener('input', () => {
    showSuggestions(symptomsInput, symptomsBox, allSymptoms);
    updateDiagnosisSuggestions();
  });

  symptomsBox.addEventListener('click', e => {
    if (e.target.tagName === 'LI') {
      selectSuggestion(symptomsInput, symptomsBox, e.target.innerText);
    }
  });

  diagnosisInput.addEventListener('input', () => {
    const diagnoses = [];
    symptomsInput.value.split(',').map(s => s.trim()).filter(Boolean).forEach(symptom => {
      if (symptomDiagnosisMap[symptom]) {
        diagnoses.push(...symptomDiagnosisMap[symptom]);
      }
    });
    showSuggestions(diagnosisInput, diagnosisBox, [...new Set(diagnoses)]);
  });

  diagnosisBox.addEventListener('click', e => {
    if (e.target.tagName === 'LI') {
      selectSuggestion(diagnosisInput, diagnosisBox, e.target.innerText);
    }
  });

  symptomsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const currentValue = symptomsInput.value.trim();
      const lastTerm = currentValue.split(',').pop().trim();
      
      if (lastTerm && !symptomsBox.classList.contains('hidden')) {
        const firstSuggestion = symptomsBox.querySelector('li');
        if (firstSuggestion) {
          selectSuggestion(symptomsInput, symptomsBox, firstSuggestion.innerText);
        } else {
          symptomsInput.value = currentValue + ', ';
        }
      } else if (currentValue.endsWith(',')) {
        symptomsInput.value = currentValue.slice(0, -1).trim();
        moveToDiagnosis();
      } else if (lastTerm) {
        symptomsInput.value = currentValue + ', ';
      } else {
        moveToDiagnosis();
      }
    } else if (e.key === 'ArrowRight') {
      moveToDiagnosis();
    } else if (!symptomsBox.classList.contains('hidden') && 
               (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      navigateList(e, symptomsBox, symptomsInput, moveToDiagnosis);
    }
  });

  diagnosisInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const currentValue = diagnosisInput.value.trim();
      const lastTerm = currentValue.split(',').pop().trim();
      
      if (lastTerm && !diagnosisBox.classList.contains('hidden')) {
        const firstSuggestion = diagnosisBox.querySelector('li');
        if (firstSuggestion) {
          selectSuggestion(diagnosisInput, diagnosisBox, firstSuggestion.innerText);
        } else {
          diagnosisInput.value = currentValue + ', ';
        }
      } else if (currentValue.endsWith(',')) {
        diagnosisInput.value = currentValue.slice(0, -1).trim();
        moveToMedicines();
      } else if (lastTerm) {
        diagnosisInput.value = currentValue + ', ';
      } else {
        moveToMedicines();
      }
    } else if (e.key === 'ArrowLeft') {
      symptomsInput.focus();
    } else if (!diagnosisBox.classList.contains('hidden') && 
               (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      navigateList(e, diagnosisBox, diagnosisInput, moveToMedicines);
    }
  });

  document.getElementById('recommend-btn').addEventListener('click', recommendMedicines);
}

function showSuggestions(inputEl, box, data) {
  const lastTerm = inputEl.value.split(',').pop().trim().toLowerCase();
  if (!lastTerm) return hideBox(box);
  
  const matches = data.filter(d => d.toLowerCase().startsWith(lastTerm));
  box.innerHTML = matches.map(m => `<li>${m}</li>`).join('');
  
  if (matches.length) {
    box.classList.remove('hidden');
    const firstItem = box.querySelector('li');
    if (firstItem) firstItem.classList.add('highlight');
  } else {
    hideBox(box);
  }
}

function selectSuggestion(inputEl, box, value) {
  let terms = inputEl.value.split(',').map(t => t.trim()).filter(Boolean);
  terms[terms.length - 1] = value;
  inputEl.value = terms.join(', ') + ', ';
  hideBox(box);
  inputEl.focus();
  
  if (inputEl === symptomsInput) {
    updateDiagnosisSuggestions();
  }
}

function updateDiagnosisSuggestions() {
  const symptoms = symptomsInput.value.split(',').map(s => s.trim()).filter(Boolean);
  if (symptoms.length === 0) return;
  
  let possibleDiagnoses = [];
  symptoms.forEach(symptom => {
    if (symptomDiagnosisMap[symptom]) {
      possibleDiagnoses = [...new Set([...possibleDiagnoses, ...symptomDiagnosisMap[symptom]])];
    }
  });
  
  if (possibleDiagnoses.length > 0) {
    diagnosisBox.innerHTML = possibleDiagnoses.map(d => `<li>${d}</li>`).join('');
    diagnosisBox.classList.remove('hidden');
    const firstItem = diagnosisBox.querySelector('li');
    if (firstItem) firstItem.classList.add('highlight');
  } else {
    hideBox(diagnosisBox);
  }
}

function navigateList(e, box, inputEl, moveToNextField) {
  const items = box.querySelectorAll('li'); 
  if (!items.length) return;
  
  let index = Array.from(items).findIndex(it => it.classList.contains('highlight'));
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (index >= 0) items[index].classList.remove('highlight');
    index = (index + 1) % items.length;
    items[index].classList.add('highlight');
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (index >= 0) items[index].classList.remove('highlight');
    index = (index - 1 + items.length) % items.length;
    items[index].classList.add('highlight');
  }
}

function moveToDiagnosis() {
  diagnosisInput.focus();
}

function moveToMedicines() {
  const firstMedInput = document.querySelector('#med-list .med-input');
  if (firstMedInput) {
    firstMedInput.focus();
  } else {
    addMedicineRow();
  }
}

function recommendMedicines() {
  const diagnosis = diagnosisInput.value.trim();
  if (diagnosis && medicineRecommendations[diagnosis]) {
    medList.innerHTML = '';
    
    medicineRecommendations[diagnosis].forEach(med => {
      addMedicineRow(med, 1);
    });
    
    addMedicineRow();
  }
}

function addMedicineRow(medicine = '', quantity = 1) {
  const row = document.createElement('div');
  row.className = 'med-row';

  const delButton = document.createElement('button');
  delButton.className = 'delete-btn';
  delButton.innerHTML = '✕';
  delButton.addEventListener('click', () => row.remove());

  const medInput = document.createElement('input');
  medInput.className = 'med-input';
  medInput.value = medicine;
  medInput.setAttribute('list', 'medicines-list');
  medInput.placeholder = 'Medicine name';

  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.min = 1;
  qtyInput.value = quantity;
  qtyInput.className = 'qty-input';
  qtyInput.placeholder = 'Qty';

  medInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      qtyInput.focus();
    }
  });

  qtyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      addMedicineRow();
    }
  });

  row.appendChild(delButton);
  row.appendChild(medInput);
  row.appendChild(qtyInput);
  medList.appendChild(row);

  if (!medicine) {
    medInput.focus();
  }
}

function hideBox(box) {
  box.innerHTML = '';
  box.classList.add('hidden');
}

init();
