// Tab switching functionality
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.calculator').forEach(calc => calc.classList.remove('active'));
        document.querySelector(tab.dataset.target).classList.add('active');
    });
});

// Initialize Chart
let financialChart;
const ctx = document.getElementById('financialChart').getContext('2d');

function initializeChart() {
    financialChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '',
                data: [],
                backgroundColor: 'rgba(67, 189, 250, 0.7)',
                borderColor: 'rgba(35, 25, 79, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '$' + context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Initialize chart when page loads
window.addEventListener('load', initializeChart);

// Helper function to update chart
function updateChart(labels, data, label, chartType = 'bar') {
    financialChart.destroy();
    financialChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: [
                    'rgba(67, 189, 250, 0.7)',
                    'rgba(35, 25, 79, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(67, 189, 250, 1)',
                    'rgba(35, 25, 79, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '$' + context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Future Value Calculator
document.getElementById('calculate-future-value').addEventListener('click', () => {
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) / 100 || 0;
    const time = parseFloat(document.getElementById('time').value) || 0;
    const compounds = parseInt(document.getElementById('compounds').value) || 1;

    const futureValue = principal * Math.pow((1 + rate / compounds), compounds * time);
    document.getElementById('result-future-value').innerText = `Future Value: $${futureValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    
    // Chart data for future value
    const labels = ['Principal', 'Future Value'];
    const data = [principal, futureValue];
    updateChart(labels, data, 'Future Value Calculation');
});

// Loan Calculator
document.getElementById('calculate-loan').addEventListener('click', () => {
    const principal = parseFloat(document.getElementById('loan-principal').value) || 0;
    const rate = parseFloat(document.getElementById('loan-rate').value) / 100 / 12 || 0;
    const time = parseFloat(document.getElementById('loan-time').value) * 12 || 0;

    let payment, totalPayment, interestAmount;
    
    if (rate === 0) {
        payment = principal / time;
        totalPayment = principal;
        interestAmount = 0;
    } else {
        payment = principal * rate * Math.pow(1 + rate, time) / (Math.pow(1 + rate, time) - 1);
        totalPayment = payment * time;
        interestAmount = totalPayment - principal;
    }

    document.getElementById('result-loan-payment').innerHTML =
        `Monthly EMI: $${payment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<br>Total Amount Payable: $${totalPayment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<br>Interest Amount: $${interestAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    
    // Chart data for loan
    const labels = ['Principal', 'Interest'];
    const data = [principal, interestAmount];
    updateChart(labels, data, 'Loan Breakdown', 'pie');
});

// Savings Calculator
document.getElementById('calculate-savings').addEventListener('click', () => {
    const principal = parseFloat(document.getElementById('savings-principal').value) || 0;
    const rate = parseFloat(document.getElementById('savings-rate').value) / 100 || 0;
    const time = parseFloat(document.getElementById('savings-time').value) || 0;
    const contribution = parseFloat(document.getElementById('savings-contribution').value) || 0;

    let futureValue = principal * Math.pow(1 + rate, time);
    if (rate > 0) {
        futureValue += contribution * (Math.pow(1 + rate, time) - 1) / rate;
    } else {
        futureValue += contribution * time;
    }
    
    const interestEarned = futureValue - principal - (contribution * time);

    document.getElementById('result-savings').innerHTML = 
        `Total Savings: $${futureValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<br>Interest Earned: $${interestEarned.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    
    // Chart data for savings
    const labels = ['Initial Savings', 'Contributions', 'Interest Earned'];
    const data = [principal, contribution * time, interestEarned];
    updateChart(labels, data, 'Savings Breakdown', 'pie');
});

// Mortgage Calculator
document.getElementById('calculate-mortgage').addEventListener('click', () => {
    const principal = parseFloat(document.getElementById('mortgage-amount').value) || 0;
    const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
    const annualRate = parseFloat(document.getElementById('mortgage-rate').value) / 100 || 0;
    const years = parseFloat(document.getElementById('mortgage-time').value) || 0;
    
    const loanAmount = principal - downPayment;
    if (loanAmount <= 0) {
        document.getElementById('result-mortgage').innerHTML = 'Down payment cannot be greater than or equal to the mortgage amount.';
        return;
    }

    const monthlyRate = annualRate / 12;
    const numberOfPayments = years * 12;
    
    let monthlyPayment;
    if (monthlyRate === 0) {
        monthlyPayment = loanAmount / numberOfPayments;
    } else {
        monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }
    
    const totalPayment = monthlyPayment * numberOfPayments;
    const interestAmount = totalPayment - loanAmount;

    document.getElementById('result-mortgage').innerHTML = 
        `Monthly Payment: $${monthlyPayment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<br>Total Mortgage Payable: $${totalPayment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<br>Mortgage Interest: $${interestAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    
    // Chart data for mortgage
    const labels = ['Loan Amount', 'Interest'];
    const data = [loanAmount, interestAmount];
    updateChart(labels, data, 'Mortgage Breakdown', 'pie');
});

// Investment Calculator
document.getElementById('calculate-investment').addEventListener('click', () => {
    const principal = parseFloat(document.getElementById('investment-principal').value) || 0;
    const rate = parseFloat(document.getElementById('investment-rate').value) / 100 || 0;
    const time = parseFloat(document.getElementById('investment-time').value) || 0;

    const futureValue = principal * Math.pow(1 + rate, time);
    const profitAmount = futureValue - principal;

    document.getElementById('result-investment').innerHTML = 
        `Total Return: $${futureValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<br>Profit Amount: $${profitAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    
    // Chart data for investment
    const labels = ['Initial Investment', 'Profit'];
    const data = [principal, profitAmount];
    updateChart(labels, data, 'Investment Breakdown');
});