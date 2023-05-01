package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	logMiddleware "github.com/sing3demons/service-authen/logger"
	"github.com/sing3demons/service-authen/middleware"
	"github.com/sing3demons/service-authen/user"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

func Router(logger *zap.Logger, col *mongo.Collection) *gin.Engine {
	router := gin.Default()

	uRepo := user.NewRepository(col)
	uService := user.NewUserService(uRepo)
	user := user.NewUserHandler(uService)

	protected := middleware.DecodeToken()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	router.Use(logMiddleware.ZapLogger(logger))
	router.Use(logMiddleware.RecoveryWithZap(logger, true))

	authRoute := router.Group("/auth")
	{
		authRoute.POST("/signup", user.Register)
		authRoute.POST("/signin", user.Login)
	}

	userRoute := router.Group("/users")
	userRoute.Use(protected)
	{
		userRoute.GET("/profile", user.Profile)
		userRoute.GET("", user.FindAll)
		userRoute.GET("/:id", user.GetUserById)
		userRoute.PATCH("/:id", user.UpdateUser)
		userRoute.DELETE("/:id", user.DeleteUser)
	}

	return router
}
