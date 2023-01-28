package main

import (
	"fmt"
	"math"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type mortgageParams struct {
	Loan     float64 `json:"loan"`
	Years    int     `json:"years"`
	Interest float64 `json:"interest"`
	Date     int64   `json:"date"`
}

type payment struct {
	Total    float64 `json:"total"`
	Interest float64 `json:"interest"`
	Debt     float64 `json:"debt"`
	Date     int64   `json:"date"`
	Loan     float64 `json:"loan"`
}

type mortgageCalculationResults struct {
	MonthPayment float64   `json:"monthPayment"`
	Overpayment  float64   `json:"overpayment"`
	Payments     []payment `json:"payments"`
}

func main() {
	router := gin.Default()
	router.Use(cors.Default())

	router.GET("/", getPing)
	router.POST("calculate", postCalculation)

	router.Run("localhost:9000")
}

func getPing(c *gin.Context) {
	c.Data(http.StatusOK, "text/plain", []byte("yeah"))
}

func postCalculation(c *gin.Context) {
	var params mortgageParams
	if err := c.BindJSON(&params); err != nil {
		fmt.Println(err)
		return
	}

	loan := params.Loan
	months := params.Years * 12
	monthInterest := params.Interest / 12 / 100
	totalInterest := math.Pow(float64(1+monthInterest), float64(months))

	// TODO Better round them at frontend
	monthPayment := cutDecimals(loan * monthInterest * totalInterest / (totalInterest - 1))
	overpayment := cutDecimals(monthPayment*float64(months) - loan)

	payments := make([]payment, months+1)
	number := 0
	for loan > 0 {
		interest := loan * monthInterest
		debt := monthPayment - interest
		total := interest + debt
		date := time.Unix(params.Date, 0).AddDate(0, number, 0).Unix()

		loan -= debt
		payments[number] = payment{
			Total:    cutDecimals(total),
			Interest: cutDecimals(interest),
			Debt:     cutDecimals(debt),
			Date:     date,
			Loan:     cutDecimals(loan),
		}
		number++
	}

	result := mortgageCalculationResults{
		MonthPayment: monthPayment,
		Overpayment:  overpayment,
		Payments:     payments,
	}
	c.JSON(http.StatusOK, result)
}

func cutDecimals(number float64) float64 {
	return math.Round(number*100) / 100
}
