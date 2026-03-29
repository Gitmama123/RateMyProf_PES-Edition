"use client";

// StarRating – displays filled/empty stars for a given rating
export default function StarRating({ rating, max = 5, size = "text-lg" }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = max - fullStars - (hasHalf ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={`full-${i}`} className={`${size} text-amber-400`}>
        ★
      </span>
    );
  }
  if (hasHalf) {
    stars.push(
      <span key="half" className={`${size} text-amber-400 opacity-60`}>
        ★
      </span>
    );
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className={`${size} text-gray-600`}>
        ★
      </span>
    );
  }

  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}
