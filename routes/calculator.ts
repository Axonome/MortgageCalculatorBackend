var express = require("express");
var router = express.Router();

type Payments = Array<Record<string, number>>;

interface MortgageCalculationResultsData {
    monthPayment: number,
    overpayment: number,
    payments: Payments,
}

function round(value: number): number {
    return Math.round(value * 100) / 100;
}

const maxDelay = 3000;

router.get('/', function(req: any, res: any) {
    res.send("yeah");
});

router.post('/calculate', async function(req: any, res: any) {
    console.log(req.body);

    let loan = req.body.loan;
    const months = req.body.years * 12;
    const monthInterest = req.body.interest / 12 / 100;

    const totalInterest = (1 + monthInterest) ** months;
    let monthPayment = loan * monthInterest * totalInterest / (totalInterest - 1);
    let overpayment = monthPayment * months - loan;

    let payments: Payments = [];

    let number = 0;
    while (loan > 0) {
        let interest = loan * monthInterest;
        let debt = monthPayment - interest;
        let total = round(interest + debt);
        interest = round(interest);
        debt = round(debt);
        let date = new Date(req.body.date);
        date.setMonth(date.getMonth() + number);
        loan -= debt;
        payments.push({
            total: total,
            interest: interest,
            debt: debt,
            date: date.getTime(),
            loan: round(loan)
        });

        number++;
    }
    console.log(number);
    
    await new Promise(r => setTimeout(r, Math.random() * maxDelay));

    let result: MortgageCalculationResultsData = {
        monthPayment: round(monthPayment),
        overpayment: round(overpayment),
        payments: payments
    };

    res.json(JSON.stringify(result));
});

module.exports = router;