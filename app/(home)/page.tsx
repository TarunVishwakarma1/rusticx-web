import CodeRain from '@/components/CodeRain';

export default function HomePage() {
  return (
    <div className="relative h-screen bg-[#0a0a0f] overflow-hidden">
      <CodeRain className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 flex items-center justify-center h-full text-white text-2xl font-bold">
        Code Rain Test
      </div>
    </div>
  );
}
