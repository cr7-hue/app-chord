"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Song } from '@/types'; // Song type now has chords as string
import { db } from "@/lib/firebaseConfig"; // Import db from firebaseConfig
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Updated schema: chords is now a single string
const songFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  chords: z.string().default("") // Cambiamos de optional a default string vacío
});

type SongFormValues = z.infer<typeof songFormSchema>;

interface SongFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Song | null;
  onSubmit: (data: SongFormValues, id?: string) => Promise<void>;
}

const defaultFormValues: SongFormValues = {
  title: "",
  chords: "",
};

export default function SongForm({ isOpen, onClose, initialData, onSubmit }: SongFormProps) {
  const form = useForm<SongFormValues>({
    resolver: zodResolver(songFormSchema),
    defaultValues: initialData 
      ? { title: initialData.title, chords: initialData.chords }
      : defaultFormValues,
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset(
        initialData
          ? { title: initialData.title, chords: initialData.chords }
          : defaultFormValues
      );
    }
  }, [initialData, isOpen, form]);

  const handleSubmit = async (data: SongFormValues) => {
    try {
      await onSubmit(data, initialData?.id);
      onClose();
    } catch (e) {
      console.error("Error handling form submit: ", e);
      // Optionally, show an error message to the user
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg md:max-w-xl bg-card border-border text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-primary pb-2">
            {initialData ? "Edit Song" : "Add New Song"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {initialData ? "Update the details of your song." : "Fill in the details for the new song."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
            <ScrollArea className="max-h-[60vh] pr-6">
              <div className="space-y-6 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-primary">Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter song title" {...field} className="bg-input text-foreground border-border focus:ring-ring" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    )} />

                <FormField
                  control={form.control}
                  name="chords"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-primary">Chords</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter all song chords here..."
                          rows={10} // Adjusted rows for a single chord block
                          {...field} className="bg-input text-foreground border-border focus:ring-ring font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="border-primary text-primary hover:bg-primary/10">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {initialData ? "Save Changes" : "Add Song"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
