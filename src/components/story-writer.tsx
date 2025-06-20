"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateNextSentence } from '@/ai/flows/generate-next-sentence';
import type { GenerateNextSentenceInput } from '@/ai/flows/generate-next-sentence';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Download, Loader2 } from 'lucide-react';
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
                word: 'once',
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
      <header className="text-center shrink-0 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 mb-4 md:mb-8 border-b-2 border-primary/20 pb-4">
        <h1 className="text-5xl font-playfair-display font-bold text-primary tracking-wider">The story you never wrote</h1>
        <h2 className="text-lg text-muted-foreground mt-2 italic">The story unfolds...</h2>
      </header>

      <main className="flex-grow flex flex-col items-center w-full max-w-4xl mx-auto min-h-0 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
        <div id="story-output" className="w-full flex-grow relative mb-6 rounded-lg border border-border bg-secondary/50 shadow-lg">
          <ScrollArea className="absolute inset-0">
            <div className="p-6 md:p-8">
              {isLoading && story.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                story.map((sentence, index) => (
                  <p key={index} className="mb-6 text-lg leading-loose tracking-wide animate-in fade-in duration-1000">
                    {sentence}
                  </p>
                ))
              )}
              <div ref={storyEndRef} />
            </div>
          </ScrollArea>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              id="wordInput"
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value.split(' ')[0])}
              placeholder="Offer a word..."
              className="flex-grow text-base"
              disabled={isLoading}
              required
            />
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
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
            </Button>
          </div>
        </form>

        <footer className="mt-8 flex gap-4 shrink-0">
          <Button id="saveStory" variant="outline" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Chapter
          </Button>
          <Button id="exportStory" variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export to .txt
          </Button>
        </footer>
      </main>
    </div>
  );
}
