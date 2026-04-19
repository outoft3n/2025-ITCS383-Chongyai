import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:go_router/go_router.dart';

import '../../../core/recruiter_display.dart';
import '../../../models/interview.dart';
import '../../../services/api_service.dart';
import '../../../widgets/loading_overlay.dart';

class InterviewsTab extends StatefulWidget {
  const InterviewsTab({super.key});

  @override
  State<InterviewsTab> createState() => _InterviewsTabState();
}

class _InterviewsTabState extends State<InterviewsTab> {
  final ApiService _apiService = ApiService.instance;
  List<Interview> _interviews = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadInterviews();
  }

  Future<void> _loadInterviews() async {
    _safeSetState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final interviews = await _apiService.getMyInterviews();
      _safeSetState(() {
        _interviews = interviews;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Interviews'),
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
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadInterviews,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              )
            : _interviews.isEmpty
                ? const Center(
                    child: Text('No interviews scheduled yet.'),
                  )
                : RefreshIndicator(
                    onRefresh: _loadInterviews,
                    child: ListView(
                      padding: const EdgeInsets.only(bottom: 16),
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'My Interviews',
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Your scheduled and past interviews',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                        ..._interviews.map((interview) => _buildInterviewCard(interview)),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildInterviewCard(Interview interview) {
    final dateFormat = DateFormat('EEEE, MMMM d, yyyy');
    final timeFormat = DateFormat('h:mm a');
    final scheduledDate = DateTime.parse(interview.scheduledAt);
    final company =
        companyNameFromRecruiterJson(interview.application?.job?.recruiter);

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
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        interview.application?.job?.title ?? 'Interview',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (company != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          company,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                _buildStatusBadge(interview.status),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.calendar_today, size: 16, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 8),
                Text(
                  dateFormat.format(scheduledDate),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.access_time, size: 16, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 8),
                Text(
                  '${timeFormat.format(scheduledDate)} (${interview.duration} min)',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.location_on, size: 16, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 8),
                Text(
                  interview.type.replaceAll('_', ' '),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
            if (interview.notes != null && interview.notes!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                interview.notes!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontStyle: FontStyle.italic,
                  color: Colors.grey[600],
                ),
              ),
            ],
            if (interview.type == 'VIDEO' && interview.conferenceId != null && interview.status == 'SCHEDULED') ...[
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () {
                  context.push('/conference');
                },
                icon: Icon(Icons.videocam),
                label: Text('Join Video Interview'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.secondary,
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
    switch (status) {
      case 'SCHEDULED':
        color = Colors.blue;
        break;
      case 'COMPLETED':
        color = Colors.green;
        break;
      case 'CANCELLED':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}