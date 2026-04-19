import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../models/invitation.dart';
import '../../../services/api_service.dart';
import '../../../widgets/loading_overlay.dart';

class InvitationsTab extends StatefulWidget {
  const InvitationsTab({super.key});

  @override
  State<InvitationsTab> createState() => _InvitationsTabState();
}

class _InvitationsTabState extends State<InvitationsTab> {
  final ApiService _apiService = ApiService.instance;
  List<Invitation> _invitations = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadInvitations();
  }

  Future<void> _loadInvitations() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final invitations = await _apiService.getSentInvitations();
      setState(() {
        _invitations = invitations;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return LoadingOverlay(
      isLoading: _isLoading,
      child: _error != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _error!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadInvitations,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : _invitations.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('No invitations sent yet.'),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () {
                          // Navigate to search
                          DefaultTabController.of(context).animateTo(5); // Search tab index
                        },
                        icon: Icon(Icons.search),
                        label: Text('Find Applicants'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadInvitations,
                  child: ListView(
                    padding: const EdgeInsets.only(bottom: 16),
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Sent Invitations',
                                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${_invitations.length} invitation(s) sent',
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            ElevatedButton.icon(
                              onPressed: () {
                                DefaultTabController.of(context).animateTo(5); // Search tab index
                              },
                              icon: Icon(Icons.search, size: 16),
                              label: Text('Search Applicants'),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                textStyle: const TextStyle(fontSize: 12),
                              ),
                            ),
                          ],
                        ),
                      ),
                      ..._invitations.map((invitation) => _buildInvitationCard(invitation)),
                    ],
                  ),
                ),
    );
  }

  Widget _buildInvitationCard(Invitation invitation) {
    final dateFormat = DateFormat('MMM d, yyyy');
    final applicantName = '${invitation.applicant?['firstName']} ${invitation.applicant?['lastName']}';
    final applicantEmail = invitation.applicant?['email'];
    final skills = invitation.applicant?['applicantProfile']?['skills'] as List<dynamic>? ?? [];

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
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
                  backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  child: Text(
                    '${invitation.applicant?['firstName']?[0]}${invitation.applicant?['lastName']?[0]}',
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
                        applicantName,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (applicantEmail != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          applicantEmail,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                      if (skills.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Wrap(
                          spacing: 4,
                          runSpacing: 2,
                          children: skills.take(3).map((skill) => Chip(
                            label: Text(
                              skill as String,
                              style: const TextStyle(fontSize: 10),
                            ),
                            backgroundColor: Colors.grey.withOpacity(0.1),
                            padding: EdgeInsets.zero,
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          )).toList(),
                        ),
                        if (skills.length > 3) ...[
                          Text(
                            '+${skills.length - 3} more',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey[500],
                            ),
                          ),
                        ],
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _buildStatusBadge(invitation.status),
                    const SizedBox(height: 8),
                    OutlinedButton(
                      onPressed: () {
                        // Navigate to applicant profile
                      },
                      child: Text('View Profile'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        textStyle: const TextStyle(fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        invitation.job?['title'] ?? 'Job',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          if (invitation.job?['jobType'] != null) ...[
                            Chip(
                              label: Text(
                                invitation.job!['jobType'],
                                style: const TextStyle(fontSize: 12),
                              ),
                              backgroundColor: Colors.blue.withOpacity(0.1),
                              labelStyle: TextStyle(color: Colors.blue[700]),
                              padding: EdgeInsets.zero,
                              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                          ],
                          if (invitation.job?['location'] != null) ...[
                            Text(
                              invitation.job!['location'],
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
                Text(
                  'Sent ${dateFormat.format(invitation.createdAt)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
            if (invitation.message != null && invitation.message!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '"${invitation.message}"',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
            if (invitation.status == 'ACCEPTED') ...[
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () {
                    // Navigate to job applications
                  },
                  child: Text('View Application'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    IconData icon;
    switch (status) {
      case 'PENDING':
        color = Colors.orange;
        icon = Icons.schedule;
        break;
      case 'ACCEPTED':
        color = Colors.green;
        icon = Icons.check_circle;
        break;
      case 'REJECTED':
        color = Colors.red;
        icon = Icons.cancel;
        break;
      default:
        color = Colors.grey;
        icon = Icons.help;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            status,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}