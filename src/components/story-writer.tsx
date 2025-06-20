
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateNextSentence } from '@/ai/flows/generate-next-sentence';
import type { GenerateNextSentenceInput } from '@/ai/flows/generate-next-sentence';
import { Save, Download, Loader2, Sparkles, Settings, KeyRound } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Mood = 'Dreamy' | 'Dark' | 'Motivational';

export function StoryWriter() {
  const [story, setStory] = useState<string[]>([]);
  const [word, setWord] = useState('');
  const [mood, setMood] = useState<Mood>('Dreamy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [appStatus, setAppStatus] = useState<'loading' | 'needs_key' | 'ready'>('loading');
  const [apiKey, setApiKey] = useState('');
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const storyEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    storyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // On mount, check for API key and set initial status
  useEffect(() => {
    const storedApiKey = localStorage.getItem('user-api-key') || '';
    setTempApiKey(storedApiKey);
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setAppStatus('ready');
    } else {
      setAppStatus('needs_key');
      setIsApiDialogOpen(true);
    }
  }, []);

  // Fetch initial sentence when app is ready
  useEffect(() => {
    if (appStatus !== 'ready' || story.length > 0 || !apiKey) return;

    const getInitialSentence = async () => {
        setIsGenerating(true);
        try {
            const input: GenerateNextSentenceInput = {
                word: 'once upon a time',
                storySoFar: '',
                mood: 'Dreamy',
                apiKey: apiKey,
            };
            const result = await generateNextSentence(input);
            if (result.nextSentence) {
                setStory([result.nextSentence]);
            }
        } catch (err) {
            toast({
              variant: "destructive",
              title: "Failed to start the story",
              description: "There was a problem with the AI. Your API key might be invalid. Please check it and try again.",
            });
            setAppStatus('needs_key'); // Revert status if key is bad
            setIsApiDialogOpen(true);
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };
    
    getInitialSentence();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appStatus, apiKey]);

  useEffect(() => {
    if (story.length > 1) {
      scrollToBottom();
    }
  }, [story]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || isGenerating) return;
    
    if (appStatus === 'needs_key' || !apiKey) {
      toast({
          variant: "destructive",
          title: "API Key Missing",
          description: "Please enter your API key in the settings before continuing.",
      });
      setIsApiDialogOpen(true);
      return;
    }

    setIsGenerating(true);
    const currentStory = story.join(' ');

    try {
        const input: GenerateNextSentenceInput = {
            word,
            storySoFar: currentStory,
            mood,
            apiKey: apiKey,
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
          description: "There was a problem with the AI. Please check your API key and try again.",
        })
        console.error(err);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSave = () => {
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

  const handleSaveApiKey = () => {
    if (tempApiKey) {
        setApiKey(tempApiKey);
        localStorage.setItem('user-api-key', tempApiKey);
        setIsApiDialogOpen(false);
        setAppStatus('ready');
        setStory([]); // Clear story to trigger re-fetch of initial sentence
        toast({
          title: "API Key Saved",
          description: "Your API key has been saved. Starting a new story...",
        });
    } else {
        toast({
            variant: "destructive",
            title: "API Key Empty",
            description: "Please enter a valid API key.",
        });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <header className="flex-shrink-0 border-b border-border/20 px-6 sm:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground/90">The story you never wrote</h1>
          <h2 className="text-sm text-muted-foreground italic mt-1">I already started writing for you...</h2>
        </div>
        <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">API Key Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>API Key Configuration</DialogTitle>
                    <DialogDescription>
                        Enter your Google AI API key here. It will be saved in your browser's local storage and will not be stored on our servers.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="apiKeyInput" className="text-right">
                            API Key
                        </Label>
                        <Input
                            id="apiKeyInput"
                            type="password"
                            value={tempApiKey}
                            onChange={(e) => setTempApiKey(e.target.value)}
                            className="col-span-3"
                            placeholder="Your Google AI API Key"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSaveApiKey}>Save key</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-8 py-12 overflow-y-auto">
        {appStatus === 'loading' && (
             <div className="flex items-center justify-center min-h-[40vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}
        {appStatus === 'needs_key' && (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                <KeyRound className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">API Key Required</h3>
                <p className="text-muted-foreground max-w-md">
                    To begin your creative journey, please provide your Google AI API key.
                </p>
                <Button onClick={() => setIsApiDialogOpen(true)} className="mt-6">
                    <Settings className="mr-2 h-4 w-4" />
                    Open Settings
                </Button>
            </div>
        )}
        {appStatus === 'ready' && (
          <div id="story-output" className="w-full space-y-6 text-lg/relaxed tracking-wide">
            {isGenerating && story.length === 0 ? (
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
        )}
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
                disabled={isGenerating || appStatus !== 'ready'}
                required
              />
              <div className="flex w-full sm:w-auto gap-4">
                <Select value={mood} onValueChange={(value: Mood) => setMood(value)} disabled={isGenerating || appStatus !== 'ready'}>
                  <SelectTrigger id="moodSelector" className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dreamy">Dreamy</SelectItem>
                    <SelectItem value="Dark">Dark</SelectItem>
                    <SelectItem value="Motivational">Motivational</SelectItem>
                  </SelectContent>
                </Select>
                <Button id="submitWord" type="submit" className="w-full sm:w-auto" disabled={isGenerating || appStatus !== 'ready' || !word.trim()}>
                  {isGenerating && story.length > 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles />}
                  Continue
                </Button>
              </div>
            </div>
          </form>

          <footer className="flex gap-4 justify-center items-center pt-4">
            <Button id="saveStory" variant="ghost" size="sm" onClick={handleSave} disabled={appStatus !== 'ready'}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button id="exportStory" variant="ghost" size="sm" onClick={handleExport} disabled={appStatus !== 'ready'}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
}
