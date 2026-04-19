import 'package:flutter/material.dart';

import '../../../services/api_service.dart';
import '../../../widgets/loading_overlay.dart';

class SearchTab extends StatefulWidget {
  const SearchTab({super.key});

  @override
  State<SearchTab> createState() => _SearchTabState();
}

class _SearchTabState extends State<SearchTab> {
  final ApiService _apiService = ApiService.instance;
  final TextEditingController _queryController = TextEditingController();
  final TextEditingController _skillsController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _educationController = TextEditingController();
  final TextEditingController _experienceController = TextEditingController();

  List<Map<String, dynamic>> _results = [];
  bool _isSearching = false;
  String? _searchError;
  bool _hasSearched = false;

  @override
  void dispose() {
    _queryController.dispose();
    _skillsController.dispose();
    _locationController.dispose();
    _educationController.dispose();
    _experienceController.dispose();
    super.dispose();
  }

  Future<void> _performSearch() async {
    setState(() {
      _isSearching = true;
      _searchError = null;
      _hasSearched = true;
    });

    try {
      final results = await _apiService.searchApplicants(
        q: _queryController.text.trim().isEmpty ? null : _queryController.text.trim(),
        skills: _skillsController.text.trim().isEmpty ? null : _skillsController.text.trim(),
        location: _locationController.text.trim().isEmpty ? null : _locationController.text.trim(),
        education: _educationController.text.trim().isEmpty ? null : _educationController.text.trim(),
        experience: _experienceController.text.trim().isEmpty ? null : _experienceController.text.trim(),
      );
      setState(() {
        _results = results;
      });
    } catch (e) {
      setState(() {
        _searchError = e.toString();
      });
    } finally {
      setState(() {
        _isSearching = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return LoadingOverlay(
      isLoading: _isSearching,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Search Applicants',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Find candidates by skills, education, experience, and location.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 24),
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Search Filters',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _queryController,
                      decoration: const InputDecoration(
                        labelText: 'Name or Email',
                        hintText: 'Search by name or email...',
                        prefixIcon: Icon(Icons.search),
                        border: OutlineInputBorder(),
                      ),
                      onSubmitted: (_) => _performSearch(),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _skillsController,
                      decoration: const InputDecoration(
                        labelText: 'Skills (comma-separated)',
                        hintText: 'e.g. React, Python, SQL',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _locationController,
                      decoration: const InputDecoration(
                        labelText: 'Preferred Location',
                        hintText: 'e.g. Bangkok, Remote',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _educationController,
                      decoration: const InputDecoration(
                        labelText: 'Education keyword',
                        hintText: 'e.g. Computer Science',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _experienceController,
                      decoration: const InputDecoration(
                        labelText: 'Experience keyword',
                        hintText: 'e.g. Software Engineer',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _performSearch,
                        icon: const Icon(Icons.search),
                        label: const Text('Search'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (_searchError != null) ...[
              const SizedBox(height: 16),
              Text(
                _searchError!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ],
            if (_hasSearched && !_isSearching) ...[
              const SizedBox(height: 16),
              Text(
                '${_results.length} applicant(s) found',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
            if (_results.isNotEmpty) ...[
              const SizedBox(height: 16),
              ..._results.map((applicant) => _buildApplicantCard(applicant)),
            ],
            if (_hasSearched && _results.isEmpty && _searchError == null) ...[
              const SizedBox(height: 32),
              const Center(
                child: Text('No applicants found matching your filters.'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildApplicantCard(Map<String, dynamic> applicant) {
    final profile = applicant['applicantProfile'] as Map<String, dynamic>?;
    final skills = profile?['skills'] as List<dynamic>? ?? [];

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                  child: Text(
                    '${applicant['firstName'][0]}${applicant['lastName'][0]}',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${applicant['firstName']} ${applicant['lastName']}',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        applicant['email'],
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[500],
                        ),
                      ),
                      if (profile?['preferredLocation'] != null) ...[
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Icon(Icons.location_on, size: 14, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text(
                              profile!['preferredLocation'],
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                Column(
                  children: [
                    OutlinedButton(
                      onPressed: () {
                        // Navigate to applicant profile
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        textStyle: const TextStyle(fontSize: 12),
                      ),
                      child: const Text('View Profile'),
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton.icon(
                      onPressed: () {
                        // Open invite modal
                        _showInviteDialog(applicant);
                      },
                      icon: const Icon(Icons.send, size: 16),
                      label: const Text('Invite'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        textStyle: const TextStyle(fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            if (skills.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: skills.take(5).map((skill) => Chip(
                  label: Text(
                    skill as String,
                    style: const TextStyle(fontSize: 10),
                  ),
                  backgroundColor: Colors.grey.withValues(alpha: 0.1),
                  padding: EdgeInsets.zero,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                )).toList(),
              ),
            ],
            if (profile?['experience'] != null) ...[
              const SizedBox(height: 8),
              Text(
                'Experience: ${profile!['experience']}',
                style: Theme.of(context).textTheme.bodySmall,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            if (profile?['education'] != null) ...[
              const SizedBox(height: 4),
              Text(
                'Education: ${profile!['education']}',
                style: Theme.of(context).textTheme.bodySmall,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showInviteDialog(Map<String, dynamic> applicant) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Send Job Invitation'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Invite ${applicant['firstName']} ${applicant['lastName']} to apply for a job?'),
            const SizedBox(height: 16),
            // TODO: Add job selection and message input
            const Text('Job selection and message input to be implemented'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement send invitation
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Invitation feature to be implemented')),
              );
            },
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }
}