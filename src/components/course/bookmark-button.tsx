"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

export function BookmarkButton({ lessonId, initiallyBookmarked }: { lessonId: string; initiallyBookmarked: boolean }) {
  const [bookmarked, setBookmarked] = useState(initiallyBookmarked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      toast.error("Please log in");
      return;
    }

    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("lesson_id", lessonId);
      setBookmarked(false);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, lesson_id: lessonId });
      setBookmarked(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="btn-secondary gap-2 text-sm"
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this lesson"}
    >
      {bookmarked ? <BookmarkCheck size={16} className="text-brand-600" /> : <Bookmark size={16} />}
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
