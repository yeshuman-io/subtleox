import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold">Welcome to Your App</h1>
        <p className="text-muted-foreground">A clean starting point for your project</p>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </main>
    </div>
  );
}
