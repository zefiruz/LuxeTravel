package service

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

type GigaChatService interface {
	GenerateCities(tripIdea string, availableCities []string) ([]string, error)
}

type gigaChatService struct {
	AuthKey     string
	Client      *http.Client
	accessToken string
	expiresAt   time.Time
	mu          sync.RWMutex
}

func NewGigaChatService(authKey string) GigaChatService {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	return &gigaChatService{
		AuthKey: authKey,
		Client:  &http.Client{Transport: tr, Timeout: 30 * time.Second},
	}
}

func (s *gigaChatService) getAccessToken() (string, error) {
	s.mu.RLock()
	if s.accessToken != "" && time.Now().Before(s.expiresAt.Add(-1*time.Minute)) {
		s.mu.RUnlock()
		return s.accessToken, nil
	}
	s.mu.RUnlock()

	reqUrl := "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
	data := url.Values{}
	data.Set("scope", "GIGACHAT_API_PERS")

	req, _ := http.NewRequest("POST", reqUrl, strings.NewReader(data.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Accept", "application/json")
	req.Header.Add("RqUID", uuid.New().String())
	req.Header.Add("Authorization", "Basic "+s.AuthKey)

	res, err := s.Client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("oauth failed with status: %d", res.StatusCode)
	}

	var result struct {
		AccessToken string `json:"access_token"`
		ExpiresAt   int64  `json:"expires_at"`
	}

	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return "", err
	}

	s.accessToken = result.AccessToken
	s.expiresAt = time.UnixMilli(result.ExpiresAt)

	return result.AccessToken, nil
}

func (s *gigaChatService) GenerateCities(tripIdea string, availableCities []string) ([]string, error) {
	token, err := s.getAccessToken()
	if err != nil {
		return nil, fmt.Errorf("ошибка получения токена: %v", err)
	}

	citiesList := strings.Join(availableCities, ", ")

	systemPrompt := fmt.Sprintf(
		"Ты опытный туроператор по России. Твоя задача — предложить 3 - 5 городов из списка ниже, "+
			"которые лучше всего подходят под запрос пользователя. "+
			"ВЫБИРАЙ ТОЛЬКО ИЗ ЭТОГО СПИСКА: %s. "+
			"Верни только названия через запятую, без лишних слов.",
		citiesList,
	)

	payload := map[string]interface{}{
		"model": "GigaChat",
		"messages": []map[string]string{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": tripIdea},
		},
		"temperature": 0.7,
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "https://gigachat.devices.sberbank.ru/api/v1/chat/completions", bytes.NewBuffer(body))
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+token)

	res, err := s.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var chatRes struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(res.Body).Decode(&chatRes); err != nil || len(chatRes.Choices) == 0 {
		return nil, fmt.Errorf("ошибка парсинга ответа нейросети")
	}

	aiText := chatRes.Choices[0].Message.Content
	cities := strings.Split(aiText, ",")
	for i := range cities {
		cities[i] = strings.TrimSpace(cities[i])
	}

	return cities, nil
}
