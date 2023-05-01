package user

import (
	"context"
	"fmt"
	"time"

	"github.com/sing3demons/service-authen/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type repository struct {
	col *mongo.Collection
}

func NewRepository(col *mongo.Collection) *repository {
	return &repository{col: col}
}

func (r *repository) FindById(id string) (*model.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user model.User

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var filter bson.D = bson.D{
		{Key: "deleted_at", Value: bson.M{"$exists": false}},
		{Key: "_id", Value: objectID},
	}

	// err = r.col.FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
	err = r.col.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("user not found")
		}

		return nil, err
	}

	return &user, nil
}

func (r *repository) FindAll(filter any) ([]model.User, error) {
	fmt.Println(filter)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	users := []model.User{}

	cur, err := r.col.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	// cur.All(ctx, &users)
	for cur.Next(ctx) {
		var user model.User
		err := cur.Decode(&user)
		if err != nil {
			return nil, err

		}

		users = append(users, user)
	}
	return users, nil
}

func (r *repository) FindEmail(email string) (*model.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	var user model.User

	filter := bson.D{
		{Key: "deleted_at", Value: bson.M{"$exists": false}},
		{Key: "email", Value: email},
	}

	err := r.col.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}

		return nil, err
	}

	return &user, nil
}

func (r *repository) CreateUser(user Register) (interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	document := model.User{
		ID:        primitive.NewObjectID(),
		Email:     user.Email,
		Name:      user.Name,
		Password:  user.Password,
		Role:      "user",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	result, err := r.col.InsertOne(ctx, document)
	if err != nil {
		return nil, err
	}

	return result.InsertedID, nil
}

func (r *repository) UpdateUser(id string, user *model.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	user.UpdatedAt = time.Now()

	filter := bson.D{
		{Key: "deleted_at", Value: bson.M{"$exists": false}},
		{Key: "_id", Value: objectID},
	}

	update := bson.M{"$set": user}

	result, err := r.col.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	if result.ModifiedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}

func (r *repository) DeleteUser(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	filter := bson.M{
		"_id": userID,
		"deleted_at": bson.M{
			"$exists": false,
		},
	}

	updater := bson.D{
		primitive.E{
			Key: "$set",
			Value: bson.D{
				primitive.E{Key: "deleted_at", Value: time.Now()},
			},
		},
	}

	result, err := r.col.UpdateOne(ctx, filter, updater)
	if err != nil {
		return err
	}

	if result.ModifiedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}
