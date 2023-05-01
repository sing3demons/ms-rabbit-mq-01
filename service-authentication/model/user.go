package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `json:"_id" bson:"_id"`
	Email     string             `json:"email" bson:"email,omitempty"`
	Name      string             `json:"name" bson:"name,omitempty"`
	Password  string             `json:"-" bson:"password,omitempty"`
	Role      string             `json:"role" bson:"role,omitempty"`
	DeletedAt time.Time          `json:"-" bson:"deleted_at,omitempty,default:null"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt,omitempty"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt,omitempty"`
}
