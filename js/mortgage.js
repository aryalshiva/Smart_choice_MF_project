document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('mortgage-form');
    const repaymentAmountEl = document.getElementById('total-repayment-amount');
    const interestPaidEl = document.getElementById('interest-paid');
    const monthlyRepaymentEl = document.getElementById('monthly-repayment-amount');
    const resultsTableBody = document.querySelector('#results-table tbody');
    const graphTypeSelect = document.getElementById('graph-type');
    const chartCanvas = document.getElementById('mortgage-chart');
    let mortgageChart;

    function formatCurrency(value, currencySymbol) {
        return `${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }

    function calculateMortgage(data) {
        const {
            totalMortgage,
            depositPercentage,
            interestRate,
            loanDuration,
            currencySymbol,
            calculationPeriod
        } = data;

        const depositAmount = totalMortgage * (depositPercentage / 100);
        const loanAmount = totalMortgage - depositAmount;
        const monthlyInterestRate = interestRate / 100 / 12;
        const numberOfPayments = loanDuration * 12;

        const monthlyPayment = loanAmount * monthlyInterestRate /
            (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));

        let balance = loanAmount;
        let amortizationSchedule = [];
        let totalInterestPaid = 0;

        for (let i = 1; i <= numberOfPayments; i++) {
            const interest = balance * monthlyInterestRate;
            const principal = monthlyPayment - interest;
            balance -= principal;
            if (balance < 0) balance = 0;

            const year = Math.ceil(i / 12);
            const month = (i % 12 === 0) ? 12 : (i % 12);

            amortizationSchedule.push({
                year,
                month,
                principalPaid: principal,
                interestPaid: interest,
                remainingBalance: balance
            });

            totalInterestPaid += interest;
        }

        return {
            amortizationSchedule,
            totalRepayment: monthlyPayment * numberOfPayments,
            totalInterestPaid,
            monthlyPayment,
            currencySymbol,
            calculationPeriod
        };
    }

    function updateResults(values) {
        const {
            amortizationSchedule,
            totalRepayment,
            totalInterestPaid,
            monthlyPayment,
            currencySymbol,
            calculationPeriod
        } = values;

        repaymentAmountEl.textContent = formatCurrency(totalRepayment, currencySymbol);
        interestPaidEl.textContent = formatCurrency(totalInterestPaid, currencySymbol);
        monthlyRepaymentEl.textContent = formatCurrency(monthlyPayment, currencySymbol);

        resultsTableBody.innerHTML = '';
        const grouped = amortizationSchedule.reduce((acc, entry) => {
            const key = calculationPeriod === 'yearly' ? `Y${entry.year}` : `Y${entry.year}-M${entry.month}`;
            if (!acc[key]) acc[key] = { ...entry, count: 1 };
            else {
                acc[key].principalPaid += entry.principalPaid;
                acc[key].interestPaid += entry.interestPaid;
                acc[key].remainingBalance = entry.remainingBalance;
                acc[key].count++;
            }
            return acc;
        }, {});

        for (let key in grouped) {
            const entry = grouped[key];
            const row = document.createElement('tr');
            const year = entry.year;
            const month = calculationPeriod === 'yearly' ? '-' : entry.month;
            row.innerHTML = `
                <td>${year}</td>
                <td>${month}</td>
                <td>${formatCurrency(entry.principalPaid, currencySymbol)}</td>
                <td>${formatCurrency(entry.interestPaid, currencySymbol)}</td>
                <td>${formatCurrency(entry.remainingBalance, currencySymbol)}</td>
            `;
            resultsTableBody.appendChild(row);
        }

        updateChart(amortizationSchedule, calculationPeriod, currencySymbol);
    }

    function updateChart(schedule, calculationPeriod, currencySymbol) {
        const labels = schedule.map(e =>
            calculationPeriod === 'yearly'
                ? `Year ${e.year}`
                : `Y${e.year}-M${e.month}`
        );

        const principalData = schedule.map(e => e.principalPaid);
        const interestData = schedule.map(e => e.interestPaid);

        if (mortgageChart) mortgageChart.destroy();

        const chartType = graphTypeSelect.value;

        let datasets = [];
        if (chartType === 'repayment') {
            datasets = [
                {
                    label: 'Principal Paid',
                    data: principalData,
                    backgroundColor: '#4CAF50',
                    stack: 'stack1'
                },
                {
                    label: 'Interest Paid',
                    data: interestData,
                    backgroundColor: '#f39c12',
                    stack: 'stack1'
                }
            ];
        } else if (chartType === 'equity') {
            let cumulativePrincipal = 0;
            const equityData = schedule.map(e => {
                cumulativePrincipal += e.principalPaid;
                return cumulativePrincipal;
            });
            datasets = [
                {
                    label: 'Equity Accumulated',
                    data: equityData,
                    backgroundColor: '#3498db',
                }
            ];
        }

        mortgageChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) =>
                                `${ctx.dataset.label}: ${formatCurrency(ctx.raw, currencySymbol)}`
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            maxRotation: 90,
                            minRotation: 45,
                            autoSkip: true,
                            maxTicksLimit: 20
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true
                    }
                }
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            totalMortgage: parseFloat(form['total-mortgage'].value),
            interestRate: parseFloat(form['interest-rate'].value),
            depositPercentage: parseFloat(form['deposit-percentage'].value),
            loanDuration: parseInt(form['loan-duration'].value),
            currencySymbol: form['currency'].value,
            calculationPeriod: form['calculation-period'].value
        };
        const results = calculateMortgage(formData);
        updateResults(results);
    });

    graphTypeSelect.addEventListener('change', () => {
        const formData = {
            totalMortgage: parseFloat(form['total-mortgage'].value),
            interestRate: parseFloat(form['interest-rate'].value),
            depositPercentage: parseFloat(form['deposit-percentage'].value),
            loanDuration: parseInt(form['loan-duration'].value),
            currencySymbol: form['currency'].value,
            calculationPeriod: form['calculation-period'].value
        };
        const results = calculateMortgage(formData);
        updateChart(results.amortizationSchedule, results.calculationPeriod, results.currencySymbol);
    });

    // Trigger initial calculation on page load
    form.dispatchEvent(new Event('submit'));
});
