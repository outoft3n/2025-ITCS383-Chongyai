import 'package:flutter/material.dart';

import '../../models/job.dart';

class JobDetailScreen extends StatelessWidget {
  final Job job;

  const JobDetailScreen({super.key, required this.job});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(job.title)),
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
                  Chip(label: Text(
                    '${job.salaryMin != null ? '฿${job.salaryMin}' : ''}${job.salaryMin != null && job.salaryMax != null ? ' - ' : ''}${job.salaryMax != null ? '฿${job.salaryMax}' : ''}',
                  )),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              'Job description',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(job.description),
            const SizedBox(height: 24),
            Text(
              'Requirements',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(job.requirements),
            if (job.skills.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text(
                'Skills',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: job.skills.map((skill) => Chip(label: Text(skill))).toList(),
              ),
            ],
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {},
              child: const Text('Apply for this job'),
            ),
          ],
        ),
      ),
    );
  }
}
