package user

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sing3demons/service-authen/response"
	"go.mongodb.org/mongo-driver/bson"
)

type user struct {
	service *userService
}

func NewUserHandler(service *userService) *user {
	return &user{service: service}
}

func (u *user) GetUserById(c *gin.Context) {
	id := c.Param("id")
	user, err := u.service.FindById(id)
	if err != nil {
		response.ResponseJsonWithLogger(c, http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}

	response.ResponseJsonWithLogger(c, http.StatusOK, gin.H{"user": user})
}

func (u *user) Profile(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	user, err := u.service.FindById(userID)

	if err != nil {
		// c.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		response.ResponseJsonWithLogger(c, http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}

	// c.JSON(200, gin.H{"profile": user})
	response.ResponseJsonWithLogger(c, http.StatusOK, gin.H{"profile": user})
}

func (u *user) FindAll(c *gin.Context) {
	var filter bson.D = bson.D{
		{Key: "deleted_at", Value: bson.M{"$exists": false}},
	}

	if c.Query("name") != "" {
		filter = append(filter, bson.E{Key: "name", Value: bson.M{"$regex": c.Query("name")}})
	}

	users, err := u.service.FindAll(filter)

	if err != nil {
		// c.JSON(500, gin.H{"message": err.Error()})
		response.ResponseJsonWithLogger(c, http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	// c.JSON(200, gin.H{
	// 	"users": users,
	// })
	response.ResponseJsonWithLogger(c, http.StatusOK, gin.H{"users": users})
}

func (u *user) Register(c *gin.Context) {
	var body Register

	if err := c.ShouldBindJSON(&body); err != nil {
		// c.JSON(400, gin.H{"message": err.Error()})
		response.ResponseJsonWithLogger(c, http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	r, err := u.service.Register(body)
	if err != nil {
		c.JSON(400, gin.H{
			"message": err.Error(),
		})
		return
	}

	// c.JSON(http.StatusCreated, gin.H{
	// 	"message": "success",
	// 	"_id":     r,
	// })
	response.ResponseJsonWithLogger(c, http.StatusCreated, gin.H{"message": "success", "_id": r})
}

func (u *user) Login(c *gin.Context) {
	var body UserLogin

	if err := c.ShouldBindJSON(&body); err != nil {

		// c.JSON(400, gin.H{"message": err.Error()})
		response.ResponseJsonWithLogger(c, http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	t, err := u.service.Login(body)
	if err != nil {
		// c.JSON(400, gin.H{"message": err.Error()})
		response.ResponseJsonWithLogger(c, http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	// c.JSON(http.StatusOK, t)
	response.ResponseJsonWithLogger(c, http.StatusOK, t)
}

func (u *user) UpdateUser(c *gin.Context) {
	var body UpdateUser
	if err := c.ShouldBindJSON(&body); err != nil {
		response.ResponseJsonWithLogger(c, http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	userID := c.MustGet("user_id").(string)
	id := c.Param("id")
	if id != userID {
		response.ResponseJsonWithLogger(c, http.StatusUnauthorized, gin.H{"message": "unauthorized"})
		return
	}

	err := u.service.UpdateUser(userID, body)
	if err != nil {
		response.ResponseJsonWithLogger(c, http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	response.ResponseJsonWithLogger(c, http.StatusOK, gin.H{"message": "update success"})
}

func (u *user) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	role := c.MustGet("role").(string)
	fmt.Println(role)
	if role != "admin" {
		response.ResponseJsonWithLogger(c, http.StatusUnauthorized, gin.H{"message": "unauthorized"})
		return
	}

	err := u.service.DeleteUser(id)
	if err != nil {
		response.ResponseJsonWithLogger(c, http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	response.ResponseJsonWithLogger(c, http.StatusOK, gin.H{"message": "delete success"})
}
