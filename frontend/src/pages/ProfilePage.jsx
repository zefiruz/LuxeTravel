import { useEffect, useState } from "react";
import { PencilLine, Check, X } from "lucide-react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext"; 
import "../styles/ProfilePage.css";

// const fallbackProfile = {
//   lastName: "Иванов",
//   firstName: "Иван",
//   middleName: "Иванович",
//   email: "pochta@mail.ru",
//   phone: "+7 (910)-123-45-67",
// };

function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const mapUserData = (u) => {
    if (!u) return fallbackProfile;
    return {
      lastName: u.lastName || "",
      firstName: u.firstName || "",
      middleName: u.middleName || "",
      email: u.email || "",
      phone: u.phone || "",
    };
  };

  const [profile, setProfile] = useState(() => mapUserData(user));
  const [draftProfile, setDraftProfile] = useState(() => mapUserData(user));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const freshData = mapUserData(user);
    setProfile(freshData);
    setDraftProfile(freshData);
  }, [user]);

  const handleStartEditing = () => {
    setDraftProfile(profile);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setDraftProfile(profile);
    setIsEditing(false);
  };

  // 2. ИСПОЛЬЗУЕМ ОБНОВЛЕНИЕ ВМЕСТО РЕГИСТРАЦИИ
  const handleSaveEditing = async () => {
    if (user) {
      const success = await updateProfile(draftProfile);
      if (success) {
        setProfile(draftProfile);
        setIsEditing(false);
      } else {
        alert("Не удалось сохранить изменения");
      }
    }
  };

  const handleChange = (field, value) => {
    setDraftProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const currentData = isEditing ? draftProfile : profile;

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-page__content">
        <section className="profile-card">
          <h1 className="profile-card__title">Профиль</h1>
          <div className="profile-card__body">
            <div className="profile-card__avatar" />
            <div className="profile-info-card">
              {!isEditing && (
                <button
                  type="button"
                  className="profile-info-card__edit-btn"
                  onClick={handleStartEditing}
                >
                  <PencilLine className="profile-info-card__edit-icon" />
                </button>
              )}

              <div className="profile-info-card__grid">
                {/* Фамилия */}
                <span className="profile-info-card__label">Фамилия:</span>
                {isEditing ? (
                  <input
                    className="profile-info-card__input"
                    value={currentData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                ) : (
                  <span className="profile-info-card__value">{currentData.lastName}</span>
                )}

                {/* Имя */}
                <span className="profile-info-card__label">Имя:</span>
                {isEditing ? (
                  <input
                    className="profile-info-card__input"
                    value={currentData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                ) : (
                  <span className="profile-info-card__value">{currentData.firstName}</span>
                )}

                {/* Отчество */}
                <span className="profile-info-card__label">Отчество:</span>
                {isEditing ? (
                  <input
                    className="profile-info-card__input"
                    value={currentData.middleName}
                    onChange={(e) => handleChange("middleName", e.target.value)}
                  />
                ) : (
                  <span className="profile-info-card__value">{currentData.middleName}</span>
                )}

                {/* Email (обычно только для чтения, но оставим как в дизайне) */}
                <span className="profile-info-card__label">Email:</span>
                {isEditing ? (
                  <input
                    className="profile-info-card__input"
                    type="email"
                    value={currentData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                ) : (
                  <span className="profile-info-card__value">{currentData.email}</span>
                )}

                {/* Телефон */}
                <span className="profile-info-card__label">Номер телефона:</span>
                {isEditing ? (
                  <input
                    className="profile-info-card__input"
                    value={currentData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                ) : (
                  <span className="profile-info-card__value">{currentData.phone}</span>
                )}
              </div>

              {isEditing && (
                <div className="profile-info-card__actions">
                  <button
                    type="button"
                    className="profile-info-card__action-btn"
                    onClick={handleSaveEditing}
                  >
                    <Check className="profile-info-card__action-icon profile-info-card__action-icon--save" />
                  </button>
                  <button
                    type="button"
                    className="profile-info-card__action-btn"
                    onClick={handleCancelEditing}
                  >
                    <X className="profile-info-card__action-icon profile-info-card__action-icon--cancel" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProfilePage;