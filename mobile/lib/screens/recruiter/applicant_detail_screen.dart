import 'package:flutter/material.dart';

class ApplicantDetailScreen extends StatelessWidget {
  const ApplicantDetailScreen({
    super.key,
    required this.applicant,
  });

  final Map<String, dynamic> applicant;

  @override
  Widget build(BuildContext context) {
    final profile = applicant['applicantProfile'] as Map<String, dynamic>?;
    final skills = profile?['skills'] as List<dynamic>? ?? [];
    final fullName = '${applicant['firstName'] ?? ''} ${applicant['lastName'] ?? ''}'.trim();

    return Scaffold(
      appBar: AppBar(title: const Text('Applicant Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    child: Text(
                      fullName.isNotEmpty ? fullName.substring(0, 1).toUpperCase() : '?',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          fullName.isNotEmpty ? fullName : 'Unknown applicant',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 4),
                        Text(applicant['email']?.toString() ?? '-'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Summary', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 12),
                  _kv('Preferred Location', profile?['preferredLocation']?.toString()),
                  _kv('Experience', profile?['experience']?.toString()),
                  _kv('Education', profile?['education']?.toString()),
                  _kv('Job Preference', profile?['jobPreference']?.toString()),
                ],
              ),
            ),
          ),
          if (skills.isNotEmpty) ...[
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Skills', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: skills.map((skill) => Chip(label: Text(skill.toString()))).toList(),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _kv(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text('$label: ${value == null || value.isEmpty ? "-" : value}'),
    );
  }
}
