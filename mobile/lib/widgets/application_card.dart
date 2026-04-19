import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/application.dart';
import '../widgets/status_badge.dart';

class ApplicationCard extends StatelessWidget {
  final Application application;
  final VoidCallback? onTap;
  final bool showApplicant;
  final bool showViewProfile;
  final bool showScheduleInterview;
  final VoidCallback? onScheduleInterview;
  final Function(String, String)? onStatusChange;

  const ApplicationCard({
    super.key,
    required this.application,
    this.onTap,
    this.showApplicant = false,
    this.showViewProfile = false,
    this.showScheduleInterview = false,
    this.onScheduleInterview,
    this.onStatusChange,
  });

  @override
  Widget build(BuildContext context) {
    final companyName = application.job?.recruiter?['companyName'];
    final dateFormat = DateFormat('MMM d, yyyy');

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          application.job?.title ?? 'Job Application',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (companyName != null) ...[
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.business, size: 16, color: Colors.grey),
                              const SizedBox(width: 4),
                              Text(
                                companyName,
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ],
                        if (application.job?.location != null) ...[
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Icon(Icons.location_on, size: 16, color: Colors.grey),
                              const SizedBox(width: 4),
                              Text(
                                application.job!.location,
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[500],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  StatusBadge(status: application.status),
                ],
              ),
              if (showApplicant && application.applicant != null) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Applicant: ${application.applicant!.firstName} ${application.applicant!.lastName}',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                    if (showViewProfile) ...[
                      TextButton.icon(
                        onPressed: () {
                          // Navigate to applicant profile
                        },
                        icon: Icon(Icons.person, size: 16),
                        label: Text('View Profile'),
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
              if (application.coverLetter != null && application.coverLetter!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  '"${application.coverLetter}"',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontStyle: FontStyle.italic,
                    color: Colors.grey[600],
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  Text(
                    'Applied ${dateFormat.format(DateTime.parse(application.createdAt))}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[500],
                    ),
                  ),
                  const Spacer(),
                  if (showScheduleInterview && onScheduleInterview != null) ...[
                    OutlinedButton.icon(
                      onPressed: onScheduleInterview,
                      icon: Icon(Icons.calendar_today, size: 16),
                      label: Text('Schedule Interview'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        textStyle: const TextStyle(fontSize: 12),
                      ),
                    ),
                  ],
                  if (onStatusChange != null) ...[
                    const SizedBox(width: 8),
                    DropdownButton<String>(
                      value: application.status,
                      items: const [
                        DropdownMenuItem(value: 'APPLIED', child: Text('Applied')),
                        DropdownMenuItem(value: 'REVIEWING', child: Text('Under Review')),
                        DropdownMenuItem(value: 'INTERVIEWING', child: Text('Interviewing')),
                        DropdownMenuItem(value: 'ACCEPTED', child: Text('Accepted')),
                        DropdownMenuItem(value: 'REJECTED', child: Text('Rejected')),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          onStatusChange!(application.id, value);
                        }
                      },
                      underline: const SizedBox(),
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
