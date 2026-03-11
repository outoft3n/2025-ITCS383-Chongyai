'use client';

import React from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import { Spinner } from '@/components/ui/Spinner';
import { useBookmarks } from '@/hooks/useBookmarks';

export default function BookmarksPage() {
  const { bookmarks, isLoading, error } = useBookmarks();

  let content: React.ReactNode;
  if (isLoading) {
    content = <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  } else if (error) {
    content = <div className="text-center py-8 text-red-500">{error}</div>;
  } else if (bookmarks.length === 0) {
    content = <div className="text-center py-16 text-gray-400">No saved jobs yet. Bookmark jobs while browsing!</div>;
  } else {
    content = (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {bookmarks.map((bookmark) => (
          bookmark.job && <JobCard key={bookmark.id} job={bookmark.job} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-500 text-sm">Jobs you&apos;ve bookmarked for later</p>
      </div>
      {content}
    </div>
  );
}
