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
import { Music, Save } from "lucide-react";

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
      form.reset();
      onClose();
    } catch (e) {
      console.error("Error handling form submit: ", e);
      // Optionally, show an error message to the user
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            {initialData ? "Edit Song" : "Add New Song"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Update the details of your song below." 
              : "Fill in the details for your new song below."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Song Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter song title..." 
                      {...field}
                      className="transition-all duration-200 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chords</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter song chords..."
                      className="font-mono min-h-[200px] resize-y transition-all duration-200 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 transition-all duration-200 hover:bg-primary/90"
                disabled={form.formState.isSubmitting}
              >
                <Save className="h-4 w-4" />
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
