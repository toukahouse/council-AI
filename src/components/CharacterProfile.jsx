import './CharacterProfile.css';

export default function CharacterProfile({ characterData }) {
  const name = characterData?.name || 'Council AI';
  const avatar = characterData?.avatar || '/ai_avatar.png';
  const desc = characterData?.shortDesc || '🤖 ; Asisten AI cerdas yang siap membantu kamu';
  const author = characterData?.author || '@chatbot-council';

  return (
    <div className="char-profile" id="character-profile">
      {/* Decorative line */}
      <div className="char-profile__line" />

      <div className="char-profile__content">
        {/* Avatar */}
        <div className="char-profile__avatar-wrap">
          <img
            src={avatar}
            alt={name}
            className="char-profile__avatar"
          />
          <div className="char-profile__avatar-ring" />
          <span className="char-profile__avatar-glow" />
        </div>

        {/* Info */}
        <h2 className="char-profile__name">{name}</h2>
        <p className="char-profile__desc" dangerouslySetInnerHTML={{ __html: desc }}></p>
        <span className="char-profile__creator">Oleh {author}</span>
      </div>

      {/* Decorative line */}
      <div className="char-profile__line" />
    </div>
  );
}
