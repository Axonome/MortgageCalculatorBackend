var express = require("express");
var router = express.Router();

function round(value) {
    return Math.round(value * 100) / 100;
}

router.get('/', function(req, res) {
    res.send("yeah");
});

router.post('/calculate', function(req, res) {
    console.log(req.body);

    let loan = req.body.loan;
    const months = req.body.years * 12;
    const monthInterest = req.body.interest / 12 / 100;

    const totalInterest = (1 + monthInterest) ** months;
    let monthPayment = loan * monthInterest * totalInterest / (totalInterest - 1);
    let overpayment = monthPayment * months - loan;

    let payments = []

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
            date: date,
            loan: round(loan)
        });

        number++;
    }
    console.log(number);
    
    res.json(
        JSON.stringify({
            monthPayment: round(monthPayment),
            overpayment: round(overpayment),
            payments: payments
        })
    );
});

module.exports = router;