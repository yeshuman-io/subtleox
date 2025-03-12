import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="flex flex-col items-center gap-6">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <h1 className="text-3xl font-bold">Wipertech Evolved</h1>
        <p className="text-muted-foreground">next generation wiper technology</p>
        
      </main>
    </div>
  );
}
