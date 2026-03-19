package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	Login        string    `gorm:"uniqueIndex;not null"`
	PasswordHash string    `gorm:"not null"`
	Role         string    `gorm:"default:client"`
}

type UserInfo struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserId     uuid.UUID `gorm:"type:uuid;not null"`
	FirstName  string    `gorm:"size:100"`
	LastName   string    `gorm:"size:100"`
	MiddleName string    `gorm:"size:100"`
	Email      string    `gorm:"uniqueIndex;size:255"`
	Phone      string    `gorm:"size:20"`
}

type City struct {
	ID     uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title  string    `gorm:"uniqueIndex;not null"`
	Hotels []Hotel   `gorm:"foreignKey:CityId"`
}

type Hotel struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title       string    `gorm:"not null"`
	Description string    `gorm:"type:text"`
	CityId      uuid.UUID `gorm:"type:uuid;not null"`
	Email       string
	Address     string
	Rooms       []Room `gorm:"foreignKey:HotelId"`
}

type Room struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	HotelId   uuid.UUID `gorm:"type:uuid;not null"`
	MaxGuests int       `gorm:"not null"`
}

type Route struct {
	ID             uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	UserID         uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	StartDate      time.Time `json:"start_date"`
	EndDate        time.Time `json:"end_date"`
	TravelersCount int       `json:"travelers_count"`
	Mode           string    `json:"mode"`
	Cities         []string  `gorm:"serializer:json" json:"cities"` 
	TripIdea       string    `json:"trip_idea"`
	CreatedAt      time.Time `json:"created_at"`
}

type Booking struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	RoomId    uuid.UUID `gorm:"type:uuid;not null"`
	RouteId   uuid.UUID `gorm:"type:uuid;not null"`
	StartDate time.Time `gorm:"not null"`
	EndDate   time.Time `gorm:"not null"`
}
