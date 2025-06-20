"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateNextSentence } from '@/ai/flows/generate-next-sentence';
import type { GenerateNextSentenceInput } from '@/ai/flows/generate-next-sentence';
import { Save, Download, Loader2, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type Mood = 'Dreamy' | 'Dark' | 'Motivational';

export function StoryWriter() {
  const [story, setStory] = useState<string[]>([]);
  const [word, setWord] = useState('');
  const [mood, setMood] = useState<Mood>('Dreamy');
  const [isLoading, setIsLoading] = useState(true);

  const storyEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    storyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const getInitialSentence = async () => {
        setIsLoading(true);
        try {
            const input: GenerateNextSentenceInput = {
                word: 'once upon a time',
                storySoFar: '',
                mood: 'Dreamy',
            };
            const result = await generateNextSentence(input);
            if (result.nextSentence) {
                setStory([result.nextSentence]);
            }
        } catch (err) {
            toast({
              variant: "destructive",
              title: "Failed to start the story",
              description: "There was a problem with the AI. Please refresh the page.",
            })
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    getInitialSentence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (story.length > 1) {
      scrollToBottom();
    }
  }, [story]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || isLoading) return;

    setIsLoading(true);
    try {
        const input: GenerateNextSentenceInput = {
            word,
            storySoFar: story.join(' '),
            mood,
        };
        const result = await generateNextSentence(input);
        if (result.nextSentence) {
            setStory(prev => [...prev, result.nextSentence]);
            setWord('');
        }
    } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed to continue the story",
          description: "There was a problem with the AI. Please try again.",
        })
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSave = () => {
    // Note: Firestore saving logic is not implemented as Firebase config is not available.
    toast({
      title: "Save Chapter",
      description: "This feature is not yet implemented.",
    });
  };

  const handleExport = () => {
    if (story.length === 0) {
      toast({
        variant: "destructive",
        title: "Nothing to export",
        description: "Your story is empty.",
      });
      return;
    }
    const fullStory = story.join('\n\n');
    const blob = new Blob([fullStory], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'the-story-you-never-wrote.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Story Exported",
      description: "Your story has been downloaded as a .txt file.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <header className="flex-shrink-0 border-b border-border/20 px-6 sm:px-8 py-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground/90">The story you never wrote</h1>
        <h2 className="text-sm text-muted-foreground italic mt-1">An eternal collaboration</h2>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-8 py-12 overflow-y-auto">
        <div id="story-output" className="w-full space-y-6 text-lg/relaxed tracking-wide">
          {isLoading && story.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            story.map((sentence, index) => (
              <p key={index} className="animate-in fade-in duration-1000">
                {sentence}
              </p>
            ))
          )}
          <div ref={storyEndRef} />
        </div>
      </main>

      <div className="flex-shrink-0 border-t border-border/20 px-4 sm:px-8 py-4 bg-background">
        <div className="w-full max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Input
                id="wordInput"
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value.split(' ')[0])}
                placeholder="Offer a single word..."
                className="flex-grow text-base bg-transparent border-0 border-b rounded-none border-border/50 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary transition-colors"
                disabled={isLoading}
                required
              />
              <div className="flex w-full sm:w-auto gap-4">
                <Select value={mood} onValueChange={(value: Mood) => setMood(value)} disabled={isLoading}>
                  <SelectTrigger id="moodSelector" className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dreamy">Dreamy</SelectItem>
                    <SelectItem value="Dark">Dark</SelectItem>
                    <SelectItem value="Motivational">Motivational</SelectItem>
                  </SelectContent>
                </Select>
                <Button id="submitWord" type="submit" className="w-full sm:w-auto" disabled={isLoading || !word.trim()}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles />}
                  Continue
                </Button>
              </div>
            </div>
          </form>

          <footer className="flex gap-4 justify-center items-center pt-4">
            <Button id="saveStory" variant="ghost" size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button id="exportStory" variant="ghost" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
}
