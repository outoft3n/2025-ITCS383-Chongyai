import 'package:flutter/material.dart';
import '../models/job.dart';

class JobCard extends StatelessWidget {
  final Job job;
  final VoidCallback? onTap;
  final bool isBookmarked;
  final VoidCallback? onBookmark;

  const JobCard({
    super.key,
    required this.job,
    this.onTap,
    this.isBookmarked = false,
    this.onBookmark,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(job.title, style: Theme.of(context).textTheme.titleMedium),
                  ),
                  IconButton(
                    onPressed: onBookmark,
                    icon: Icon(isBookmarked ? Icons.bookmark : Icons.bookmark_border),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(job.description, maxLines: 2, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  Chip(label: Text(job.location)),
                  Chip(label: Text(job.jobType.replaceAll('_', ' ').toLowerCase())),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
