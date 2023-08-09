package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/translate", func(c *gin.Context) {
		text := c.Query("text")
		targetLanguage := c.Query("target")

		translatedText, err := translatedText(targetLanguage, text)
		if err != nil {
			c.JSON(500, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(200, gin.H{
			"message": translatedText,
		})
	})

	router.GET("/detect", func(c *gin.Context) {
		text := c.Query("text")
		detectedLanguage, err := detectLanguage(text)
		if err != nil {
			c.JSON(500, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(200, gin.H{
			"message": detectedLanguage.Language,
		})
	})

	router.GET("/speak", func(c *gin.Context) {
		text := c.Query("text")
		lang := c.Query("lang")

		response, err := synthesizeText(c.Writer, text, lang)
		if err != nil {
			c.JSON(500, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{
			"message": response,
		})
	})

	router.GET("/checkhealth", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "OK",
		})
	})

	router.Run()
}
