import React from 'react';

interface SchoolMonWatermarkProps {
  school?: string;
  name?: string;
  className?: string;
}

export const SchoolMonWatermark: React.FC<SchoolMonWatermarkProps> = ({
  school = '',
  name = '',
  className = 'w-32 h-32',
}) => {
  const normSchool = (school || '').trim();
  const normName = (name || '').trim();

  // 1. 三条派 / 三日月宗近 (双弦月与垂露金星)
  if (normSchool.includes('三条') || normName.includes('三日月') || normName.includes('小狐丸') || normName.includes('石切丸')) {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="44" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.4" />
        <path
          d="M 28 80 C 12 65, 12 35, 32 20 C 43 11, 57 11, 68 20 C 88 35, 88 65, 72 80 C 82 66, 82 38, 65 24 C 56 17, 44 17, 35 24 C 18 38, 18 66, 28 80 Z"
          fill="currentColor"
          opacity="0.15"
        />
        <circle cx="50" cy="82" r="3.5" fill="currentColor" opacity="0.3" />
      </svg>
    );
  }

  // 2. 粟田口派 (一期一振、藤四郎兄弟) - 藤花藤蔓与菊纹徽
  if (normSchool.includes('粟田口') || normName.includes('藤四郎') || normName.includes('一期一振') || normName.includes('鸣狐')) {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="42" strokeWidth="1" opacity="0.3" />
        {/* Wisteria Petals cluster */}
        <circle cx="50" cy="30" r="8" fill="currentColor" opacity="0.12" />
        <circle cx="42" cy="45" r="7" fill="currentColor" opacity="0.14" />
        <circle cx="58" cy="45" r="7" fill="currentColor" opacity="0.14" />
        <circle cx="50" cy="60" r="6" fill="currentColor" opacity="0.16" />
        <circle cx="50" cy="72" r="4.5" fill="currentColor" opacity="0.18" />
        <path d="M 50 18 Q 50 82 50 84" strokeWidth="1.5" opacity="0.25" />
      </svg>
    );
  }

  // 3. 堀川派 (山姥切国广、山伏国广、堀川国广) - 八角重菱与山水纹
  if (normSchool.includes('堀川') || normName.includes('国广')) {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor">
        <rect x="25" y="25" width="50" height="50" rx="8" strokeWidth="1.5" opacity="0.25" />
        <rect x="25" y="25" width="50" height="50" rx="8" transform="rotate(45 50 50)" strokeWidth="1.2" opacity="0.25" />
        <circle cx="50" cy="50" r="14" fill="currentColor" opacity="0.12" />
      </svg>
    );
  }

  // 4. 左文字派 (江雪、宗三、小夜) - 梵字悲愿之月与三连星
  if (normSchool.includes('左文字') || normName.includes('左文字')) {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="42" strokeWidth="1.5" opacity="0.3" />
        <path d="M 30 30 Q 50 50 70 30 Q 50 75 30 30 Z" fill="currentColor" opacity="0.15" />
        <circle cx="50" cy="68" r="4" fill="currentColor" opacity="0.25" />
      </svg>
    );
  }

  // 5. 备前长船派 / 古备前 (烛台切光忠、大般若、莺丸等) - 典雅重樱与流云刀纹
  if (normSchool.includes('备前') || normSchool.includes('长船') || normName.includes('光忠') || normName.includes('莺丸')) {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="44" strokeWidth="1.2" opacity="0.3" />
        {/* 5 cherry blossoms petals */}
        {[0, 72, 144, 216, 288].map((angle, idx) => (
          <ellipse
            key={idx}
            cx="50"
            cy="32"
            rx="9"
            ry="16"
            transform={`rotate(${angle} 50 50)`}
            fill="currentColor"
            opacity="0.12"
          />
        ))}
        <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.2" />
      </svg>
    );
  }

  // 6. 加州 / 冲田总督 (加州清光、大和守安定) - 诚字新选组山形羽织纹与梅花纹
  if (normSchool.includes('加州') || normSchool.includes('大和守') || normName.includes('清光') || normName.includes('安定')) {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="42" strokeWidth="1.2" opacity="0.3" />
        {/* Sawtooth Dandara pattern */}
        <path
          d="M 20 62 L 35 44 L 50 62 L 65 44 L 80 62 L 72 72 L 28 72 Z"
          fill="currentColor"
          opacity="0.18"
        />
        <circle cx="50" cy="34" r="5" fill="currentColor" opacity="0.2" />
      </svg>
    );
  }

  // 7. 通用 / 其他名家派别 (古风太刀交刃重环)
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor">
      <circle cx="50" cy="50" r="44" strokeWidth="1.2" opacity="0.25" />
      <circle cx="50" cy="50" r="34" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.3" />
      {/* Crossed katana lines */}
      <path d="M 26 26 L 74 74" strokeWidth="2" opacity="0.18" strokeLinecap="round" />
      <path d="M 74 26 L 26 74" strokeWidth="2" opacity="0.18" strokeLinecap="round" />
      <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.15" />
    </svg>
  );
};
