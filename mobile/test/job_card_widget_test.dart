import 'package:chongyai_mobile/models/job.dart';
import 'package:chongyai_mobile/widgets/job_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Job _job() => Job.fromJson({
      'id': 'job-1',
      'recruiterId': 'rec-1',
      'title': 'Flutter Dev',
      'description': 'Build app features',
      'requirements': 'Dart',
      'location': 'Bangkok',
      'jobType': 'FULL_TIME',
      'skills': ['Flutter'],
      'createdAt': '2026-04-19T10:00:00.000Z',
      'updatedAt': '2026-04-19T10:00:00.000Z',
    });

void main() {
  testWidgets('JobCard shows job info and tap callback', (tester) async {
    var tapped = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: JobCard(
            job: _job(),
            onTap: () => tapped = true,
          ),
        ),
      ),
    );

    expect(find.text('Flutter Dev'), findsOneWidget);
    expect(find.text('Build app features'), findsOneWidget);
    expect(find.text('Bangkok'), findsOneWidget);
    expect(find.text('full time'), findsOneWidget);

    await tester.tap(find.byType(InkWell).first);
    expect(tapped, isTrue);
  });

  testWidgets('JobCard shows bookmark icon and triggers callback', (tester) async {
    var tapped = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: JobCard(
            job: _job(),
            isBookmarked: true,
            onBookmark: () => tapped = true,
          ),
        ),
      ),
    );

    expect(find.byIcon(Icons.bookmark), findsOneWidget);
    await tester.tap(find.byIcon(Icons.bookmark));
    expect(tapped, isTrue);
  });
}
