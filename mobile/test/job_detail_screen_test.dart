import 'package:chongyai_mobile/models/job.dart';
import 'package:chongyai_mobile/screens/applicant/job_detail_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Job _job() => Job.fromJson({
      'id': 'job-1',
      'recruiterId': 'rec-1',
      'title': 'Senior Flutter Engineer',
      'description': 'Build and maintain mobile features',
      'requirements': 'Flutter, Dart, testing',
      'location': 'Bangkok',
      'jobType': 'FULL_TIME',
      'salaryMin': 50000,
      'salaryMax': 90000,
      'skills': ['Flutter', 'Dart'],
      'createdAt': '2026-04-19T10:00:00.000Z',
      'updatedAt': '2026-04-19T10:00:00.000Z',
    });

void main() {
  testWidgets('JobDetailScreen renders sections and apply dialog cancel flow', (tester) async {
    await tester.pumpWidget(MaterialApp(home: JobDetailScreen(job: _job())));
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Senior Flutter Engineer'), findsWidgets);
    expect(find.text('Job description'), findsOneWidget);
    expect(find.text('Requirements'), findsOneWidget);
    expect(find.text('Skills'), findsOneWidget);
    expect(find.text('Similar jobs'), findsOneWidget);

    await tester.tap(find.text('Apply for this job'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Apply for this job'), findsWidgets);
    expect(find.text('Cover letter (optional)'), findsOneWidget);

    await tester.tap(find.text('Cancel'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.byType(AlertDialog), findsNothing);
  });

  testWidgets('JobDetailScreen bookmark action handles failure path gracefully', (tester) async {
    await tester.pumpWidget(MaterialApp(home: JobDetailScreen(job: _job())));
    await tester.pump(const Duration(milliseconds: 300));

    await tester.tap(find.byTooltip('Bookmark'));
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.byType(JobDetailScreen), findsOneWidget);
  });
}
