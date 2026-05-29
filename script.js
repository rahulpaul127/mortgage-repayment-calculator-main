document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mortgage-form');
  const clearBtn = document.getElementById('clear-all');
  
  const amountInput = document.getElementById('mortgage-amount');
  const termInput = document.getElementById('mortgage-term');
  const rateInput = document.getElementById('interest-rate');
  const typeInputs = document.querySelectorAll('input[name="type"]');
  const radioLabels = document.querySelectorAll('.radio-label');

  const emptyResults = document.getElementById('results-empty');
  const completedResults = document.getElementById('results-completed');
  const monthlyRepaymentEl = document.getElementById('monthly-repayment');
  const totalRepaymentEl = document.getElementById('total-repayment');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatInputNumber = (e) => {
    let value = e.target.value.replace(/[^\d.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (value) {
      const splitValue = value.split('.');
      splitValue[0] = splitValue[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      e.target.value = splitValue.join('.');
    } else {
      e.target.value = '';
    }
  };

  amountInput.addEventListener('input', formatInputNumber);

  typeInputs.forEach(input => {
    input.addEventListener('change', () => {
      radioLabels.forEach(label => label.classList.remove('selected'));
      if (input.checked) {
        input.closest('.radio-label').classList.add('selected');
      }
    });
  });

  clearBtn.addEventListener('click', () => {
    form.reset();
    radioLabels.forEach(label => label.classList.remove('selected'));
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('has-error');
      const wrapper = group.querySelector('.input-wrapper');
      if (wrapper) wrapper.classList.remove('error');
    });
    emptyResults.classList.remove('hidden');
    completedResults.classList.add('hidden');
  });

  const validateForm = () => {
    let isValid = true;

    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('has-error');
      const wrapper = group.querySelector('.input-wrapper');
      if (wrapper) wrapper.classList.remove('error');
    });

    if (!amountInput.value) {
      const group = amountInput.closest('.form-group');
      group.classList.add('has-error');
      group.querySelector('.input-wrapper').classList.add('error');
      isValid = false;
    }

    if (!termInput.value) {
      const group = termInput.closest('.form-group');
      group.classList.add('has-error');
      group.querySelector('.input-wrapper').classList.add('error');
      isValid = false;
    }

    if (!rateInput.value) {
      const group = rateInput.closest('.form-group');
      group.classList.add('has-error');
      group.querySelector('.input-wrapper').classList.add('error');
      isValid = false;
    }

    let typeSelected = false;
    typeInputs.forEach(input => {
      if (input.checked) typeSelected = true;
    });
    if (!typeSelected) {
      const group = document.querySelector('.radio-group').closest('.form-group');
      group.classList.add('has-error');
      isValid = false;
    }

    return isValid;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const principal = parseFloat(amountInput.value.replace(/,/g, ''));
    const years = parseFloat(termInput.value);
    const rate = parseFloat(rateInput.value);
    
    let type = '';
    typeInputs.forEach(input => {
      if (input.checked) type = input.value;
    });

    const monthlyRate = (rate / 100) / 12;
    const totalMonths = years * 12;

    let monthlyPayment = 0;
    let totalRepayment = 0;

    if (type === 'repayment') {
      if (monthlyRate === 0) {
         monthlyPayment = principal / totalMonths;
      } else {
         monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      }
      totalRepayment = monthlyPayment * totalMonths;
    } else if (type === 'interest-only') {
      monthlyPayment = principal * monthlyRate;
      totalRepayment = (monthlyPayment * totalMonths) + principal;
    }

    monthlyRepaymentEl.textContent = formatCurrency(monthlyPayment);
    totalRepaymentEl.textContent = formatCurrency(totalRepayment);

    emptyResults.classList.add('hidden');
    completedResults.classList.remove('hidden');
  });
});
