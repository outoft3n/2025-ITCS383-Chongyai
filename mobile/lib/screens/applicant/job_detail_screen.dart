import 'package:flutter/material.dart';

import '../../services/api_service.dart';
import '../../models/job.dart';

class JobDetailScreen extends StatefulWidget {
  final Job job;

  const JobDetailScreen({super.key, required this.job});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  final ApiService _api = ApiService.instance;
  bool _isApplying = false;
  bool _isBookmarking = false;
  bool _bookmarked = false;

  Job get job => widget.job;

  @override
  void initState() {
    super.initState();
    _loadBookmarkState();
  }

  Future<void> _loadBookmarkState() async {
    try {
      final bookmarked = await _api.checkBookmark(job.id);
      if (!mounted) return;
      setState(() => _bookmarked = bookmarked);
    } catch (_) {
      // ignore: non-critical (icon just won't reflect server state)
    }
  }

  Future<void> _toggleBookmark() async {
    if (_isBookmarking) return;
    setState(() => _isBookmarking = true);
    try {
      if (_bookmarked) {
        await _api.removeBookmark(job.id);
      } else {
        await _api.addBookmark(job.id);
      }
      if (!mounted) return;
      setState(() => _bookmarked = !_bookmarked);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_bookmarked ? 'Bookmarked' : 'Bookmark removed')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Bookmark failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _isBookmarking = false);
    }
  }

  Future<void> _apply() async {
    if (_isApplying) return;

    final coverLetter = await showDialog<String?>(
      context: context,
      builder: (context) {
        final controller = TextEditingController();
        return AlertDialog(
          title: const Text('Apply for this job'),
          content: TextField(
            controller: controller,
            decoration: const InputDecoration(
              labelText: 'Cover letter (optional)',
              border: OutlineInputBorder(),
            ),
            maxLines: 4,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(null),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(controller.text.trim()),
              child: const Text('Apply'),
            ),
          ],
        );
      },
    );

    if (!mounted || coverLetter == null) return;

    setState(() => _isApplying = true);
    try {
      await _api.applyJob(job.id, coverLetter: coverLetter.isEmpty ? null : coverLetter);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Application submitted')),
      );
    } catch (e) {
      if (!mounted) return;
      final message = e is ApiException && e.statusCode == 409 ? 'You already applied to this job.' : 'Apply failed: $e';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) setState(() => _isApplying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(job.title),
        actions: [
          IconButton(
            onPressed: _isBookmarking ? null : _toggleBookmark,
            icon: Icon(_bookmarked ? Icons.bookmark : Icons.bookmark_border),
            tooltip: _bookmarked ? 'Remove bookmark' : 'Bookmark',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            Text(
              job.title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text(job.location)),
                Chip(label: Text(job.jobType.replaceAll('_', ' ').toLowerCase())),
                if (job.salaryMin != null || job.salaryMax != null)
                  Chip(
                    label: Text(
                      '${job.salaryMin != null ? '฿${job.salaryMin}' : ''}${job.salaryMin != null && job.salaryMax != null ? ' - ' : ''}${job.salaryMax != null ? '฿${job.salaryMax}' : ''}',
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 24),
            Text('Job description', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(job.description),
            const SizedBox(height: 24),
            Text('Requirements', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(job.requirements),
            if (job.skills.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text('Skills', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: job.skills.map((skill) => Chip(label: Text(skill))).toList(),
              ),
            ],
            const SizedBox(height: 32),
            FilledButton(
              onPressed: _isApplying ? null : _apply,
              child: Text(_isApplying ? 'Applying…' : 'Apply for this job'),
            ),
          ],
        ),
      ),
    );
  }
}
