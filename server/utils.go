package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"

	texttospeech "cloud.google.com/go/texttospeech/apiv1"
	"cloud.google.com/go/texttospeech/apiv1/texttospeechpb"
	"cloud.google.com/go/translate"
	"golang.org/x/text/language"
)

func translatedText(targetLanguage, text string) (string, error) {
	ctx := context.Background()

	lang, err := language.Parse(targetLanguage)
	if err != nil {
		return "", fmt.Errorf("language.Parse: %w", err)
	}

	client, err := translate.NewClient(ctx)
	if err != nil {
		return "", err
	}
	defer client.Close()

	resp, err := client.Translate(ctx, []string{text}, lang, nil)
	if err != nil {
		return "", fmt.Errorf("Translate: %w", err)
	}
	if len(resp) == 0 {
		return "", fmt.Errorf("Translate returned empty response to text: %s", text)
	}
	return resp[0].Text, nil
}

func detectLanguage(text string) (*translate.Detection, error) {
	ctx := context.Background()
	client, err := translate.NewClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("translate.NewClient: %w", err)
	}
	defer client.Close()
	lang, err := client.DetectLanguage(ctx, []string{text})
	if err != nil {
		return nil, fmt.Errorf("DetectLanguage: %w", err)
	}
	if len(lang) == 0 || len(lang[0]) == 0 {
		return nil, fmt.Errorf("DetectLanguage return value empty")
	}
	return &lang[0][0], nil
}

func synthesizeText(w io.Writer, text, lang string) (string, error) {
	ctx := context.Background()

	client, err := texttospeech.NewClient(ctx)
	if err != nil {
		return "", err
	}
	defer client.Close()

	req := texttospeechpb.SynthesizeSpeechRequest{
		Input: &texttospeechpb.SynthesisInput{
			InputSource: &texttospeechpb.SynthesisInput_Text{Text: text},
		},
		// Note: the voice can also be specified by name.
		// Names of voices can be retrieved with client.ListVoices().
		Voice: &texttospeechpb.VoiceSelectionParams{
			LanguageCode: lang,
			SsmlGender:   texttospeechpb.SsmlVoiceGender_MALE,
		},
		AudioConfig: &texttospeechpb.AudioConfig{
			AudioEncoding: texttospeechpb.AudioEncoding_MP3,
		},
	}

	resp, err := client.SynthesizeSpeech(ctx, &req)
	if err != nil {
		fmt.Println("There was an error:", err)
		return "", err
	}

	response := resp.AudioContent
	base64String := base64.StdEncoding.EncodeToString(response)

	return base64String, nil
}
