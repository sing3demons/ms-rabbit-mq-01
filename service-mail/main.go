package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/smtp"
	"os"

	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
)

func sendGoMail(identity string, to string) {
	username := os.Getenv("GMAIL_USERNAME")
	password := os.Getenv("GMAIL_PASSWORD")
	host := "smtp.gmail.com"
	auth := smtp.PlainAuth(identity, username, password, host)

	var s []string
	s = append(s, to)
	msg := "Subject: " + "Hello!" + "\n" + "Hello, this is a test email."

	err := smtp.SendMail(
		host+":587",
		auth,
		username,
		s,
		[]byte(msg),
	)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println("Successfully sent email to: ", to)
}

func main() {
	log.Println("Starting consumer...")
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file")
	}

	conn, err := amqp.Dial(os.Getenv("RABBITMQ_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	fmt.Println("Successfully connected to RabbitMQ")

	ConsumeRabbitMQ(conn)

}

type User struct {
	ID    string `json:"_id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

func ConsumeRabbitMQ(conn *amqp.Connection) {
	ch, err := conn.Channel()
	if err != nil {
		log.Fatal(err)
	}
	defer ch.Close()

	msgs, err := ch.Consume("mail-queue", "", true, false, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}

	var forever chan struct{}

	go func() {
		for d := range msgs {
			if d.Type == "Created" {
				fmt.Printf("Received a message: %s\n", d.Body)
				fmt.Printf("Exchange: %s\n", d.Type)
				user := User{}
				json.Unmarshal(d.Body, &user)
				fmt.Println(user)
				sendGoMail(user.ID, user.Email)
			}

			// fmt.Printf("Done")
			// d.Ack(true)
		}
	}()
	<-forever
}
