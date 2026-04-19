import 'package:flutter/material.dart';

import '../../../models/bookmark.dart';
import '../../../widgets/job_card.dart';
import '../../../widgets/loading_overlay.dart';
import '../../../services/api_service.dart';
import '../job_detail_screen.dart';

class BookmarksTab extends StatefulWidget {
  const BookmarksTab({super.key});

  @override
  State<BookmarksTab> createState() => _BookmarksTabState();
}

class _BookmarksTabState extends State<BookmarksTab> {
  final ApiService _apiService = ApiService.instance;
  List<Bookmark> _bookmarks = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadBookmarks();
  }

  Future<void> _loadBookmarks() async {
    _safeSetState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final bookmarks = await _apiService.getBookmarks();
      _safeSetState(() {
        _bookmarks = bookmarks;
      });
    } catch (e) {
      _safeSetState(() {
        _error = e.toString();
      });
    } finally {
      _safeSetState(() {
        _isLoading = false;
      });
    }
  }

  void _safeSetState(VoidCallback fn) {
    if (!mounted) return;
    setState(fn);
  }

  Future<void> _removeBookmark(String jobId) async {
    try {
      await _apiService.removeBookmark(jobId);
      await _loadBookmarks();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bookmark removed')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Remove bookmark failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bookmarks'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: _error != null
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _error!,
                      style: TextStyle(color: Theme.of(context).colorScheme.error),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadBookmarks,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
            : RefreshIndicator(
                onRefresh: _loadBookmarks,
                child: ListView(
                  padding: const EdgeInsets.only(bottom: 16),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text(
                        'Saved jobs',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ),
                    if (_bookmarks.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                        child: Text(
                          'You have not saved any jobs yet. Use the job search to bookmark opportunities.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      )
                    else ..._bookmarks.map(
                      (bookmark) {
                        final job = bookmark.job;
                        if (job == null) {
                          return Card(
                            margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                            child: ListTile(
                              title: const Text('Bookmarked job no longer available'),
                              subtitle: Text('Saved at ${bookmark.createdAt}'),
                            ),
                          );
                        }
                        return JobCard(
                          key: ValueKey(bookmark.id),
                          job: job,
                          isBookmarked: true,
                          onBookmark: () => _removeBookmark(job.id),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => JobDetailScreen(job: job),
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}
