package repository

import (
	"errors"
	"luxetravel/internal/model"
	"sync"
)

type MemoryUserRepository struct {
	mtx   sync.RWMutex
	users map[string]model.User
}

func NewMemoryUserRepository() *MemoryUserRepository {
	return &MemoryUserRepository{
		users: make(map[string]model.User),
	}
}

func (m *MemoryUserRepository) Create(u model.User) error {
	m.mtx.Lock()
	defer m.mtx.Unlock()

	_, exist := m.users[u.Login]
	if exist {
		return errors.New("пользователь с таким логином уже существует")
	}

	m.users[u.Login] = u
	return nil
}

func (m *MemoryUserRepository) GetByLogin(login string) (model.User, error) {
	m.mtx.RLock()
	defer m.mtx.RUnlock()

	user, ok := m.users[login]
	if !ok {
		return model.User{}, errors.New("пользователь не найден")
	}
	return user, nil
}
