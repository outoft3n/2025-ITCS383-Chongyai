import 'package:flutter/material.dart';

import '../models/application.dart';
import '../widgets/status_badge.dart';

class ApplicationCard extends StatelessWidget {
  final Application application;
  final VoidCallback? onTap;

  const ApplicationCard({super.key, required this.application, this.onTap});

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
              Text(application.job?.title ?? 'Application', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text(application.job?.location ?? '', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 12),
              StatusBadge(status: application.status),
            ],
          ),
        ),
      ),
    );
  }
}
