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

window.addEventListener('DOMContentLoaded', () => symptomsInput.focus());

function showSuggestions(inputEl, box, data) {
  const lastTerm = inputEl.value.split(',').pop().trim().toLowerCase();
  if (!lastTerm) return hideBox(box);
  const matches = data.filter(d => d.toLowerCase().startsWith(lastTerm));
  box.innerHTML = matches.map(m => `<li>${m}</li>`).join('');
  matches.length ? box.classList.remove('hidden') : hideBox(box);
}

function selectSuggestion(inputEl, box, value) {
  let terms = inputEl.value.split(',').map(t => t.trim()).filter(Boolean);
  terms[terms.length - 1] = value;
  inputEl.value = terms.join(', ') + ', ';
  hideBox(box); inputEl.focus();
  
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
  } else {
    hideBox(diagnosisBox);
  }
}

function navigateList(e, box, inputEl, moveToNextField) {
  const items = box.querySelectorAll('li'); 
  if (!items.length) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveToNextField();
    }
    return;
  }
  
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
  } else if (e.key === 'Enter' && index >= 0) {
    e.preventDefault();
    selectSuggestion(inputEl, box, items[index].innerText);
  }
}

function moveToDiagnosis() {
  diagnosisInput.focus();
}

function moveToMedicines() {
  const firstMedInput = document.querySelector('#med-list input.med-input');
  if (firstMedInput) {
    firstMedInput.focus();
  } else {
    addMedicineRow();
  }
}

symptomsInput.addEventListener('input', () => {
  showSuggestions(symptomsInput, symptomsBox, allSymptoms);
  updateDiagnosisSuggestions();
});

symptomsBox.addEventListener('click', e => e.target.tagName === 'LI' && selectSuggestion(symptomsInput, symptomsBox, e.target.innerText));

diagnosisInput.addEventListener('input', () => {
  const diagnoses = [];
  symptomsInput.value.split(',').map(s => s.trim()).filter(Boolean).forEach(symptom => {
    if (symptomDiagnosisMap[symptom]) {
      diagnoses.push(...symptomDiagnosisMap[symptom]);
    }
  });
  showSuggestions(diagnosisInput, diagnosisBox, [...new Set(diagnoses)]);
});

diagnosisBox.addEventListener('click', e => e.target.tagName === 'LI' && selectSuggestion(diagnosisInput, diagnosisBox, e.target.innerText));

symptomsInput.addEventListener('keydown', (e) => {
  if (!symptomsBox.classList.contains('hidden') && 
      (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
    navigateList(e, symptomsBox, symptomsInput, moveToDiagnosis);
  } else if (e.key === 'Enter') {
    const trimmed = symptomsInput.value.trim();
    if (trimmed.endsWith(',')) {
      e.preventDefault();
      symptomsInput.value = trimmed.slice(0, -1).trim();
      moveToDiagnosis();
    }
  } else if (e.key === 'ArrowRight') {
    moveToDiagnosis();
  } else if (e.key === 'ArrowDown' && symptomsBox.classList.contains('hidden')) {
    moveToMedicines();
  }
});

diagnosisInput.addEventListener('keydown', (e) => {
  if (!diagnosisBox.classList.contains('hidden') && 
      (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
    navigateList(e, diagnosisBox, diagnosisInput, moveToMedicines);
  } else if (e.key === 'Enter') {
    const trimmed = diagnosisInput.value.trim();
    if (trimmed.endsWith(',')) {
      e.preventDefault();
      diagnosisInput.value = trimmed.slice(0, -1).trim();
      moveToMedicines();
    }
  } else if (e.key === 'ArrowLeft') {
    symptomsInput.focus();
  } else if (e.key === 'ArrowDown' && diagnosisBox.classList.contains('hidden')) {
    moveToMedicines();
  }
});

document.getElementById('recommend-btn').addEventListener('click', () => {
  const diagnosis = diagnosisInput.value.trim();
  if (diagnosis && medicineRecommendations[diagnosis]) {
    medList.innerHTML = '';
    
    medicineRecommendations[diagnosis].forEach(med => {
      const row = document.createElement('div');
      
      const delButton = document.createElement('button');
      delButton.innerText = '✕';
      delButton.className = 'delete-btn';
      delButton.addEventListener('click', () => row.remove());
      
      const medInput = document.createElement('input');
      medInput.className = 'med-input';
      medInput.value = med;
      medInput.setAttribute('list', 'medicines-list');
      
      const qtyInput = document.createElement('input');
      qtyInput.type = 'number';
      qtyInput.min = 1;
      qtyInput.value = 1;
      qtyInput.className = 'qty-input';
      
      row.appendChild(delButton);
      row.appendChild(medInput);
      row.appendChild(qtyInput);
      medList.appendChild(row);
      
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
    });
    
    addMedicineRow();
  }
});

const medList = document.getElementById('med-list');
function addMedicineRow() {
  const row = document.createElement('div');

  const delButton = document.createElement('button');
  delButton.innerText = '✕';
  delButton.className = 'delete-btn';
  delButton.addEventListener('click', () => row.remove());

  const medInput = document.createElement('input');
  medInput.className = 'med-input';
  medInput.placeholder = 'Medicine';
  medInput.setAttribute('list', 'medicines-list');

  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.min = 1;
  qtyInput.placeholder = 'Qty';
  qtyInput.className = 'qty-input';

  row.appendChild(delButton);
  row.appendChild(medInput);
  row.appendChild(qtyInput);
  medList.appendChild(row);
  medInput.focus();

  medInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      qtyInput.focus();
    }
  });
  qtyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (medInput.value.trim() && qtyInput.value) {
        addMedicineRow();
      }
    } else if (e.key === 'ArrowRight') {
      document.getElementById('recommend-btn').focus();
    }
  });
}

addMedicineRow();

function hideBox(box) {
  box.innerHTML = '';
  box.classList.add('hidden');
}