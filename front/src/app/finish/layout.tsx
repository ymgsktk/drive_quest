// app/drive-quest/layout.tsx
import Script from "next/script";

export default function DriveQuestLayout({ children }: { children: React.ReactNode }) {
    console.log("あ",process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  return (
    <>
      <Script
        id="google-maps"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}
        strategy="afterInteractive"
        />
      {children}
    </>
  );
}